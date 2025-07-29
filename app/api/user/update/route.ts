// app/api/user/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { username } = await req.json();
  if (!username || !/^[a-z0-9._!]+$/.test(username)) {
    return NextResponse.json({ error: "Invalid username" }, { status: 400 });
  }
  await connectToDatabase();
  const exists = await User.findOne({ username });
  if (exists) {
    return NextResponse.json({ error: "Username taken" }, { status: 400 });
  }
  await User.findByIdAndUpdate(session.user.id, { username });
  return NextResponse.json({ message: "OK" });
}