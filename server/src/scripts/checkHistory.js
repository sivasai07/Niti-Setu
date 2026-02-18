import mongoose from 'mongoose';
import dotenv from 'dotenv';
import History from '../models/History.js';

dotenv.config();

const checkHistory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const historyEntries = await History.find({ type: 'scheme' }).sort({ createdAt: -1 }).limit(5);
    
    console.log('\n=== Recent Eligibility History Entries ===\n');
    
    if (historyEntries.length === 0) {
      console.log('No eligibility history entries found.');
    } else {
      historyEntries.forEach((entry, index) => {
        console.log(`\n--- Entry ${index + 1} ---`);
        console.log('Title:', entry.title);
        console.log('Description:', entry.description);
        console.log('Created At:', entry.createdAt);
        console.log('Input Data:', JSON.stringify(entry.inputData, null, 2));
        console.log('Output Data:', entry.outputData ? `${entry.outputData.totalSchemes} schemes` : 'None');
      });
    }

    await mongoose.connection.close();
    console.log('\n\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkHistory();
