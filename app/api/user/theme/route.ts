// app/api/user/theme/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

export async function PUT(req: Request) {
  const { theme }: { theme: string } = await req.json();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  await User.findByIdAndUpdate(session.user.id, { theme });
  return NextResponse.json({ message: "Theme updated" });
}
