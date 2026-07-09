import ActivityLog from '../models/ActivityLog.js';

export const inferActionType = (action = '') => {
  const normalized = action.toLowerCase();

  if (normalized.includes('logged in')) return 'login';
  if (normalized.includes('logged out')) return 'logout';
  if (/^(created|posted|uploaded|sent|replied|registered)/.test(normalized)) return 'create';
  if (/^(updated|edited|marked)/.test(normalized)) return 'update';
  if (/^(deleted|removed)/.test(normalized)) return 'delete';

  return 'other';
};

const requestIp = (req) => {
  const forwardedFor = req?.headers?.['x-forwarded-for'];
  return String(forwardedFor || req?.ip || '')
    .split(',')[0]
    .trim();
};

export const logActivity = async ({
  req,
  user,
  action,
  actionType,
  resourceType = '',
  resourceId = null,
  details = '',
  metadata = {},
}) => {
  if (!user?._id) {
    return null;
  }

  try {
    return await ActivityLog.create({
      actor: user._id,
      actorName: user.name || user.email,
      actorRole: user.role || '',
      actionType: actionType || inferActionType(action),
      action,
      resourceType,
      resourceId,
      details,
      metadata,
      ipAddress: requestIp(req),
      userAgent: String(req?.headers?.['user-agent'] || ''),
    });
  } catch (error) {
    console.error('Unable to record activity log:', error.message);
    return null;
  }
};
