// lib/utils/extractIndexData.ts

import { HydratedDocument } from "mongoose";
import { IUser } from "@/models/User";

export function extractIndexData(doc: HydratedDocument<IUser>) {
  return {
    mongoId: doc._id.toString(),
    username: doc.username,
    displayName: doc.displayName,
    bio: doc.bio,
    MBTI: doc.MBTI,
    gender: doc.gender,
    relationshipStatus: doc.relationshipStatus,
    careers: doc.careers || [],
    birthYear: doc.birthYear,
    locationTokens: doc.locationTokens ?? [],
  };
}
