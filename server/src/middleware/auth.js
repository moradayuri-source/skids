import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401);
    throw new Error('Authentication token is required');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Invalid or expired authentication token');
  }

  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive || ['pending', 'suspended'].includes(user.status)) {
    res.status(401);
    throw new Error('Authenticated user was not found');
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('You do not have permission to access this resource');
  }

  next();
};
