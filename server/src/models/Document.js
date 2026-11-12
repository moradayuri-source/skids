import { defineRepository } from './repository.js';
export default defineRepository('documents', ['title', 'type', 'fileUrl', 'fileKey', 'cloudinary', 'fileSize', 'status', 'uploadedBy']);
