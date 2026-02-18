import mongoose from 'mongoose';
import dotenv from 'dotenv';
import History from '../models/History.js';

dotenv.config();

const clearOldHistory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete old eligibility history entries that don't have inputData
    const result = await History.deleteMany({ 
      type: 'scheme',
      inputData: null 
    });
    
    console.log(`\nDeleted ${result.deletedCount} old eligibility history entries without detailed data.`);
    console.log('\nYou can now test the eligibility check feature to see the new format with:');
    console.log('- Scheme names in description');
    console.log('- Land holding (acres) in description');
    console.log('- Complete input and output data');

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearOldHistory();
