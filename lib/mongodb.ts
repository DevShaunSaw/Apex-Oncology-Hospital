import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import Message from "@/models/Message";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (mongooseInstance) => {
      // Clean up duplicate unique indexes from previous schema designs
      try {
        await mongooseInstance.connection.collection("users").dropIndex("username_1");
        console.log("Successfully dropped duplicate unique username_1 index from users collection.");
      } catch (err) {
        // Ignore if collection doesn't exist or index was already dropped
      }
      // Seed initial data if empty
      await seedDatabase();
      return mongooseInstance;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return; // Already seeded
    }

    console.log("Seeding database with default accounts...");
    const hashedPassword = bcrypt.hashSync("password123", 10);

    // 1. Seed Doctors
    const doctorsData = [
      { name: "Dr. Priya Sharma", email: "priya@apex.com", password: hashedPassword, role: "doctor", specialty: "Medical Oncology", experience: "18 years" },
      { name: "Dr. Amit Gupta", email: "amit@apex.com", password: hashedPassword, role: "doctor", specialty: "Medical Oncology", experience: "18 years" },
      { name: "Dr. Arjun Mehta", email: "arjun@apex.com", password: hashedPassword, role: "doctor", specialty: "Surgical Oncology", experience: "22 years" },
      { name: "Dr. Sunita Rao", email: "sunita@apex.com", password: hashedPassword, role: "doctor", specialty: "Radiation Oncology", experience: "15 years" },
      { name: "Dr. Rajan Nair", email: "rajan@apex.com", password: hashedPassword, role: "doctor", specialty: "Hematology-Oncology", experience: "12 years" }
    ];

    const seededDoctors = await User.insertMany(doctorsData);
    const priyaSharma = seededDoctors.find(d => d.name === "Dr. Priya Sharma");

    // 2. Seed Admin
    await User.create({
      name: "System Admin",
      email: "admin@apex.com",
      password: hashedPassword,
      role: "admin"
    });

    // 3. Seed Patient (Meera Joshi) assigned to Dr. Priya Sharma
    const meera = await User.create({
      name: "Meera Joshi",
      email: "meera@apex.com",
      password: hashedPassword,
      phone: "+91 98765 43210",
      dob: "1972-08-15",
      gender: "Female",
      city: "Pune",
      primaryConcern: "New diagnosis",
      preferredLanguage: "English",
      healthHistory: "Diagnosed with Stage II HR+ invasive ductal carcinoma in Feb 2024. Currently undergoing chemotherapy.",
      role: "patient",
      assignedDoctor: priyaSharma ? priyaSharma._id : null
    });

    // 4. Seed initial chat history between Meera and Priya Sharma
    if (priyaSharma) {
      const initialMessages = [
        {
          sender: priyaSharma._id,
          receiver: meera._id,
          message: "Good morning! I've reviewed your latest blood reports. Your CBC values are showing improvement from last week.",
          time: "09:14 AM",
          type: "text",
          createdAt: new Date(Date.now() - 3600000 * 2) // 2 hours ago
        },
        {
          sender: meera._id,
          receiver: priyaSharma._id,
          message: "That's a relief, Doctor. I was worried about the fatigue I've been experiencing.",
          time: "09:16 AM",
          type: "text",
          createdAt: new Date(Date.now() - 3600000 * 1.9)
        },
        {
          sender: priyaSharma._id,
          receiver: meera._id,
          message: "The fatigue is expected at this stage of your treatment cycle. I'm attaching your updated treatment timeline.",
          time: "09:17 AM",
          type: "text",
          createdAt: new Date(Date.now() - 3600000 * 1.8)
        },
        {
          sender: priyaSharma._id,
          receiver: meera._id,
          message: "Treatment Timeline — Cycle 3",
          time: "09:17 AM",
          type: "file",
          fileName: "cycle3_timeline.pdf",
          fileType: "PDF",
          fileUrl: "/uploads/cycle3_timeline.pdf",
          createdAt: new Date(Date.now() - 3600000 * 1.7)
        },
        {
          sender: meera._id,
          receiver: priyaSharma._id,
          message: "Thank you. Should I come in for my next infusion on the 22nd as scheduled?",
          time: "09:20 AM",
          type: "text",
          createdAt: new Date(Date.now() - 3600000 * 1.6)
        },
        {
          sender: priyaSharma._id,
          receiver: meera._id,
          message: "Yes, the 22nd at 10:00 AM works. I've already blocked the slot. Please ensure you're well hydrated the evening before.",
          time: "09:22 AM",
          type: "text",
          createdAt: new Date(Date.now() - 3600000 * 1.5)
        },
        {
          sender: priyaSharma._id,
          receiver: meera._id,
          message: "Appointment confirmed: 22nd May, 10:00 AM — Infusion Centre, Floor 2",
          time: "09:22 AM",
          type: "appointment",
          createdAt: new Date(Date.now() - 3600000 * 1.5)
        }
      ];

      await Message.insertMany(initialMessages);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
