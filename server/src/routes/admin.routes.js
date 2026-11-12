import express from 'express';
import { callRpc } from '../config/db.js';
import { updateById, deleteById } from '../utils/records.js';
import Announcement from '../models/Announcement.js';
import ActivityLog from '../models/ActivityLog.js';
import BudgetReport from '../models/BudgetReport.js';
import Document from '../models/Document.js';
import Event from '../models/Event.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import YouthProfile from '../models/YouthProfile.js';
import { inferActionType, logActivity } from '../utils/activityLogger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authorize, requireAuth } from '../middleware/auth.js';
import { getAdminEmails, publicUser } from '../utils/auth.js';

const router = express.Router();

router.use(requireAuth);


const positiveInteger = (value, fallback, maximum) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
};

const validDate = (value) => {
  const date = new Date(String(value || ''));
  return Number.isNaN(date.getTime()) ? null : date;
};

const assertFutureEventDate = (value) => {
  const dateText = String(value || '').slice(0, 10);
  const eventDate = new Date(`${dateText}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (Number.isNaN(eventDate.getTime())) {
    const error = new Error('A valid event date is required');
    error.statusCode = 400;
    throw error;
  }

  if (eventDate < today) {
    const error = new Error('Events cannot be scheduled in the past');
    error.statusCode = 400;
    throw error;
  }
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

router.get(
  '/managers',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const managers = await User.findAll({ where: { role: 'manager' }, order: [['createdAt', 'DESC']] });
    res.json(managers.map(publicUser));
  })
);

router.post(
  '/managers',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const name = String(req.body.name || '').trim();

    if (!email || !name) {
      res.status(400);
      throw new Error('Manager name and email are required');
    }

    let manager = await User.findOne({ where: { email } });
    if (manager?.role === 'admin' || getAdminEmails().has(email)) {
      res.status(409);
      throw new Error('The chairperson account cannot be changed into a manager');
    }

    if (!manager) {
      manager = await User.create({
        email,
        name,
        role: 'manager',
        authProvider: 'google',
        isActive: true,
        status: 'active',
      });
    } else {
      manager.name = name || manager.name;
      manager.role = 'manager';
      manager.isActive = true;
      manager.status = 'active';
      await User.updateById(manager._id, manager);
    }

    await logActivity({
      req,
      user: req.user,
      action: 'Added manager account',
      actionType: 'create',
      resourceType: 'User',
      resourceId: manager._id,
      details: manager.email,
    });

    res.status(201).json(publicUser(manager));
  })
);

router.delete(
  '/managers/:id',
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const manager = await User.findOne({ where: { _id: req.params.id, role: 'manager' } });

    if (!manager) {
      res.status(404);
      throw new Error('Manager account not found');
    }

    await callRpc('skids_remove_manager', {
      p_user_id: manager._id, p_actor: req.user._id,
    });

    await logActivity({
      req,
      user: req.user,
      action: 'Removed manager access',
      actionType: 'delete',
      resourceType: 'User',
      resourceId: manager._id,
      details: manager.email,
    });

    res.json({ message: 'Manager access removed' });
  })
);

router.use(authorize('admin', 'manager'));

router.get(
  '/youth',
  asyncHandler(async (req, res) => {
    const youth = await YouthProfile.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(youth);
  })
);

router.post(
  '/youth',
  asyncHandler(async (req, res) => {
    const youth = await YouthProfile.create({
      ...req.body,
      userId: req.body.user || null,
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
    const youth = await updateById(YouthProfile,
      req.params.id,
      { ...req.body, ...(req.body.user !== undefined && { userId: req.body.user }), updatedBy: req.user._id }
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
    const youth = await deleteById(YouthProfile, req.params.id);

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
    const announcements = await Announcement.findAll({ order: [['publishedAt', 'DESC']] });
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
    const announcement = await updateById(Announcement,
      req.params.id,
      req.body
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
    const announcement = await deleteById(Announcement, req.params.id);

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
    const events = await Event.findAll({ order: [['date', 'ASC']] });
    res.json(events);
  })
);

router.post(
  '/events',
  asyncHandler(async (req, res) => {
    assertFutureEventDate(req.body.date);
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
    if (req.body.date) {
      assertFutureEventDate(req.body.date);
    }

    const event = await updateById(Event, req.params.id, req.body);

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
    const event = await deleteById(Event, req.params.id);

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
    const reports = await BudgetReport.findAll({ order: [['reportDate', 'DESC']] });
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
      fileUrl: req.body.fileUrl || req.body.cloudinary?.secureUrl || '',
      fileKey: req.body.fileKey || req.body.cloudinary?.publicId || '',
      fileSize: Number(req.body.fileSize || req.body.cloudinary?.bytes || 0),
      cloudinary: req.body.cloudinary || {},
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
      ...(req.body.fileUrl !== undefined && { fileUrl: req.body.fileUrl }),
      ...(req.body.fileKey !== undefined && { fileKey: req.body.fileKey }),
      ...(req.body.fileSize !== undefined && { fileSize: Number(req.body.fileSize) }),
      ...(req.body.cloudinary && { cloudinary: req.body.cloudinary }),
    };

    const report = await updateById(BudgetReport, req.params.id, update);

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
    const report = await deleteById(BudgetReport, req.params.id);

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

router.delete(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const message = await deleteById(Message, req.params.id);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    await logActivity({
      req,
      user: req.user,
      action: 'Deleted message',
      actionType: 'delete',
      resourceType: 'Message',
      resourceId: message._id,
      details: message.subject,
    });

    res.json({ message: 'Message deleted' });
  })
);

router.get(
  '/documents',
  asyncHandler(async (req, res) => {
    const documents = await Document.findAll({ order: [['createdAt', 'DESC']] });
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
    const document = await deleteById(Document, req.params.id);

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
    const messages = await Message.findAll({ order: [['createdAt', 'DESC']] });
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

    await callRpc('skids_reply', {
      p_message_id: message._id, p_reply: String(req.body.reply || '').trim(),
      p_sender: req.user._id, p_sender_name: req.user.name,
    });
    const updatedMessage = await Message.findById(message._id);

    await logActivity({
      user: req.user,
      action: 'Replied to message',
      resourceType: 'Message',
      resourceId: message._id,
      details: message.subject,
    });

    res.json(updatedMessage);
  })
);

router.put(
  '/messages/:id/read',
  asyncHandler(async (req, res) => {
    const message = await updateById(Message,
      req.params.id,
      { status: 'read' }
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
    const search = String(req.query.search || '').trim();
    const actionType = String(req.query.actionType || '').trim();
    const resourceType = String(req.query.resourceType || '').trim();

    const history = await callRpc('skids_history', {
      p_search: search, p_action_type: actionType, p_resource_type: resourceType,
      p_date_from: validDate(req.query.dateFrom)?.toISOString() || null,
      p_date_to: validDate(req.query.dateTo)?.toISOString() || null,
      p_limit: limit, p_offset: (page - 1) * limit,
    });
    const logs = history.logs.map((row) => ActivityLog.hydrate(row));
    const total = history.total;
    const resourceTypes = history.resourceTypes;

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
        resourceTypes,
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
    req.user = await User.updateById(req.user._id, req.user);

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
