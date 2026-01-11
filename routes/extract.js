import { Router } from "express";
import Job from '../models/Job.js';
import authenticate from "../authMiddleware.js";
import { extractionQueue } from '../services/jobQueue.js';

const router = Router();

router.post("/extract", authenticate, async (req, res) => {

  try {
    const { pageText, sourceUrl, resumeId } = req.body;

    if (!pageText || pageText.length < 50) {
      return res.status(400).json({ error: "Insufficient page text" });
    }

    const cleanText = pageText.replace(/["\\]/g, ' ').replace(/\t/g, ' ').replace(/ {2,}/g, ' ').trim();
    const topPart = cleanText.slice(0, 3500);
    const bottomPart = cleanText.slice(-1500);
    const pageTextSnippet = topPart + "\n[...]\n" + bottomPart;

    const newJob = await Job.create({
      userId: req.user.id,
      resumeId: resumeId || null,
      sourceUrl,
      aiProcessingStatus: 'Processing',
      rawPageTextForProcessing: pageTextSnippet,
    });

    await extractionQueue.add('extract-task', { 
      jobId: newJob._id, 
      pageText: pageTextSnippet, 
    });

    console.log('[AI extraction] Job added to queue.')

    res.status(200).json({ message: "Job queued!", jobId: newJob._id });

  } catch (err) {
    console.log(`[AI extraction] Critical Failure:`, err.message);
    return res.status(500).json({
      success: false,
      error: "Job extraction failed."
    });
    }
  }
);

export default router;
