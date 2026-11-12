import express from 'express';
import { callRpc } from '../config/db.js';
import User from '../models/User.js';
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
  fileUrl: report.cloudinary?.secureUrl || report.fileUrl,
  fileKey: report.cloudinary?.publicId || report.fileKey,
  fileSize: report.fileSize || report.cloudinary?.bytes || 0,
  cloudinary: report.cloudinary || {},
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
    const announcements = await Announcement.findAll({ where: { status: 'Published' }, order: [['publishedAt', 'DESC']] });
    res.json(announcements);
  })
);

router.get(
  '/events',
  asyncHandler(async (req, res) => {
    const events = await Event.findAll({ where: { status: 'Scheduled' }, order: [['date', 'ASC']] });
    res.json(events);
  })
);

router.get(
  '/budget',
  asyncHandler(async (req, res) => {
    const reports = await BudgetReport.findAll({ filters: [['status', 'neq', 'Rejected']], order: [['reportDate', 'DESC']] });
    res.json(reports.map(budgetResponse));
  })
);

router.get(
  '/documents',
  asyncHandler(async (req, res) => {
    const documents = await Document.findAll({ filters: [['status', 'neq', 'Archived']], order: [['createdAt', 'DESC']] });
    res.json(documents.map(documentResponse));
  })
);

router.post(
  '/messages',
  asyncHandler(async (req, res) => {
    const subject = String(req.body.subject || '').trim();
    const content = String(req.body.message || '').trim();

    if (!subject || !content) {
      res.status(400);
      throw new Error('Subject and message are required');
    }

    const message = await Message.create({
      sender: req.user._id,
      senderName: req.user.name,
      senderEmail: req.user.email,
      subject,
      message: content,
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

router.get(
  '/messages',
  asyncHandler(async (req, res) => {
    const messages = await Message.findAll({ where: { sender: req.user._id }, order: [['createdAt', 'DESC']] });
    res.json(messages);
  })
);

router.get('/user/profile', (req, res) => {
  res.json(publicUser(req.user));
});

router.put(
  '/user/profile',
  asyncHandler(async (req, res) => {
    const firstName = String(req.body.firstName ?? req.user.profile?.firstName ?? '').trim();
    const middleName = String(req.body.middleName ?? req.user.profile?.middleName ?? '').trim();
    const lastName = String(req.body.lastName ?? req.user.profile?.lastName ?? '').trim();
    const suffix = String(req.body.suffix ?? req.user.profile?.suffix ?? '').trim();
    const composedName = [firstName, middleName, lastName, suffix].filter(Boolean).join(' ');

    req.user.name = composedName || req.body.name || req.user.name;
    req.user.avatar = req.body.avatar || req.user.avatar;
    req.user.avatarPublicId = req.body.avatarPublicId || req.user.avatarPublicId;
    req.user.avatarMetadata = {
      ...req.user.avatarMetadata,
      ...req.body.avatarMetadata,
    };
    req.user.barangay = req.body.barangay || req.user.barangay;
    req.user.profile = {
      ...req.user.profile,
      firstName,
      middleName,
      lastName,
      suffix,
      age: req.body.age ?? req.user.profile?.age,
      gender: req.body.gender ?? req.user.profile?.gender,
      contact: req.body.contact ?? req.user.profile?.contact,
      address: req.body.address ?? req.user.profile?.address,
      region: req.body.region ?? req.user.profile?.region,
      province: req.body.province ?? req.user.profile?.province,
      municipality: req.body.municipality ?? req.user.profile?.municipality,
      purokZone: req.body.purokZone ?? req.user.profile?.purokZone,
      civilStatus: req.body.civilStatus ?? req.user.profile?.civilStatus,
      voterStatus:
        req.body.registeredSkVoter === 'Yes'
          ? 'Registered'
          : req.body.registeredSkVoter === 'No'
            ? 'Not Registered'
            : req.body.voterStatus ?? req.user.profile?.voterStatus,
      workStatus: req.body.workStatus ?? req.user.profile?.workStatus,
      youthAgeGroup: req.body.youthAgeGroup ?? req.user.profile?.youthAgeGroup,
      educationalBackground:
        req.body.educationalBackground ?? req.user.profile?.educationalBackground,
      youthClassifications: Array.isArray(req.body.youthClassifications)
        ? req.body.youthClassifications
        : req.user.profile?.youthClassifications || [],
      registeredSkVoter: req.body.registeredSkVoter ?? req.user.profile?.registeredSkVoter,
      votedLastSkElection:
        req.body.votedLastSkElection ?? req.user.profile?.votedLastSkElection,
      registeredNationalVoter:
        req.body.registeredNationalVoter ?? req.user.profile?.registeredNationalVoter,
      attendedSkAssembly:
        req.body.attendedSkAssembly ?? req.user.profile?.attendedSkAssembly,
      assemblyAttendance:
        req.body.attendedSkAssembly === 'No'
          ? ''
          : req.body.assemblyAttendance ?? req.user.profile?.assemblyAttendance,
    };
    req.user = User.hydrate(await callRpc('skids_update_profile', {
      p_user_id: req.user._id,
      p_changes: User.prepare(req.user),
      p_youth: {
        name: req.user.name,
        email: req.user.email,
        age: req.user.profile?.age,
        barangay: req.user.barangay,
        contact: req.user.profile?.contact,
        gender: req.user.profile?.gender,
        civilStatus: req.user.profile?.civilStatus,
        voterStatus: req.user.profile?.voterStatus,
        workStatus: req.user.profile?.workStatus,
        updatedBy: req.user._id,
      },
    }));

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
