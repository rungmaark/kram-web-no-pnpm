// models/Follow.ts

import mongoose, { Schema, Document, models } from "mongoose";

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true }); // ห้าม follow ซ้ำ
FollowSchema.index({ following: 1 }); // query คนที่กำลังถูก follow ได้เร็ว
FollowSchema.index({ follower: 1 });  // query คนที่กำลังกด follow ได้เร็ว

const Follow = models.Follow || mongoose.model<IFollow>("Follow", FollowSchema);

export default Follow;
