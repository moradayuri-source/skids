import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_HASH_PREFIX = 'scrypt';

export const signAuthToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

export const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  avatarPublicId: user.avatarPublicId,
  avatarMetadata: user.avatarMetadata || {},
  role: user.role,
  barangay: user.barangay,
  profile: user.profile || {},
  status: user.status,
});

export const getAdminEmails = () =>
  new Set(
    (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );

const scrypt = (password, salt) =>
  new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, PASSWORD_KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });

export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt);

  return `${PASSWORD_HASH_PREFIX}:${salt}:${derivedKey.toString('hex')}`;
};

export const verifyPassword = async (password, passwordHash) => {
  if (!passwordHash) {
    return false;
  }

  const [prefix, salt, storedHash] = passwordHash.split(':');

  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !storedHash) {
    return false;
  }

  const derivedKey = await scrypt(password, salt);
  const storedKey = Buffer.from(storedHash, 'hex');

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedKey, derivedKey);
};
