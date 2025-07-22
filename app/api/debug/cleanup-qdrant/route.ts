// app/api/debug/cleanup-qdrant/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";
import { qdrant, USERS_COLLECTION, ensureUsersCollection } from "@/lib/qdrant";
import { extractIndexData } from "@/models/User";
import { indexUser } from "@/lib/indexProfile";

export async function POST(req: NextRequest) {
  try {
    console.log("🧹 Starting Qdrant cleanup and sync...");

    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    await ensureUsersCollection();

    // 2. Get all users from MongoDB
    const mongoUsers = await User.find({}).select("_id username displayName").lean();
    console.log(`📊 Found ${mongoUsers.length} users in MongoDB`);

    // 3. Get all points from Qdrant
    const qdrantPoints = await qdrant.scroll(USERS_COLLECTION, {
      limit: 1000,
      with_payload: true,
    });
    console.log(`📊 Found ${qdrantPoints.points.length} points in Qdrant`);

    // 4. Find orphaned points in Qdrant (not in MongoDB)
    const mongoUserIds = new Set(mongoUsers.map(u => u._id.toString()));
    const orphanedPoints = qdrantPoints.points.filter(point => {
      const userId = point.payload?._id as string;
      return userId && !mongoUserIds.has(userId);
    });

    console.log(`🗑️ Found ${orphanedPoints.length} orphaned points in Qdrant`);

    // 5. Delete orphaned points
    if (orphanedPoints.length > 0) {
      const orphanedIds = orphanedPoints.map(p => p.id);
      await qdrant.delete(USERS_COLLECTION, {
        points: orphanedIds,
      });
      console.log(`✅ Deleted ${orphanedIds.length} orphaned points`);
    }

    // 6. Re-index all MongoDB users
    console.log("🔄 Re-indexing all MongoDB users...");
    let reindexed = 0;
    for (const user of mongoUsers) {
      try {
        const fullUser = await User.findById(user._id);
        if (fullUser) {
          await indexUser(extractIndexData(fullUser));
          reindexed++;
        }
      } catch (error) {
        console.error(`❌ Error re-indexing user ${user.username}:`, error);
      }
    }

    console.log(`✅ Re-indexed ${reindexed}/${mongoUsers.length} users`);

    return NextResponse.json({
      message: "Qdrant cleanup and sync completed",
      mongoUsers: mongoUsers.length,
      qdrantPoints: qdrantPoints.points.length,
      orphanedPoints: orphanedPoints.length,
      reindexed
    });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}