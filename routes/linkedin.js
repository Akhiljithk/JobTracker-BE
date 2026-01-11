import { Router } from "express";
import authenticate from "../authMiddleware.js";
import Job from "../models/Job.js";

const router = Router();

router.post("/save", authenticate, async (req, res) => {
  try {
    const {
      jobTitle,
      companyName,
      companyLinkedinUrl,
      jobDescription,
      jobLocation,
      sourceUrl,
      resumeId
    } = req.body;

    if (!jobTitle || !companyName || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }


    const job = await Job.create({
        userId: req.user.id,
        jobTitle,
        companyName,
        companyLinkedinUrl,
        jobDescription,
        jobLocation,
        resumeId: resumeId || null,
        sourceUrl
    });

    return res.json({
      success: true,
      job
    });

  } catch (err) {
    console.error("LinkedIn save failed:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to save LinkedIn job"
    });
  }
});

export default router;
