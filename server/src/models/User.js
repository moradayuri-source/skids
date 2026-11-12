import { defineRepository, invalidRecord } from './repository.js';

const profileChoices = {
  gender: ['Male', 'Female', 'Other', 'Prefer not to say', ''],
  civilStatus: ['Single', 'Married', 'Widowed', 'Separated', ''],
  voterStatus: ['Registered', 'Not Registered', ''],
  workStatus: ['Student', 'Employed', 'Unemployed', 'Self-employed', ''],
  youthAgeGroup: ['15-17', '18-24', '25-30', ''],
  educationalBackground: ['Elementary', 'Junior High School', 'Senior High School', 'Vocational', 'College', 'Postgraduate', 'Not in school', ''],
  registeredSkVoter: ['Yes', 'No', ''],
  votedLastSkElection: ['Yes', 'No', ''],
  registeredNationalVoter: ['Yes', 'No', ''],
  attendedSkAssembly: ['Yes', 'No', ''],
  assemblyAttendance: ['1-2 times', '3-4 times', '5 times & above', ''],
};
const classifications = ['In School Youth', 'Out of School Youth', 'Working Youth', 'Person with Disability', 'Children in Conflict with Law', 'Indigenous People', 'Youth with Specific Needs'];

export default defineRepository('users', [
  'googleId', 'passwordHash', 'authProvider', 'email', 'name', 'avatar', 'avatarPublicId',
  'avatarMetadata', 'role', 'barangay', 'profile', 'isActive', 'status', 'lastLoginAt',
], {
  secretFields: ['passwordHash'],
  normalize(values) {
    if (values.email !== undefined) values.email = String(values.email).toLowerCase();
    const profile = values.profile;
    if (profile !== undefined) {
      if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw invalidRecord('Profile must be an object');
      for (const [key, options] of Object.entries(profileChoices)) {
        if (profile[key] != null && !options.includes(profile[key])) throw invalidRecord('Invalid profile ' + key);
      }
      if (profile.age != null && (profile.age === '' || !Number.isFinite(Number(profile.age)))) throw invalidRecord('Profile age must be a number');
      if (profile.youthClassifications != null && (!Array.isArray(profile.youthClassifications)
        || profile.youthClassifications.some((item) => !classifications.includes(item)))) throw invalidRecord('Invalid youth classifications');
    }
    return values;
  },
});
