// models/Session.js
import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    triggerDetected: {
      type: Boolean,
      default: false,
    },
    triggerTime: {
      type: Date,
      default: null,
    },
    collectedQuestion: {
      type: [String],
      default: [],
    },
    responseSent: {
      type: Boolean,
      default: false,
    },
    partialTrigger: {
      type: Boolean,
      default: false,
    },
    partialTriggerTime: {
      type: Date,
      default: null,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

SessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 3600 });

// Prevent model overwrite upon hot reload in development
export default mongoose.models.Session || mongoose.model('Session', SessionSchema);