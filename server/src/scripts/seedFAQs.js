import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FAQ from '../models/FAQ.js';

// Load environment variables
dotenv.config();

const faqs = [
  {
    question: 'What is Niti-Setu?',
    answer: 'Niti-Setu is a voice-based scheme eligibility engine that helps farmers discover and access government schemes they are eligible for. Our platform simplifies the process of finding relevant schemes based on your profile and location.',
    order: 1,
  },
  {
    question: 'How do I register on Niti-Setu?',
    answer: 'Click on the "Register" button, fill in your details including name, phone number, location, and preferred language. Create a 6-digit PIN for secure access. Once registered, you can log in using your phone number and PIN.',
    order: 2,
  },
  {
    question: 'Is Niti-Setu free to use?',
    answer: 'Yes, Niti-Setu is completely free for all farmers. Our mission is to make government schemes accessible to everyone without any cost.',
    order: 3,
  },
  {
    question: 'What languages are supported?',
    answer: 'Currently, Niti-Setu supports Hindi, English, Telugu, and Tamil. We are working on adding more regional languages to serve farmers across India.',
    order: 4,
  },
  {
    question: 'How do I check my eligibility for schemes?',
    answer: 'After logging in, navigate to the Schemes section. Our system automatically matches your profile with available government schemes and shows you the ones you are eligible for.',
    order: 5,
  },
  {
    question: 'Can I update my profile information?',
    answer: 'Yes, you can update your profile information anytime by going to your Profile page. Click on "Edit Profile" to make changes to your details.',
    order: 6,
  },
  {
    question: 'How do I submit feedback?',
    answer: 'Go to the Feedback page where you can record and submit video or audio feedback. This helps us improve our services and understand your needs better.',
    order: 7,
  },
  {
    question: 'What should I do if I forget my PIN?',
    answer: 'Contact our support team through the Support page. Provide your registered phone number, and we will help you reset your PIN securely.',
    order: 8,
  },
  {
    question: 'How often is the scheme information updated?',
    answer: 'We regularly update our database with the latest government schemes and their eligibility criteria to ensure you have access to current information.',
    order: 9,
  },
  {
    question: 'Can I access Niti-Setu on my mobile phone?',
    answer: 'Yes, Niti-Setu is fully responsive and works seamlessly on mobile phones, tablets, and desktop computers.',
    order: 10,
  },
];

const seedFAQs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing FAQs
    await FAQ.deleteMany({});
    console.log('Cleared existing FAQs');

    // Insert new FAQs
    await FAQ.insertMany(faqs);
    console.log(`Inserted ${faqs.length} FAQs`);

    console.log('FAQ seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
};

seedFAQs();
