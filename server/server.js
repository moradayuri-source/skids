import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);

    app.listen(PORT, () => {
      console.log(`SKIDS API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start SKIDS API:', error);
    process.exit(1);
  }
};

startServer();
