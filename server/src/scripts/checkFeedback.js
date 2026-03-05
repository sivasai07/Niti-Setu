import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkFeedback = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the feedbacks collection
    const db = mongoose.connection.db;
    const collection = db.collection('feedbacks');

    // Get all feedbacks
    const feedbacks = await collection.find({}).toArray();
    
    console.log(`Total feedbacks: ${feedbacks.length}`);
    feedbacks.forEach((feedback, index) => {
      console.log(`\nFeedback ${index + 1}:`);
      console.log(JSON.stringify(feedback, null, 2));
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking feedbacks:', error);
    process.exit(1);
  }
};

checkFeedback();
