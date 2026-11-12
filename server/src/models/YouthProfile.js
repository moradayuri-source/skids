import { defineRepository } from './repository.js';

export default defineRepository('youth_profiles', [
  'userId', 'name', 'age', 'barangay', 'contact', 'email', 'gender',
  'civilStatus', 'voterStatus', 'workStatus', 'createdBy', 'updatedBy',
], {
  relation: 'user:users!youth_profiles_userId_fkey(_id,avatar,name,email)',
  normalize(values) {
    if (values.email !== undefined) values.email = String(values.email).toLowerCase();
    return values;
  },
  hydrate(record) {
    record.user = record.user ?? record.userId ?? null;
    delete record.userId;
    return record;
  },
});
