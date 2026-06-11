import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String },
    type: {
      type: String,
      enum: ["text", "file", "appointment"],
      default: "text",
    },
    // File metadata (if type is "file")
    fileName: { type: String },
    fileUrl: { type: String },
    fileType: { type: String },
    
    // Formatted time for client display, e.g. "09:14 AM"
    time: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
