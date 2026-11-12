import { defineRepository } from './repository.js';
export default defineRepository('activity_logs', [
  'actor', 'actorName', 'actorRole', 'actionType', 'action', 'resourceType',
  'resourceId', 'details', 'metadata', 'ipAddress', 'userAgent',
]);
