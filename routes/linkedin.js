const express = require("express");
const authenticate = require("../authMiddleware");
const Job = require("../models/Job");

const router = express.Router();

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

    console.log('here31')
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

module.exports = router;
