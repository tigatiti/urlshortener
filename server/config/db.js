import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({path: '../.env'});
const url = process.env['MONGO_URI'];

console.log(url);

const connectDB = async () => {
  try {
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;