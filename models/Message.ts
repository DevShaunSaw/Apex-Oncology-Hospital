import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    message: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "document",
        "appointment",
      ],
      default: "text",
    },

    fileName: {
      type: String,
    },

    fileUrl: {
      type: String,
    },

    fileType: {
      type: String,
    },

    mimeType: {
      type: String,
    },

    objectKey: {
      type: String,
    },

    fileSize: {
      type: Number,
    },

    read: {
      type: Boolean,
      default: false,
    },

    time: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);