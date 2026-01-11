import { Schema, model } from "mongoose";

const resumeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
   extractedText: String,
  },
  { timestamps: true }
);

export default model("Resume", resumeSchema);
