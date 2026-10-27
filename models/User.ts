import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    dob: { type: String },
    gender: { type: String },
    city: { type: String },
    primaryConcern: { type: String },
    preferredLanguage: { type: String },
    healthHistory: { type: String },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    // Doctor specific fields
    department: { type: String, default: "Department of Oncology" },
    position: { type: String, default: "Specialist Consultant" },
    degree: { type: String, default: "" },
    specialty: { type: String, default: "" },
    experience: { type: String, default: "" },
    yoe: { type: String, default: "" },
    rating: { type: Number, default: 4.8 },
    available: { type: Boolean, default: true },

    // Patient specific fields
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    patientId: { type: String },
    initials: { type: String },
    age: { type: Number },
    status: { type: String },
    disease: { type: String },
    stage: { type: String },
    type: { type: String },
    recoveryIndex: { type: Number },
    vitals: {
      bp: { type: String, default: "" },
      temp: { type: String, default: "" },
      pulse: { type: String, default: "" },
      weight: { type: String, default: "" },
      lastUpdated: { type: String, default: "" },
      updatedAt: { type: Date }
    },
    vitalsHistory: [
      {
        bp: { type: String, default: "" },
        temp: { type: String, default: "" },
        pulse: { type: String, default: "" },
        weight: { type: String, default: "" },
        lastUpdated: { type: String, default: "" },
        recordedAt: { type: Date, default: Date.now },
        recordedBy: { type: String, default: "Clinical Team" },
        notes: { type: String, default: "" }
      }
    ],
    labTrends: [
      {
        label: { type: String },
        value: { type: String },
        status: { type: String }
      }
    ],
    treatmentPhase: { type: String },
    cycleProgress: {
      current: { type: Number },
      total: { type: Number }
    },
    recentSymptoms: [
      {
        symptom: { type: String },
        date: { type: String },
        severity: { type: String },
        createdAt: { type: Date, default: Date.now },
        time: { type: String }
      }
    ],
    nextAppointment: { type: String },
    medications: [{ type: String }],
    allergies: [{ type: String }],
    notes: { type: String },
    package: { type: String },
    since: { type: String },
    prognosis: { type: String },
    flagged: { type: Boolean, default: false },
    unreadMessages: { type: Number, default: 0 },
    // Account suspension / block status
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String, default: "" },
    blockedAt: { type: Date }
  },
  { timestamps: true }
);

// Prevent stale cached model in development
if (mongoose.models && mongoose.models.User) {
  delete (mongoose.models as any).User;
}

export default mongoose.models.User || mongoose.model("User", UserSchema);
