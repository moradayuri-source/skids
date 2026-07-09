import mongoose from 'mongoose';

const youthProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 15,
      max: 30,
    },
    barangay: {
      type: String,
      required: true,
      trim: true,
      default: 'Masagui',
    },
    contact: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
      index: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

youthProfileSchema.index({ name: 'text', barangay: 'text', email: 'text' });

const YouthProfile = mongoose.model('YouthProfile', youthProfileSchema);

export default YouthProfile;
