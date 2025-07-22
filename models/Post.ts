// models/Post.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IPostImage {
  key: string; // S3 object key  (เก็บไว้ใช้ /api/image)
  url: string; // Friendly URL  (optional แต่ช่วยลด logic ฝั่ง client)
}

export interface IPost {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  location?: string;
  images: { key: string; url: string }[];
  likes: mongoose.Types.ObjectId[];
  likesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    location: String,
    images: [
      {
        key: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

/** 🆕 เชื่อม userId → author (virtual populate) */
PostSchema.virtual("author", {
  ref: "User", // collection ที่จะดึง
  localField: "userId", // ใน Post
  foreignField: "_id", // ใน User
  justOne: true, // ได้ user เดียว
});

/** ให้ virtual ติดไปเวลาแปลงเป็น JSON/Object */
PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

/** เพิ่ม virtual field เพื่อดึงจำนวนไลก์ */
PostSchema.virtual("likesCount").get(function () {
  return this.likes?.length ?? 0;
});

/** 🆕 virtual field ดึงจำนวนคอมเมนต์ */
PostSchema.virtual("commentsCount", {
  ref: "Comment", // collection คอมเมนต์
  localField: "_id",
  foreignField: "postId",
  count: true, // ✅ ให้ mongoose ส่งมาเป็นตัวเลข
});

/** index เพื่อให้ query เช็คว่า user เคยไลก์โพสต์นี้เร็วขึ้น */
PostSchema.index({ _id: 1, likes: 1 });

export default mongoose.models.Post ||
  mongoose.model<IPost>("Post", PostSchema);
