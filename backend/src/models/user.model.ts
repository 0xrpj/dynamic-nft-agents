import { model, Schema } from 'mongoose';

export interface ConversationHistory {
  question: string;
  answer: string;
}
export interface User {
  userId: string;
  agentId: string;
  nftId: string,
  roomId: string;
  word: string;
  category: string;
  score: number;
  level: number;
  attemptsRemaining: number;
  latestGuesses: string[];
  gptConversationHistory: ConversationHistory[];
  companionConversationHistory: ConversationHistory[];
}

const conversationHistorySchema = new Schema<ConversationHistory>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const userSchema: Schema<User> = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    agentId: {
      type: String,
      required: true,
    },
    nftId: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    word: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      required: true,
    },
    level: {
      type: Number,
      default: 1,
      required: true,
    },
    attemptsRemaining: {
      type: Number,
      default: 3,
      required: true,
    },    
    latestGuesses: {
      type: [String],
      default: [],
    },   
    gptConversationHistory: {
      type: [conversationHistorySchema],
      default: [],
    },
    companionConversationHistory: {
      type: [conversationHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const userModel = model<User>('UserDetails', userSchema);

export default userModel;
