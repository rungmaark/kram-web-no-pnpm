// models/EmailVerificationToken.ts

import mongoose, { Schema, Document, models } from "mongoose";

interface IEmailVerificationToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const TokenSchema = new Schema<IEmailVerificationToken>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, index: true, unique: true },
  expiresAt: { type: Date, required: true },
});

export default models.EmailVerificationToken ||
  mongoose.model<IEmailVerificationToken>(
    "EmailVerificationToken",
    TokenSchema
  );
