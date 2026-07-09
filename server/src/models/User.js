import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
    },
    passwordHash: {
      type: String,
      select: false,
      default: '',
    },
    authProvider: {
      type: String,
      enum: ['google', 'password', 'both'],
      default: 'google',
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    avatarPublicId: {
      type: String,
      trim: true,
      default: '',
    },
    avatarMetadata: {
      resourceType: {
        type: String,
        trim: true,
        default: '',
      },
      format: {
        type: String,
        trim: true,
        default: '',
      },
      width: Number,
      height: Number,
      bytes: {
        type: Number,
        default: 0,
      },
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      index: true,
    },
    barangay: {
      type: String,
      trim: true,
      default: 'Masagui',
    },
    profile: {
      age: Number,
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
        default: '',
      },
      contact: {
        type: String,
        trim: true,
        default: '',
      },
      address: {
        type: String,
        trim: true,
        default: '',
      },
      position: {
        type: String,
        trim: true,
        default: '',
      },
      civilStatus: {
        type: String,
        enum: ['Single', 'Married', 'Widowed', 'Separated', ''],
        default: '',
      },
      voterStatus: {
        type: String,
        enum: ['Registered', 'Not Registered', ''],
        default: '',
      },
      workStatus: {
        type: String,
        enum: ['Student', 'Employed', 'Unemployed', 'Self-employed', ''],
        default: '',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'active',
      index: true,
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
