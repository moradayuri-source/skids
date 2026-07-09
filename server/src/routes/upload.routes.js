import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getCloudinaryConfig } from '../config/cloudinary.js';

const router = express.Router();

const allowedPurposes = new Set(['avatars', 'documents', 'announcements', 'events']);

const normalizePurpose = (purpose) => {
  if (allowedPurposes.has(purpose)) {
    return purpose;
  }

  return 'documents';
};

router.use(requireAuth);

router.post(
  '/signature',
  asyncHandler(async (req, res) => {
    const cloudinary = getCloudinaryConfig();
    const timestamp = Math.round(Date.now() / 1000);
    const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'skids';
    const purpose = normalizePurpose(req.body.purpose);
    const folder = `${baseFolder}/${purpose}`;

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      signature,
      timestamp,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    });
  })
);

export default router;
