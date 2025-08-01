// app/api/dev/sync-users-to-qdrant/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { indexUser } from "@/lib/indexProfile";
import { makeLocationTokens } from "@/lib/utils/locations";
import { getQdrantIdFromUserId } from "@/lib/utils/qdrant";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const users = (await User.find().lean()) as any[];
    let count = 0;

    for (const user of users) {
      const interests = user.interests?.map((i: any) => i.interestName) || [];
      const tokens = makeLocationTokens(user.currentCity || "");

      const pointId = getQdrantIdFromUserId(user._id.toString());

      console.log(`Indexing user: ${user.username}`);
      console.log(`Display Name: ${user.displayName}`);
      console.log(`Year of Birth : ${user.birthYear}`);
      console.log("Location tokens:", tokens);

      await indexUser({
        mongoId: user._id.toString(),
        displayName: user.displayName,
        username: user.username,
        bio: user.bio,
        MBTI: user.MBTI,
        gender: user.gender,
        relationshipStatus: user.relationshipStatus,
        careers: user.careers || [],
        birthYear: user.birthYear ?? null,
        locationTokens: makeLocationTokens(user.currentCity || ""),
      });

      count++;
    }

    return NextResponse.json({ message: "All users indexed", count });
  } catch (err: any) {
    console.error("sync-users-to-qdrant error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
