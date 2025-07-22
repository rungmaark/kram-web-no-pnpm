// models/Conversation.ts
import mongoose, { Schema, Document, Types, models } from "mongoose";

export interface IConversation extends Document {
  _id: Types.ObjectId;
  isGroup: boolean;
  name?: string;
  postId?: Types.ObjectId;
  participants: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    isGroup: { type: Boolean, default: false },
    name: String,
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export default models.Conversation ??
  mongoose.model<IConversation>("Conversation", ConversationSchema);
