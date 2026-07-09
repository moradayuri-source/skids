import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread',
      index: true,
    },
    replies: [replySchema],
  },
  { timestamps: true }
);

messageSchema.index({ subject: 'text', message: 'text', senderName: 'text' });

const Message = mongoose.model('Message', messageSchema);

export default Message;
