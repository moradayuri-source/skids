import User from '../models/User.js';
import { getAdminEmails, hashPassword } from './auth.js';

export const bootstrapAdminPassword = async () => {
  const password = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || '');

  if (!password) {
    return;
  }

  if (password.length < 12) {
    throw new Error('ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters');
  }

  const [email] = getAdminEmails();
  if (!email) {
    throw new Error('ADMIN_EMAILS must contain the chairperson email before password bootstrap');
  }

  const name = String(process.env.ADMIN_BOOTSTRAP_NAME || 'SK Chairperson').trim();
  let admin = await User.findOne({ email }).select('+passwordHash');

  if (admin?.passwordHash) {
    console.log(`Chairperson password already exists for ${email}; bootstrap skipped`);
    return;
  }

  const passwordHash = await hashPassword(password);

  if (!admin) {
    admin = await User.create({
      email,
      name,
      passwordHash,
      authProvider: 'password',
      role: 'admin',
      isActive: true,
      status: 'active',
    });
  } else {
    admin.passwordHash = passwordHash;
    admin.role = 'admin';
    admin.authProvider = admin.googleId ? 'both' : 'password';
    admin.isActive = true;
    admin.status = 'active';
    await admin.save();
  }

  console.log(`Chairperson password bootstrapped for ${admin.email}`);
};
