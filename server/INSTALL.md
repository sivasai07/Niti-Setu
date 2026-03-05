# Server Installation Guide

## Install Dependencies

Run this command in the server directory:

```bash
npm install
```

This will install all required packages including:
- express
- mongoose
- bcryptjs (for password hashing)
- jsonwebtoken (for JWT authentication)
- cors
- helmet
- dotenv
- morgan
- express-rate-limit

## If you see "Cannot find package" errors

Run these commands one by one:

```bash
npm install bcryptjs
npm install jsonwebtoken
```

## Setup Environment Variables

1. Copy the example file:
```bash
copy .env.example .env
```

2. Edit `.env` and add your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/niti-setu
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/niti-setu

JWT_SECRET=your-super-secret-key-change-this
```

## Start the Server

```bash
npm run dev
```

The server should start on http://localhost:5000

## Verify Installation

Check if these endpoints work:
- http://localhost:5000/api/health (should return "ok")
- http://localhost:5000/api/auth/check-admin (should return admin status)
