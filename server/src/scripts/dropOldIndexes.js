import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dropOldIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Drop the username and email indexes if they exist
    try {
      await collection.dropIndex('username_1');
      console.log('Dropped username_1 index');
    } catch (error) {
      console.log('username_1 index does not exist or already dropped');
    }

    try {
      await collection.dropIndex('email_1');
      console.log('Dropped email_1 index');
    } catch (error) {
      console.log('email_1 index does not exist or already dropped');
    }

    // Show remaining indexes
    const remainingIndexes = await collection.indexes();
    console.log('Remaining indexes:', remainingIndexes);

    console.log('Index cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error dropping indexes:', error);
    process.exit(1);
  }
};

dropOldIndexes();
