// app/api/debug/check-sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import { qdrant, USERS_COLLECTION } from "@/lib/qdrant";

export async function GET(req: NextRequest) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    // Get users from MongoDB
    const mongoUsers = await User.find({})
      .select("_id username")
      .lean();

    // Get sample from Qdrant
    const qdrantResults = await qdrant.search(USERS_COLLECTION, {
      vector: new Array(1536).fill(0), // dummy vector
      limit: 10,
    });

    const qdrantUserIds = qdrantResults.map(r => r.payload?._id || r.payload?.userId).filter(Boolean);

    return NextResponse.json({
      success: true,
      mongodb: {
        count: mongoUsers.length,
        sampleIds: mongoUsers.slice(0, 5).map(u => u._id.toString())
      },
      qdrant: {
        count: qdrantResults.length,
        sampleIds: qdrantUserIds.slice(0, 5)
      },
      matches: mongoUsers.filter(u => 
        qdrantUserIds.includes(u._id.toString())
      ).length
    });

  } catch (error: any) {
    return NextResponse.json({
      error: "Check sync error",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}