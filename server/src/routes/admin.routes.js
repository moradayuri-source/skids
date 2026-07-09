import express from 'express';
import Announcement from '../models/Announcement.js';
import ActivityLog from '../models/ActivityLog.js';
import BudgetReport from '../models/BudgetReport.js';
import Document from '../models/Document.js';
import Event from '../models/Event.js';
import Message from '../models/Message.js';
import YouthProfile from '../models/YouthProfile.js';
import { inferActionType, logActivity } from '../utils/activityLogger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authorize, requireAuth } from '../middleware/auth.js';
import { publicUser } from '../utils/auth.js';

const router = express.Router();

router.use(requireAuth, authorize('admin'));

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const positiveInteger = (value, fallback, maximum) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
};

const validDate = (value) => {
  const date = new Date(String(value || ''));
  return Number.isNaN(date.getTime()) ? null : date;
};

const legacyActionPatterns = {
  login: /^Logged in/i,
  logout: /^Logged out/i,
  create: /^(Created|Posted|Uploaded|Sent|Replied|Registered)/i,
  update: /^(Updated|Edited|Marked)/i,
  delete: /^(Deleted|Removed)/i,
  profile_update: /^Updated (admin|user) profile/i,
};

const parseAmount = (amount) => {
  if (typeof amount === 'number') {
    return amount;
  }

  return Number(String(amount || '').replace(/[^\d.]/g, ''));
};

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

router.get(
  '/youth',
  asyncHandler(async (req, res) => {
    const youth = await YouthProfile.find().sort({ createdAt: -1 });
    res.json(youth);
  })
);

router.post(
  '/youth',
  asyncHandler(async (req, res) => {
    const youth = await YouthProfile.create({
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'Created youth profile',
      resourceType: 'YouthProfile',
      resourceId: youth._id,
      details: youth.name,
    });

    res.status(201).json(youth);
  })
);

router.put(
  '/youth/:id',
  asyncHandler(async (req, res) => {
    const youth = await YouthProfile.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!youth) {
      res.status(404);
      throw new Error('Youth profile not found');
    }

    await logActivity({
      user: req.user,
      action: 'Updated youth profile',
      resourceType: 'YouthProfile',
      resourceId: youth._id,
      details: youth.name,
    });

    res.json(youth);
  })
);

router.delete(
  '/youth/:id',
  asyncHandler(async (req, res) => {
    const youth = await YouthProfile.findByIdAndDelete(req.params.id);

    if (!youth) {
      res.status(404);
      throw new Error('Youth profile not found');
    }

    await logActivity({
      user: req.user,
      action: 'Deleted youth profile',
      resourceType: 'YouthProfile',
      resourceId: youth._id,
      details: youth.name,
    });

    res.json({ message: 'Youth profile deleted' });
  })
);

router.get(
  '/announcements',
  asyncHandler(async (req, res) => {
    const announcements = await Announcement.find().sort({ publishedAt: -1 });
    res.json(announcements);
  })
);

router.post(
  '/announcements',
  asyncHandler(async (req, res) => {
    const announcement = await Announcement.create({
      ...req.body,
      author: req.user._id,
      authorName: req.user.name,
      publishedAt: new Date(),
    });

    await logActivity({
      user: req.user,
      action: 'Posted announcement',
      resourceType: 'Announcement',
      resourceId: announcement._id,
      details: announcement.title,
    });

    res.status(201).json(announcement);
  })
);

router.put(
  '/announcements/:id',
  asyncHandler(async (req, res) => {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      res.status(404);
      throw new Error('Announcement not found');
    }

    await logActivity({
      user: req.user,
      action: 'Updated announcement',
      resourceType: 'Announcement',
      resourceId: announcement._id,
      details: announcement.title,
    });

    res.json(announcement);
  })
);

router.delete(
  '/announcements/:id',
  asyncHandler(async (req, res) => {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      res.status(404);
      throw new Error('Announcement not found');
    }

    await logActivity({
      user: req.user,
      action: 'Deleted announcement',
      resourceType: 'Announcement',
      resourceId: announcement._id,
      details: announcement.title,
    });

    res.json({ message: 'Announcement deleted' });
  })
);

