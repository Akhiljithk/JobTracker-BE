const express = require("express");
const OpenAI = require("openai");
const authenticate = require("../authMiddleware");
const Job = require("../models/Job");
const safeJsonParse = require("../utils/safeJsonParse");
const validateJob = require("../utils/validateJob");

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post("/extract", authenticate, async (req, res) => {
  try {
    const { pageText, sourceUrl } = req.body;
    const { resumeId } = req.body;

    if (!pageText || pageText.length < 50) {
      return res.status(400).json({ error: "Insufficient page text" });
    }

    const prompt = `
You are a strict data extractor.

Your task is to COPY relevant text, not rewrite it.

Rules:
- jobDescription must be copied from the input text
- Do NOT paraphrase
- Do NOT summarize
- Preserve original wording as much as possible
- Remove only obvious noise (navigation, footer, ads)

Return ONLY valid JSON.
No markdown.
No explanations.

JSON format:
{
  "companyName": "",
  "jobDescription": "",
  "jobTitle": "",
  "location": "", 
  "status": "Applied", 
  "location": "", 
}

Text:
${pageText.slice(0, 12000)}
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    // console.log(response)

    const rawText = response.output_text;
    const parsed = safeJsonParse(rawText);
    const jobData = validateJob(parsed || {});

    const job = await Job.create({
        userId: req.user.id,
        ...jobData,
        resumeId,
        sourceUrl
    });

    return res.json({
      success: true,
      job
    });
  } catch (err) {
    console.error("Extract failed:", err);
    return res.status(500).json({
      success: false,
      error: "Job extraction failed safely"
    });
    }
  }
);

module.exports = router;
