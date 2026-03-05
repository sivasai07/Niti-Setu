import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Story from '../models/Story.js';
import connectDB from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const sampleStories = [
  {
    farmerName: 'Rajesh Kumar',
    location: 'Haryana',
    story: 'I never knew I was eligible for PM-KISAN. Within 10 seconds, niti-setu told me everything I needed to know. Now I receive ₹6,000 every year.',
    scheme: 'PM-KISAN',
    impact: 'Increased annual income by ₹6,000',
    imageUrl: '/images/farmer-image.png',
    videoUrl: '/uploads/stories/rajesh-kumar.mp4',
    isActive: true,
  },
  {
    farmerName: 'Lakshmi Devi',
    location: 'Maharashtra',
    story: 'Got a solar pump with 70% subsidy through PM-KUSUM. The voice-based system made it so easy - no complicated forms or visits to the office.',
    scheme: 'PM-KUSUM',
    impact: 'Reduced electricity costs by 70%',
    imageUrl: '/images/farmer-image.png',
    videoUrl: '/uploads/stories/lakshmi-devi.mp4',
    isActive: true,
  },
  {
    farmerName: 'Suresh Patel',
    location: 'Gujarat',
    story: 'This platform is a blessing for farmers. It shows exactly which page of the government document says I\'m eligible. Complete transparency!',
    scheme: 'Agri Infrastructure',
    impact: 'Built modern irrigation system',
    imageUrl: '/images/farmer-image.png',
    videoUrl: '/uploads/stories/suresh-patel.mp4',
    isActive: true,
  },
  {
    farmerName: 'Ramesh Singh',
    location: 'Punjab',
    story: 'Lost my crop to floods last year. Thanks to niti-setu, I found out about crop insurance scheme and got compensation within weeks.',
    scheme: 'Crop Insurance',
    impact: 'Received ₹2,00,000 compensation',
    imageUrl: '/images/farmer-image.png',
    videoUrl: '/uploads/stories/ramesh-singh.mp4',
    isActive: true,
  },
  {
    farmerName: 'Anita Sharma',
    location: 'Rajasthan',
    story: 'The app told me about soil health card scheme in my language. Now I know exactly what nutrients my soil needs. My yield increased by 30%!',
    scheme: 'Soil Health Card',
    impact: 'Increased crop yield by 30%',
    imageUrl: '/images/farmer-image.png',
    videoUrl: '/uploads/stories/anita-sharma.mp4',
    isActive: true,
  },
  {
    farmerName: 'Vijay Reddy',
    location: 'Telangana',
    story: 'Saved 40% water with drip irrigation subsidy. The platform showed me step-by-step how to apply. Everything was so simple and clear.',
    scheme: 'Drip Irrigation',
    impact: 'Saved 40% water usage',
    imageUrl: '/images/farmer-image.png',
    videoUrl: '/uploads/stories/vijay-reddy.mp4',
    isActive: true,
  },
];

async function seedStories() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing stories
    await Story.deleteMany({});
    console.log('Cleared existing stories');

    // Insert sample stories
    const createdStories = await Story.insertMany(sampleStories);
    console.log(`✅ Successfully seeded ${createdStories.length} stories`);

    // Display created stories
    console.log('\nCreated Stories:');
    createdStories.forEach((story, index) => {
      console.log(`${index + 1}. ${story.farmerName} - ${story.scheme}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding stories:', error);
    process.exit(1);
  }
}

seedStories();
