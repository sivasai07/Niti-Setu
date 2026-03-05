import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const viewUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Get all users
    const users = await collection.find({}).toArray();
    
    console.log('All users:');
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(JSON.stringify(user, null, 2));
    });

    process.exit(0);
  } catch (error) {
    console.error('Error viewing users:', error);
    process.exit(1);
  }
};

viewUsers();
