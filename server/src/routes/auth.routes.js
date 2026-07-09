import { OAuth2Client } from 'google-auth-library';
import express from 'express';
import User from '../models/User.js';
import YouthProfile from '../models/YouthProfile.js';
import { logActivity } from '../utils/activityLogger.js';
import asyncHandler from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import {
  getAdminEmails,
  hashPassword,
  publicUser,
  signAuthToken,
  verifyPassword,
} from '../utils/auth.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SK_OFFICER_POSITIONS = new Set([
  'SK Chairperson',
  'SK Kagawad',
  'SK Secretary',
  'SK Treasurer',
  'SK Auditor',
]);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const cleanText = (value) => String(value || '').trim();

const optionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const buildName = ({ firstName, middleInitial, middleName, lastName, suffix, name }) => {
  const fullName = cleanText(name);

  if (fullName) {
    return fullName;
  }

  return [firstName, middleInitial || middleName, lastName, suffix]
    .map(cleanText)
    .filter(Boolean)
    .join(' ');
};

const resolveRole = ({ body, email }) => {
  const adminEmails = getAdminEmails();
  const position = cleanText(body.position || body.profile?.position);

  if (
    body.role === 'admin' ||
    body.accountType === 'officer' ||
    SK_OFFICER_POSITIONS.has(position) ||
    adminEmails.has(email)
  ) {
    return 'admin';
  }

  return 'user';
};

const createYouthProfileForUser = async ({ user, body }) => {
  const profile = body.youthProfile || body.profile || {};
  const firstName = cleanText(body.firstName || profile.firstName);
  const middleName = cleanText(body.middleName || body.middleInitial || profile.middleName);
  const lastName = cleanText(body.lastName || profile.lastName);
  const suffix = cleanText(body.suffix || profile.suffix);
  const name = buildName({
    firstName,
    middleName,
    lastName,
    suffix,
    name: profile.name || body.name || user.name,
  });

  await YouthProfile.create({
    user: user._id,
    name,
    age: optionalNumber(profile.age),
    barangay: cleanText(profile.barangay || body.barangay) || 'Masagui',
    contact: cleanText(profile.contact || body.contact),
    email: user.email,
    gender: cleanText(profile.gender),
    civilStatus: cleanText(profile.civilStatus),
    voterStatus: cleanText(profile.voterStatus),
    workStatus: cleanText(profile.workStatus),
    createdBy: user._id,
    updatedBy: user._id,
  });
};

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    if (!password || password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    const existingUser = await User.findOne({ email }).select('+passwordHash');

    if (existingUser) {
      res.status(409);
      throw new Error('An account with this email already exists');
    }

    const name = buildName(req.body);

    if (!name) {
      res.status(400);
      throw new Error('Name is required');
    }

    const role = resolveRole({ body: req.body, email });
    const passwordHash = await hashPassword(password);
    const profile = req.body.profile || req.body.youthProfile || {};

    const user = await User.create({
      email,
      passwordHash,
      authProvider: 'password',
      name,
      role,
      barangay: cleanText(profile.barangay || req.body.barangay) || 'Masagui',
      isActive: true,
      status: 'active',
      profile: {
        position: cleanText(req.body.position || profile.position),
        contact: cleanText(profile.contact || req.body.contact),
        address: cleanText(
          profile.address ||
            [profile.purok, profile.barangay, profile.municipality, profile.province, profile.region]
              .map(cleanText)
              .filter(Boolean)
              .join(', ')
        ),
        age: optionalNumber(profile.age),
        gender: cleanText(profile.gender),
        civilStatus: cleanText(profile.civilStatus),
        voterStatus: cleanText(profile.voterStatus),
        workStatus: cleanText(profile.workStatus),
      },
    });

    if (role === 'user') {
      await createYouthProfileForUser({ user, body: req.body });
    }

    await logActivity({
      req,
      user,
      action: 'Registered account',
      actionType: 'create',
      resourceType: 'User',
      resourceId: user._id,
      details: user.email,
      metadata: { authProvider: 'password' },
    });

    res.status(201).json({
      token: signAuthToken(user),
      user: publicUser(user),
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (!user.isActive || ['pending', 'suspended'].includes(user.status)) {
      res.status(403);
      throw new Error('This account is not active');
    }

    user.lastLoginAt = new Date();
    await user.save();

    await logActivity({
      req,
      user,
      action: 'Logged in',
      actionType: 'login',
      resourceType: 'User',
      resourceId: user._id,
      details: 'Email and password',
      metadata: { authProvider: 'password' },
    });

    res.json({
      token: signAuthToken(user),
      user: publicUser(user),
    });
  })
);

router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
      res.status(400);
      throw new Error('Google credential is required');
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      res.status(500);
      throw new Error('GOOGLE_CLIENT_ID is not configured');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      res.status(401);
      throw new Error('Google account email must be verified');
    }

    const email = payload.email.toLowerCase();
    const adminEmails = getAdminEmails();
    const existingUser = await User.findOne({
      $or: [{ googleId: payload.sub }, { email }],
    }).select('+passwordHash');

    const role =
      existingUser?.role === 'admin' || adminEmails.has(email) ? 'admin' : 'user';

    const user = await User.findOneAndUpdate(
      { $or: [{ googleId: payload.sub }, { email }] },
      {
        $set: {
          googleId: payload.sub,
          email,
          name: payload.name || email,
          avatar: existingUser?.avatar || payload.picture || '',
          role,
          authProvider: existingUser?.passwordHash ? 'both' : 'google',
          lastLoginAt: new Date(),
          isActive: true,
          status: 'active',
        },
        $setOnInsert: {
          barangay: 'Masagui',
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    await logActivity({
      req,
      user,
      action: 'Logged in',
      actionType: 'login',
      resourceType: 'User',
      resourceId: user._id,
      details: 'Google',
      metadata: { authProvider: 'google' },
    });

    res.json({
      token: signAuthToken(user),
      user: publicUser(user),
    });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: publicUser(req.user) });
  })
);

router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    await logActivity({
      req,
      user: req.user,
      action: 'Logged out',
      actionType: 'logout',
      resourceType: 'User',
      resourceId: req.user._id,
      details: req.user.email,
    });

    res.json({ message: 'Logged out' });
  })
);

export default router;
