// models/Feedback.ts

import mongoose, { Schema, model, models } from "mongoose";

const FeedbackSchema = new Schema(
  {
    emoji: { type: Number, enum: [0, 1, 2, 3, 4], required: false },
    feedback: { type: String, required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

export const Feedback = models.Feedback || model("Feedback", FeedbackSchema);
