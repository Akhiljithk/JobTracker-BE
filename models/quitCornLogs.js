import mongoose from "mongoose";

const quitCornLogSchema = new mongoose.Schema({
  ts: {
    type: Date,
    default: Date.now,
    index: true
  },
  event: {
    type: String,
  },
  browserVersion: {
    type: String
  },
  redirectUrl: {
    type: String
  }
});

export default mongoose.model("quitCornLogSchema", quitCornLogSchema);
