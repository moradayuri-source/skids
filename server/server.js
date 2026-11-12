import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { bootstrapAdminPassword } from './src/utils/bootstrapAdmin.js';

const PORT = process.env.PORT || 5000;

const validateEnvironment = () => {
  const required = ['SUPABASE_URL', 'JWT_SECRET'];

  if (process.env.NODE_ENV === 'production') {
    required.push(
      'GOOGLE_CLIENT_ID',
      'CORS_ORIGINS',
      'ADMIN_EMAILS',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    );
  }

  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
};

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDB();
    await bootstrapAdminPassword();

    app.listen(PORT, () => {
      console.log(`SKIDS API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start SKIDS API:', error);
    process.exit(1);
  }
};

startServer();
