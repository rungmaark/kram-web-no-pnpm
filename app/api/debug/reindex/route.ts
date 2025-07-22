// app/api/debug/reindex/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import { decrypt } from "@/lib/encrypt";
import { indexRawProfile } from "@/lib/indexRawProfile";

export async function POST(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    // ดึง users ที่มี rawProfileText
    const usersWithRawText = await User.find({ 
      rawProfileText: { $exists: true, $ne: null } 
    })
    .select("+rawProfileText username displayName")
    .lean();

    console.log(`Found ${usersWithRawText.length} users with rawProfileText`);

    const results = [];
    
    for (const user of usersWithRawText) {
      try {
        // Decrypt rawProfileText
        const decryptedText = decrypt(user.rawProfileText);
        console.log(`Re-indexing user ${user.username}: "${decryptedText}"`);
        
        // Re-index to raw_profile_vectors
        await indexRawProfile({
          userId: user._id.toString(),
          text: decryptedText
        });
        
        results.push({
          userId: user._id.toString(),
          username: user.username,
          text: decryptedText,
          status: "success"
        });
      } catch (error) {
        console.error(`Error re-indexing user ${user.username}:`, error);
        results.push({
          userId: user._id.toString(),
          username: user.username,
          status: "error",
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: "Re-indexing completed",
      processed: results.length,
      results
    });
  } catch (error) {
    console.error("Re-index error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}