import { callRpc } from '../config/db.js';
import { getAdminEmails, hashPassword } from './auth.js';

export const bootstrapAdminPassword = async () => {
  const password = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || '');
  if (!password) return;
  if (password.length < 12) throw new Error('ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters');
  const [email] = getAdminEmails();
  if (!email) throw new Error('ADMIN_EMAILS must contain the chairperson email before password bootstrap');
  const result = await callRpc('skids_bootstrap_admin', {
    p_email: email, p_name: String(process.env.ADMIN_BOOTSTRAP_NAME || 'SK Chairperson').trim(),
    p_password_hash: await hashPassword(password),
  });
  console.log(result.bootstrapped
    ? 'Chairperson password bootstrapped for ' + email
    : 'Chairperson password already exists for ' + email + '; bootstrap skipped');
};
