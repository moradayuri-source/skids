import mongoose from 'mongoose';

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${connection.connection.host}`);

  return connection;
};

export default connectDB;
