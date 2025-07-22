// models/Message.ts

import mongoose, { Schema, Document, Types, models } from "mongoose";

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  sender: Types.ObjectId; // ref: "User"
  text?: string;
  image?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

const Message = models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
