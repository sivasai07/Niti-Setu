import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const cleanupUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Count all users
    const totalUsers = await collection.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);

    // Find users with old schema (username or email fields)
    const oldUsers = await collection.find({
      $or: [
        { username: { $exists: true } },
        { email: { $exists: true } },
        { password: { $exists: true } }
      ]
    }).toArray();

    console.log(`Found ${oldUsers.length} users with old schema`);

    if (oldUsers.length > 0) {
      console.log('Deleting old users...');
      const result = await collection.deleteMany({
        $or: [
          { username: { $exists: true } },
          { email: { $exists: true } },
          { password: { $exists: true } }
        ]
      });
      console.log(`Deleted ${result.deletedCount} old users`);
    }

    // Show remaining users
    const remainingUsers = await collection.countDocuments();
    console.log(`Remaining users: ${remainingUsers}`);

    console.log('Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up users:', error);
    process.exit(1);
  }
};

cleanupUsers();
