import { defineRepository } from './repository.js';
export default defineRepository('messages', ['sender', 'senderName', 'senderEmail', 'subject', 'message', 'status'], {
  relation: 'replies:message_replies(*)',
  normalize(values) {
    if (values.senderEmail !== undefined) values.senderEmail = String(values.senderEmail).toLowerCase();
    return values;
  },
  hydrate(record) {
    record.replies = (record.replies || []).sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt) || a._id.localeCompare(b._id));
    return record;
  },
});
