import { Router } from "express";
import authenticate from "../authMiddleware.js";
import Job from "../models/Job.js";

const router = Router();

router.get("/jobs", authenticate, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find({ userId: req.user.id })
        .populate("resumeId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments({ userId: req.user.id })
    ]);

    res.json({
      success: true,
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
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

router.patch("/jobs/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Applied", "Interviewing", "Offer", "Rejected", "Ghosted"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status"
      });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found"
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (err) {
    console.error("Status update failed:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update status"
    });
  }
});

export default router;
