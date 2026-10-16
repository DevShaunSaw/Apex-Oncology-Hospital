import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String, // Seminar, Workshop, Support Group
      required: true,
    },
    date: {
      type: String, // e.g. "June 8, 2024" or "Every Saturday"
      required: true,
    },
    time: {
      type: String, // e.g. "11:00 AM – 1:00 PM"
      required: true,
    },
    speaker: {
      type: String,
      required: true,
    },
    seats: {
      type: Number,
      default: 0,
    },
    registered: {
      type: Number,
      default: 0,
    },
    mode: {
      type: String, // e.g. "In-Person + Online", "Online", "In-Person"
      required: true,
    },
    location: {
      type: String, // e.g. "Apex Onco Care, Mumbai"
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent compiling model multiple times
export default mongoose.models.Event || mongoose.model("Event", EventSchema);
