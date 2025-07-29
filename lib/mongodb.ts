// lib/mongodb.ts

import mongoose, { Connection } from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "❌ Please define the MONGODB_URI environment variable in .env"
  );
}

let cached: {
  conn: Connection | null;
  promise: Promise<Connection> | null;
} = (globalThis as any).mongoose && (globalThis as any).mongoose.connection
  ? { conn: (globalThis as any).mongoose.connection, promise: null }
  : { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: "Kram" })
      .then((mongooseInstance) => mongooseInstance.connection); // ใช้ connection แทน mongooseInstance
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
