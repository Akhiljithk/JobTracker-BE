const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    jobTitle: String,
    companyName: String,
    jobDescription: String,
    companyLinkedinUrl: String,
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null
    },
    sourceUrl: String,
    jobLocation: String,
    status: { 
      type: String, 
      enum: ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Ghosted'],
      default: 'Applied' 
    },  
    appliedDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);

    // skills: [String], // future implemenation 
    // aiSuggestion: String, // future implemenation 