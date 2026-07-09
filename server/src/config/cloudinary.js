import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
};

export const getCloudinaryConfig = () => {
  const instance = configureCloudinary();

  if (!instance) {
    const error = new Error('Cloudinary environment variables are not configured');
    error.statusCode = 500;
    throw error;
  }

  return instance;
};
