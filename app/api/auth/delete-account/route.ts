// app/api/auth/delete-account/route.ts

import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  await User.findByIdAndDelete(session.user.id);
  return NextResponse.json({ success: true });
}
