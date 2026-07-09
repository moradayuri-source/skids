import mongoose from 'mongoose';

const budgetReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'PHP',
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    reportDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      trim: true,
      default: '',
    },
    fileKey: {
      type: String,
      trim: true,
      default: '',
    },
    fileSize: {
      type: Number,
      min: 0,
      default: 0,
    },
    cloudinary: {
      publicId: { type: String, trim: true, default: '' },
      secureUrl: { type: String, trim: true, default: '' },
      resourceType: { type: String, trim: true, default: '' },
      format: { type: String, trim: true, default: '' },
      width: Number,
      height: Number,
      bytes: { type: Number, default: 0 },
      originalFilename: { type: String, trim: true, default: '' },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

budgetReportSchema.index({ title: 'text', category: 'text', notes: 'text' });

const BudgetReport = mongoose.model('BudgetReport', budgetReportSchema);

export default BudgetReport;