router.get(
  '/events',
  asyncHandler(async (req, res) => {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  })
);

router.post(
  '/events',
  asyncHandler(async (req, res) => {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'Created event',
      resourceType: 'Event',
      resourceId: event._id,
      details: event.title,
    });

    res.status(201).json(event);
  })
);

router.put(
  '/events/:id',
  asyncHandler(async (req, res) => {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    await logActivity({
      user: req.user,
      action: 'Updated event',
      resourceType: 'Event',
      resourceId: event._id,
      details: event.title,
    });

    res.json(event);
  })
);

router.delete(
  '/events/:id',
  asyncHandler(async (req, res) => {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    await logActivity({
      user: req.user,
      action: 'Deleted event',
      resourceType: 'Event',
      resourceId: event._id,
      details: event.title,
    });

    res.json({ message: 'Event deleted' });
  })
);

router.get(
  '/budget',
  asyncHandler(async (req, res) => {
    const reports = await BudgetReport.find().sort({ reportDate: -1 });
    res.json(reports.map(budgetResponse));
  })
);

router.post(
  '/budget',
  asyncHandler(async (req, res) => {
    const report = await BudgetReport.create({
      ...req.body,
      amount: parseAmount(req.body.amount),
      reportDate: req.body.date || req.body.reportDate || new Date(),
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'Created budget report',
      resourceType: 'BudgetReport',
      resourceId: report._id,
      details: report.title,
    });

    res.status(201).json(budgetResponse(report));
  })
);

router.put(
  '/budget/:id',
  asyncHandler(async (req, res) => {
    const update = {
      ...req.body,
      ...(req.body.amount !== undefined && { amount: parseAmount(req.body.amount) }),
      ...(req.body.date && { reportDate: req.body.date }),
    };

    const report = await BudgetReport.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!report) {
      res.status(404);
      throw new Error('Budget report not found');
    }

    await logActivity({
      user: req.user,
      action: 'Updated budget report',
      resourceType: 'BudgetReport',
      resourceId: report._id,
      details: report.title,
    });

    res.json(budgetResponse(report));
  })
);

router.delete(
  '/budget/:id',
  asyncHandler(async (req, res) => {
    const report = await BudgetReport.findByIdAndDelete(req.params.id);

    if (!report) {
      res.status(404);
      throw new Error('Budget report not found');
    }

    await logActivity({
      user: req.user,
      action: 'Deleted budget report',
      resourceType: 'BudgetReport',
      resourceId: report._id,
      details: report.title,
    });

    res.json({ message: 'Budget report deleted' });
  })
);

router.get(
  '/documents',
  asyncHandler(async (req, res) => {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.json(documents.map(documentResponse));
  })
);

router.post(
  '/documents',
  asyncHandler(async (req, res) => {
    const document = await Document.create({
      title: req.body.title,
      type: req.body.type || 'Other',
      fileUrl: req.body.fileUrl || req.body.cloudinary?.secureUrl || '',
      fileKey: req.body.fileKey || req.body.cloudinary?.publicId || '',
      fileSize: Number(req.body.fileSize || req.body.cloudinary?.bytes || 0),
      cloudinary: {
        publicId: req.body.cloudinary?.publicId || req.body.fileKey || '',
        secureUrl: req.body.cloudinary?.secureUrl || req.body.fileUrl || '',
        resourceType: req.body.cloudinary?.resourceType || '',
        format: req.body.cloudinary?.format || '',
        width: req.body.cloudinary?.width,
        height: req.body.cloudinary?.height,
        bytes: Number(req.body.cloudinary?.bytes || req.body.fileSize || 0),
        originalFilename: req.body.cloudinary?.originalFilename || '',
      },
      status: req.body.status || 'Draft',
      uploadedBy: req.user._id,
    });

    await logActivity({
      user: req.user,
      action: 'Uploaded document metadata',
      resourceType: 'Document',
      resourceId: document._id,
      details: document.title,
    });

    res.status(201).json(documentResponse(document));
  })
);

