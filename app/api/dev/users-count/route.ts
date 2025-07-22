// app/api/dev/users-count/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await connectToDatabase();
  const count = await User.countDocuments();
  return NextResponse.json({ count });
}
