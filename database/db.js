import mongoose from 'mongoose';
const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/note-app`);
    console.log("MongoDb connect successfully");
  } catch (error) {
    console.error("Failed to connect")
  }
}

export default connectDb;