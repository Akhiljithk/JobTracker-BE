const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String, 
      required: true
    },
    isGlobal: {
      type: Boolean,
      default: true
   },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
