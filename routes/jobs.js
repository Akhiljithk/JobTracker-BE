const express = require("express");
const authenticate = require("../authMiddleware");
const Job = require("../models/Job");

const router = express.Router();

router.get("/jobs", authenticate, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs
    });
  } catch (err) {
    console.error("Fetch jobs failed:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch jobs"
    });
  }
});

router.delete("/jobs/:id", authenticate, async (req, res) => {
  try {
    const jobId = req.params.id;

    const deleted = await Job.findOneAndDelete({
      _id: jobId,
      userId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Job not found or not authorized"
      });
    }

    res.json({
      success: true
    });
  } catch (err) {
    console.error("Delete job failed:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete job"
    });
  }
});

module.exports = router;
