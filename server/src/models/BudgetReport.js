import { defineRepository } from './repository.js';
export default defineRepository('budget_reports', [
  'title', 'amount', 'currency', 'category', 'status', 'reportDate', 'notes',
  'fileUrl', 'fileKey', 'fileSize', 'cloudinary', 'createdBy',
], { hydrate: (record) => ({ ...record, amount: Number(record.amount) }) });
