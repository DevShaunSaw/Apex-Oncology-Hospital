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
    specialty: { type: String },
    experience: { type: String },
    rating: { type: Number, default: 4.8 },
    available: { type: Boolean, default: true },
    
    // Patient specific fields
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Prevent compiling model multiple times
export default mongoose.models.User || mongoose.model("User", UserSchema);
