// src/server/src/db.ts
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// MongoDB Connection
export const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finlex-db';
    
    console.log("🔄 Attempting to connect to MongoDB...");
    console.log("📍 URI (without password):", MONGODB_URI.split('@')[1] ? `mongodb+srv://Abhi:***@${MONGODB_URI.split('@')[1]}` : MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
      authSource: 'admin'
    });
    
    console.log('✅ MongoDB Connected successfully!');
    return mongoose.connection;
  } catch (error: any) {
    console.error('❌ MongoDB Connection Error:', error.message);
    if (error.message.includes('whitelist')) {
      console.error('⚠️  Your IP address is not whitelisted in MongoDB Atlas.');
      console.error('🔗 Please add your IP: https://cloud.mongodb.com/v2#/org//security/whitelist');
    }
    throw error;
  }
};

export default mongoose;
