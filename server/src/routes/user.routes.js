import express from 'express';
import Announcement from '../models/Announcement.js';
import BudgetReport from '../models/BudgetReport.js';
import Document from '../models/Document.js';
import Event from '../models/Event.js';
import Message from '../models/Message.js';
import { logActivity } from '../utils/activityLogger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { publicUser } from '../utils/auth.js';

const router = express.Router();

const budgetResponse = (report) => ({
  id: report._id.toString(),
  title: report.title,
  amount: `PHP ${report.amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`,
  rawAmount: report.amount,
  category: report.category,
  status: report.status,
  date: report.reportDate.toISOString().slice(0, 10),
});

const documentResponse = (document) => ({
  id: document._id.toString(),
  title: document.title,
  type: document.type,
  date: document.createdAt.toISOString().slice(0, 10),
  fileUrl: document.cloudinary?.secureUrl || document.fileUrl,
  fileKey: document.cloudinary?.publicId || document.fileKey,
  cloudinary: document.cloudinary || {},
  fileSize: document.fileSize
    ? `${(document.fileSize / 1024 / 1024).toFixed(1)} MB`
    : '0 MB',
  status: document.status,
});

router.use(requireAuth);

router.get(
  '/announcements',
  asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({ status: 'Published' }).sort({
      publishedAt: -1,
    });
    res.json(announcements);
  })
);

router.get(
  '/events',
  asyncHandler(async (req, res) => {
    const events = await Event.find({ status: 'Scheduled' }).sort({ date: 1 });
    res.json(events);
  })
);

router.get(
  '/budget',
  asyncHandler(async (req, res) => {
    const reports = await BudgetReport.find({ status: { $ne: 'Rejected' } }).sort({
      reportDate: -1,
    });
    res.json(reports.map(budgetResponse));
  })
);

router.get(
  '/documents',
  asyncHandler(async (req, res) => {
    const documents = await Document.find({ status: { $ne: 'Archived' } }).sort({
      createdAt: -1,
    });
    res.json(documents.map(documentResponse));
  })
);

router.post(
  '/messages',
  asyncHandler(async (req, res) => {
    const message = await Message.create({
      sender: req.user._id,
      senderName: req.user.name,
      senderEmail: req.user.email,
      subject: req.body.subject,
      message: req.body.message,
    });

    await logActivity({
      req,
      user: req.user,
      action: 'Sent message',
      actionType: 'create',
      resourceType: 'Message',
      resourceId: message._id,
      details: message.subject,
    });

    res.status(201).json(message);
  })
);

router.get('/user/profile', (req, res) => {
  res.json(publicUser(req.user));
});

router.put(
  '/user/profile',
  asyncHandler(async (req, res) => {
    req.user.name = req.body.name || req.user.name;
    req.user.avatar = req.body.avatar || req.user.avatar;
    req.user.avatarPublicId = req.body.avatarPublicId || req.user.avatarPublicId;
    req.user.avatarMetadata = {
      ...req.user.avatarMetadata,
      ...req.body.avatarMetadata,
    };
    req.user.barangay = req.body.barangay || req.user.barangay;
    req.user.profile = {
      ...req.user.profile,
      age: req.body.age ?? req.user.profile?.age,
      gender: req.body.gender ?? req.user.profile?.gender,
      contact: req.body.contact ?? req.user.profile?.contact,
      civilStatus: req.body.civilStatus ?? req.user.profile?.civilStatus,
      voterStatus: req.body.voterStatus ?? req.user.profile?.voterStatus,
      workStatus: req.body.workStatus ?? req.user.profile?.workStatus,
    };
    await req.user.save();

    await logActivity({
      req,
      user: req.user,
      action: 'Updated user profile',
      actionType: 'profile_update',
      resourceType: 'User',
      resourceId: req.user._id,
      details: req.user.name,
    });

    res.json(publicUser(req.user));
  })
);

export default router;
