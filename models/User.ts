// models/User.ts
import mongoose, { Schema, HydratedDocument, Document, models } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  displayName: string;

  password?: string;
  email?: string;
  emailVerified?: Date | null;
  image?: string;
  gender?: string;

  bio?: string;
  profileImage?: string;
  rawProfileText?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  currentCity?: string;
  province: String;
  country: String;
  location: {
    type: { type: String; enum: ["Point"]; default: "Point" };
    coordinates: [Number];
  };
  locationTokens: string[];

  MBTI?: string;
  relationshipStatus?: string;
  interests?: { interestName: string; category: string }[];
  birthYear?: number;
  careers?: string[];
  role: "user" | "admin";
  theme: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: false, unique: true },
  password: { type: String },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true,
  },
  emailVerified: { type: Date, default: null },
  image: String,
  displayName: { type: String, required: true },
  gender: String,
  bio: String,
  profileImage: String,
  rawProfileText: { type: String, default: "" },
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
      interestName: { type: String, required: true },
      category: { type: String, default: "custom" },
    },
  ],
  careers: [String],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  theme: {
    type: String,
    default: "system",
  }
});

const User = models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
