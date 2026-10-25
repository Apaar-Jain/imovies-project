import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectDB(): Promise<string> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return 'Already connected to MongoDB';
  }

  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      console.log('Connecting to provided MONGODB_URI...');
      await mongoose.connect(mongoUri);
      isConnected = true;
      console.log('MongoDB Atlas / External Database Connected successfully');
      return mongoUri;
    } catch (err) {
      console.warn('Failed connecting to MONGODB_URI, falling back to embedded MongoMemoryServer:', err);
    }
  }

  // Fallback to embedded in-memory MongoDB engine for zero-config out-of-the-box operation
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    isConnected = true;
    console.log(`Connected to In-Memory MongoDB engine successfully at ${uri}`);
    return uri;
  } catch (err) {
    console.error('Fatal error connecting to MongoDB:', err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
