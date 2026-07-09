import { api } from './api';

export const uploadToCloudinary = async (file, { purpose = 'documents' } = {}) => {
  if (!file) {
    throw new Error('A file is required for upload');
  }

  const signatureResponse = await api.uploads.signature({ purpose });
  const { apiKey, folder, signature, timestamp, uploadUrl } = signatureResponse.data;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('folder', folder);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data = await response.json();

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    resourceType: data.resource_type,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    originalFilename: data.original_filename,
  };
};

export const cloudinaryOptimizedUrl = (
  url,
  transformation = 'f_auto,q_auto,c_limit,w_800'
) => {
  if (!url || !url.includes('/upload/')) {
    return url;
  }

  return url.replace('/upload/', `/upload/${transformation}/`);
};
