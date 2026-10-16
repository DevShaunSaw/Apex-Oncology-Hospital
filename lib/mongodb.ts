import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import Message from "@/models/Message";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env or Vercel Environment Variables");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: "apex",
    };

    cached.promise = mongoose.connect(uri, opts).then(async (mongooseInstance) => {
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


