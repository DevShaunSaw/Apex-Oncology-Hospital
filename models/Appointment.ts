import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // format: "YYYY-MM-DD"
      required: true,
    },
    time: {
      type: String, // e.g. "10:00 AM"
      required: true,
    },
    type: {
      type: String, // e.g. "Infusion — Cycle 3", "Consultation"
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    contact: {
      type: String,
    },
    diseaseDetails: {
      type: String,
    },
    treatmentPlan: {
      type: String,
    },
    reminded24h: {
      type: Boolean,
      default: false,
    },
    reminded1h: {
      type: Boolean,
      default: false,
    },
    reminded24hAt: {
      type: Date,
    },
    reminded1hAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent compiling model multiple times
export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
