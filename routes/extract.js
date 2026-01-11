import { Router } from "express";
import authenticate from "../authMiddleware.js";
import Job from "../models/Job.js";
import safeJsonParse from "../utils/safeJsonParse.js";
import validateJob from "../utils/validateJob.js";
import llamacppService from "../services/llamacppService.js";
import openRouterService from "../services/openRouterService.js";
import { performance } from "perf_hooks"; 

const router = Router();
const { extractWithOpenRouter } = openRouterService;
const { extractWithLlamacpp } = llamacppService;

router.post("/extract", authenticate, async (req, res) => {

  const startTime = performance.now();
  let extractionProviderUsed = "None";

  try {
    const { pageText, sourceUrl, resumeId } = req.body;

    if (!pageText || pageText.length < 50) {
      return res.status(400).json({ error: "Insufficient page text" });
    }

    const cleanText = pageText.replace(/["\\]/g, ' ').replace(/\t/g, ' ').replace(/ {2,}/g, ' ').trim();
    const topPart = cleanText.slice(0, 3500);
    const bottomPart = cleanText.slice(-1500);
    const pageTextSnippet = topPart + "\n[...]\n" + bottomPart;

    let responseFromAi = null

    try {
      console.log('Attempting open router...')
      extractionProviderUsed = "OpenRouter (mimo-v2-flash:free)";
      responseFromAi = await extractWithOpenRouter(pageTextSnippet);
    } catch (primaryErr) {
      extractionProviderUsed = "EC2 (Llama-server)";
      console.error("OpenRouter failed, switching to EC2 Fallback: ", primaryErr.message);
      try {
        responseFromAi = await extractWithLlamacpp(pageTextSnippet);
      } catch (secondaryErr) {
        console.error("EC2 Fallback also failed:", secondaryErr.message);
        throw new Error("Both AI providers are currently unavailable.");
      }
    }

    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`Provider: ${extractionProviderUsed} | Time: ${duration}s`);

    const parsed = safeJsonParse(responseFromAi);
    const jobData = validateJob(parsed || {});

    const job = await Job.create({
        userId: req.user.id,
        ...jobData,
        resumeId: resumeId || null,
        sourceUrl,
        aiMetadata: {
          provider: extractionProviderUsed,
          extractionTime: parseFloat(duration),
        }
    });
    console.log('Job Extraction Completed');
    return res.json({ success: true, job });

  } catch (err) {
    const errorDuration = ((performance.now() - startTime) / 1000).toFixed(2);
    console.log(`[AI extraction] Critical Failure after ${errorDuration}s:`, err.message);
    return res.status(500).json({
      success: false,
      error: "Job extraction failed safely"
    });
    }
  }
);

export default router;