router.delete(
  '/documents/:id',
  asyncHandler(async (req, res) => {
    const document = await Document.findByIdAndDelete(req.params.id);

    if (!document) {
      res.status(404);
      throw new Error('Document not found');
    }

    await logActivity({
      user: req.user,
      action: 'Deleted document metadata',
      resourceType: 'Document',
      resourceId: document._id,
      details: document.title,
    });

    res.json({ message: 'Document deleted' });
  })
);

router.get(
  '/messages',
  asyncHandler(async (req, res) => {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  })
);

router.post(
  '/messages/:id/reply',
  asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    message.replies.push({
      message: req.body.reply,
      sender: req.user._id,
      senderName: req.user.name,
    });
    message.status = 'read';
    await message.save();

    await logActivity({
      user: req.user,
      action: 'Replied to message',
      resourceType: 'Message',
      resourceId: message._id,
      details: message.subject,
    });

    res.json(message);
  })
);

router.put(
  '/messages/:id/read',
  asyncHandler(async (req, res) => {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    await logActivity({
      req,
      user: req.user,
      action: 'Marked message as read',
      actionType: 'update',
      resourceType: 'Message',
      resourceId: message._id,
      details: message.subject,
    });

    res.json(message);
  })
);

router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const page = positiveInteger(req.query.page, 1, 100000);
    const limit = positiveInteger(req.query.limit, 25, 100);
    const query = {};
    const search = String(req.query.search || '').trim();
    const actionType = String(req.query.actionType || '').trim();
    const resourceType = String(req.query.resourceType || '').trim();

    if (search) {
      const expression = new RegExp(escapeRegExp(search), 'i');
      query.$or = [
        { actorName: expression },
        { action: expression },
        { details: expression },
      ];
    }

    if (actionType) {
      query.$and = [
        {
          $or: [
            { actionType },
            {
              actionType: { $exists: false },
              action: legacyActionPatterns[actionType] || /^$/,
            },
          ],
        },
      ];
    }

    if (resourceType) {
      query.resourceType = resourceType;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      query.createdAt = {};

      if (req.query.dateFrom) {
        const dateFrom = validDate(req.query.dateFrom);
        if (dateFrom) query.createdAt.$gte = dateFrom;
      }

      if (req.query.dateTo) {
        const dateTo = validDate(req.query.dateTo);
        if (dateTo) query.createdAt.$lte = dateTo;
      }

      if (Object.keys(query.createdAt).length === 0) {
        delete query.createdAt;
      }
    }

    const [logs, total, resourceTypes] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ActivityLog.countDocuments(query),
      ActivityLog.distinct('resourceType', { resourceType: { $ne: '' } }),
    ]);

    res.json({
      logs: logs.map((log) => ({
        id: log._id.toString(),
        user: log.actorName,
        actorRole: log.actorRole,
        actionType:
          log.actionType && log.actionType !== 'other'
            ? log.actionType
            : inferActionType(log.action),
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId?.toString() || '',
        details: log.details,
        ipAddress: log.ipAddress,
        date: log.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      filters: {
        actionTypes: ['login', 'logout', 'create', 'update', 'delete', 'profile_update'],
        resourceTypes: resourceTypes.sort(),
      },
    });
  })
);

router.get('/profile', (req, res) => {
  res.json(publicUser(req.user));
});

router.put(
  '/profile',
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
      ...req.body.profile,
      position: req.body.position ?? req.user.profile?.position,
      contact: req.body.contact ?? req.user.profile?.contact,
      address: req.body.address ?? req.user.profile?.address,
    };
    await req.user.save();

    await logActivity({
      req,
      user: req.user,
      action: 'Updated admin profile',
      actionType: 'profile_update',
      resourceType: 'User',
      resourceId: req.user._id,
      details: req.user.name,
    });

    res.json(publicUser(req.user));
  })
);

export default router;
