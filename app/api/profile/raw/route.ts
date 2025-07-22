// app/api/profile/raw/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { decrypt } from "@/lib/encrypt";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const user = await UserModel.findById(session.user.id).select("+rawProfileText");

  if (!user?.rawProfileText) {
    return NextResponse.json({ rawText: "" });
  }

  const rawText = decrypt(user.rawProfileText);

  return NextResponse.json({ rawText });
}
