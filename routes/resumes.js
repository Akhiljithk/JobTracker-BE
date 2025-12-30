const express = require("express");
const multer = require("multer");
const authenticate = require("../authMiddleware");
const Resume = require("../models/Resume");
const { createClient } = require("@supabase/supabase-js");
const Job = require("../models/Job");
const router = express.Router();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const upload = multer({
    storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF allowed"));
    }
    cb(null, true);
  }
});

router.post(
  "/resumes",
  authenticate,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileName = `${req.user.id}/${Date.now()}-${req.file.originalname}`;

      // Upload to Supabase
      const { error } = await supabase.storage
        .from("resumes")
        .upload(fileName, req.file.buffer, {
          contentType: "application/pdf"
        });

      if (error) throw error;

      // Public URL
      const { data } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      // Save DB record
      const resume = await Resume.create({
        userId: req.user.id,
        name: req.file.originalname,
        fileUrl: data.publicUrl
      });

      res.json({
        success: true,
        resume
      });
    } catch (err) {
      console.error("Resume upload failed:", err);
      res.status(500).json({
        success: false,
        error: "Resume upload failed"
      });
    }
  }
);


router.get("/resumes", authenticate, async (req, res) => {
  const resumes = await Resume.find({ userId: req.user.id, isGlobal: true }).sort({
    createdAt: -1
  });

  res.json({ success: true, resumes });
});

// DELETE /api/resumes/:id
router.delete("/resumes/:id", authenticate, async (req, res) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!resume) {
    return res.status(404).json({ error: "Resume not found" });
  }

  // Remove from Supabase
  const path = resume.fileUrl.split("/resumes/")[1];
  await supabase.storage.from("resumes").remove([path]);

  await resume.deleteOne();

  res.json({ success: true });
});

// re upload cv - non global
router.post("/resumes/job/:jobId", authenticate, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume file missing" });
    }

    const job = await Job.findOne({
      _id: req.params.jobId,
      userId: req.user.id
    }).populate("resumeId");

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // delete old cv if it is non global
    if (job.resumeId && job.resumeId.isGlobal === false) {
      await deleteFromSupabase(job.resumeId.fileUrl);
      await Resume.deleteOne({ _id: job.resumeId._id });
    }

    const file = req.file;

    const publicUrl = await uploadToSupabase(file, req.user.id);

    const resume = await Resume.create({
      userId: req.user.id,
      name: file.originalname,
      fileUrl: publicUrl,
      isGlobal: false
    });

    job.resumeId = resume._id;
    await job.save();

    res.json({
      success: true,
      resume
    });

  } catch (err) {
    console.error("Job resume upload failed:", err);
    res.status(500).json({
      success: false,
      error: "Resume upload failed"
    });
  }
});

async function uploadToSupabase(file, userId) {
  const filePath = `${userId}/${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage
    .from("resumes")
    .upload(filePath, file.buffer, {
      contentType: "application/pdf",
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("resumes")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

async function deleteFromSupabase(fileUrl) {
  if (!fileUrl) return;

  const path = fileUrl.split("/resumes/")[1];
  if (!path) return;

  const { error } = await supabase
    .storage
    .from("resumes")
    .remove([path]);

  if (error) {
    throw error;
  }
}


module.exports = router;
