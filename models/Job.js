import { Schema, model } from "mongoose";

const jobSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    jobTitle: String,
    companyName: { type: String, default: "Processing..." },
    jobDescription: String,
    companyLinkedinUrl: String,
    resumeId: {
      type: Schema.Types.ObjectId,
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
    aiProcessingStatus: { 
      type: String, 
      enum: ["Processing", "Saved", "Failed"], 
      default: "Processing" 
    },  
    appliedDate: {
      type: Date,
      default: Date.now
    },
    aiMetadata: {
      provider: { type: String }, 
      extractionTime: { type: Number },
    },
  },
  { timestamps: true }
);

export default model("Job", jobSchema);

    // skills: [String], // future implemenation 
    // aiSuggestion: String, // future implemenation 