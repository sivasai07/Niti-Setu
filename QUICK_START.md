# Niti-Setu Quick Start Guide

## Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (already configured)
- Modern web browser (Chrome or Edge recommended)

## Installation

### 1. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

## Running the Application

### Start Backend Server
```bash
cd server
npm start
```
**Expected Output:**
```
GROQ_API_KEY loaded: Yes
Server running in development mode on port 5000
MongoDB Connected: ac-q010zjv-shard-00-01.hka6ywf.mongodb.net
```

### Start Frontend Client
```bash
cd client
npm run dev
```
**Expected Output:**
```
VITE v5.4.21  ready in 756 ms
➜  Local:   http://localhost:3001/
```

## Access the Application

Open your browser and navigate to:
```
http://localhost:3001
```

## Quick Test

### Test Voice Input
1. Click "Check Eligibility Now"
2. Click the microphone button
3. Say: "I am from Telangana state Hyderabad district. I have 5 acres of land. I grow rice."
4. Watch the form auto-fill!

### Test Language Switching
1. Click the language dropdown
2. Select "हिंदी (Hindi)" or "తెలుగు (Telugu)"
3. See the entire UI translate instantly

### Test Eligibility Check
1. Fill in all form fields (or use voice)
2. Click "Check Eligibility"
3. View your eligible schemes
4. Listen to results in your language

## Troubleshooting

### Port Already in Use
```bash
# Windows PowerShell
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Server Not Starting
1. Check if `.env` file exists in `server/` directory
2. Verify GROQ_API_KEY is present
3. Check MongoDB connection string

### Voice Not Working
1. Use Chrome or Edge browser
2. Allow microphone permissions when prompted
3. Ensure you're on localhost or HTTPS

## API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Parse Voice Transcript
```bash
curl -X POST http://localhost:5000/api/groq/parse \
  -H "Content-Type: application/json" \
  -d '{"transcript":"I am from Telangana","language":"en"}'
```

### Translate Text
```bash
curl -X POST http://localhost:5000/api/groq/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","fromLang":"en","toLang":"hi"}'
```

## Supported Languages

- English (en)
- Hindi (hi)
- Telugu (te)
- Tamil (ta)
- Kannada (kn)
- Malayalam (ml)
- Bengali (bn)
- Gujarati (gu)
- Punjabi (pa)
- Marathi (mr)

## Key Features

✅ Voice input in 10 Indian languages
✅ Automatic language detection
✅ AI-powered form auto-fill
✅ Real-time translation
✅ Eligibility checking for PM-KISAN, PM-KUSUM, AIF
✅ Speech output in multiple languages
✅ User authentication and history

## Need Help?

Check these files:
- `DEPLOYMENT_COMPLETE.md` - Full deployment guide
- `GROQ_INTEGRATION_COMPLETE.md` - Groq API details
- `ADD_REMAINING_LANGUAGES.md` - How to add more languages

## Development Mode

### Backend with Auto-Reload
```bash
cd server
npm run dev
```

### Frontend with Hot Reload
```bash
cd client
npm run dev
```

## Production Build

### Frontend
```bash
cd client
npm run build
npm run preview
```

## Environment Variables

### Backend (server/.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=100d
GROQ_API_KEY=your_groq_api_key
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:5000
```

## Success Indicators

✅ Server shows "GROQ_API_KEY loaded: Yes"
✅ Server shows "MongoDB Connected"
✅ Client shows Vite dev server URL
✅ Browser opens without errors
✅ Microphone button appears on eligibility page
✅ Language dropdown shows all languages

## Common Issues

### Issue: "Cannot find package 'node-fetch'"
**Solution**: Already fixed! We use native fetch API now.

### Issue: "GROQ_API_KEY not configured"
**Solution**: Restart the server. The fix is already applied.

### Issue: "Port 5000 is in use"
**Solution**: Kill the process and restart (see Troubleshooting section).

### Issue: Voice recognition not working
**Solution**: Use Chrome/Edge and allow microphone permissions.

## What's Next?

1. Test voice input in different languages
2. Try the eligibility checker with real data
3. Explore the admin dashboard
4. Check your history page
5. Provide feedback through the app

## Support

For detailed information, see:
- Full documentation in `DEPLOYMENT_COMPLETE.md`
- API details in `GROQ_INTEGRATION_COMPLETE.md`
- Language guide in `ADD_REMAINING_LANGUAGES.md`

---

**Ready to go!** 🚀 Your Niti-Setu application is now running with full multilingual voice support powered by Groq AI.
