// models/User.ts
import mongoose, { Schema, HydratedDocument, Document, models } from "mongoose";
import { indexUser } from "@/lib/indexProfile";
import { qdrant, USERS_COLLECTION } from "@/lib/qdrant";
import { getQdrantIdFromUserId } from "@/lib/utils/qdrant";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  displayName: string;
  password: string;
  gender?: string;
  bio?: string;
  profileImage?: string;
  rawProfileText: { type: String; select: false }; // ข้อความดิบ (เข้ารหัสแล้ว)
  concepts: { type: [String]; default: [] }; // topics ที่ AI สกัด
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  currentCity?: string;
  province: String;
  country: String;
  location: {
    type: { type: String; enum: ["Point"]; default: "Point" };
    coordinates: [Number]; // [lon, lat]
  };
  locationTokens: string[];

  MBTI?: string;
  relationshipStatus?: string;
  interests?: { interestName: string; category: string }[];
  birthYear?: number;
  careers?: string[];
  role: {
    type: String;
    enum: ["user", "admin"];
    default: "user";

    email: {
      type: String;
      lowercase: true;
      trim: true;
      unique: true;
      sparse: true; // อนุญาตให้ user เก่าที่ยังไม่มีอีเมลอยู่ได้
    };
    emailVerified: {
      type: Boolean;
      default: false;
    };
  };
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  gender: String,
  bio: String,
  profileImage: String,
  rawProfileText: { type: String, select: false },
  concepts: { type: [String], default: [] },
  instagram: String,
  facebook: String,
  twitter: String,
  linkedin: String,
  currentCity: String,
  locationTokens: { type: [String], default: [] },
  MBTI: String,
  relationshipStatus: String,
  birthYear: { type: Number, min: 1900, max: new Date().getFullYear() },
  interests: [
    {
      interestName: { type: String, required: true }, // เช่น "คาเฟ่"
      category: { type: String, default: "custom" }, // default = custom
    },
  ],
  careers: [String],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

/* ---------- Qdrant Sync Hooks ---------- */

function extractIndexData(doc: HydratedDocument<IUser>) {
  return {
    pointId: getQdrantIdFromUserId(doc._id.toString()),
    mongoId: doc._id.toString(),
    username: doc.username,
    displayName: doc.displayName,
    interests: (doc.interests || []).map((i) => i.interestName),
    bio: doc.bio,
    MBTI: doc.MBTI,
    gender: doc.gender,
    relationshipStatus: doc.relationshipStatus,
    careers: doc.careers || [],
    birthYear: doc.birthYear,
    locationTokens: doc.locationTokens ?? [],
  };
}

// สร้างใหม่
UserSchema.post("save", async function (doc: HydratedDocument<IUser>) {
  console.log("[hook] save →", doc.username);
  await indexUser(extractIndexData(doc));
});

// แก้ไข
UserSchema.post(
  "findOneAndUpdate",
  async function (doc: HydratedDocument<IUser> | null) {
    if (doc) {
      console.log("[hook] update →", doc.username);
      await indexUser(extractIndexData(doc));
    }
  }
);

// ลบ
UserSchema.post(
  "findOneAndDelete",
  async function (doc: HydratedDocument<IUser>) {
    if (!doc) return;
    try {
      await qdrant.delete(USERS_COLLECTION, {
        points: [getQdrantIdFromUserId(doc._id.toString())],
      });

      console.log("[hook] delete →", doc.username);
    } catch (err: any) {
      console.error("Qdrant delete error:", err);
    }
  }
);

/* ---------- Model ---------- */
const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
export { extractIndexData };
