# Niti-Setu

Voice-Based Scheme Eligibility Engine - A modern, production-ready landing page built with the MERN stack.

## 🚀 Tech Stack

### Frontend
- **React 18+** - Modern UI library with functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom theme
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icons
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit and property-based testing
- **React Testing Library** - Component testing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

## 📁 Project Structure

```
niti-setu-landing-page/
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── layout/      # Navigation, Footer
│   │   │   ├── sections/    # Hero, Features, etc.
│   │   │   ├── ui/          # Reusable UI components
│   │   │   └── providers/   # Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and helpers
│   │   ├── data/            # Static content
│   │   ├── styles/          # Global styles
│   │   ├── test/            # Test utilities
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                   # Backend Express application
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   └── server.js        # Entry point
│   ├── .env.example
│   └── package.json
│
│   └── niti-setu-landing-page/
│       ├── requirements.md  # Requirements document
│       ├── design.md        # Design document
│       └── tasks.md         # Implementation tasks
│
├── .gitignore
├── package.json             # Root package.json
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas cluster)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd niti-setu-landing-page
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

4. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📜 Available Scripts

### Root Directory
- `npm run dev` - Start both client and server concurrently
- `npm run install-all` - Install dependencies for all packages

### Client (Frontend)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI

### Server (Backend)
- `npm run dev` - Start server with nodemon (auto-reload)
- `npm start` - Start server in production mode

## 🎨 Design Features

- **Premium Government-Tech Aesthetic** - Clean, modern, and trustworthy
- **Indian Tricolor Accents** - Subtle use of saffron, white, and green
- **Dark/Light Mode** - Full theme support with persistence
- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG 2.1 AA compliant
- **Smooth Animations** - Framer Motion powered transitions

## 🧪 Testing

The project uses a dual testing approach:
- **Unit Tests** - Specific examples and edge cases
- **Property-Based Tests** - Universal correctness properties

Run tests:
```bash
cd client
npm test
```

## 📋 Implementation Guide

1. Project setup and configuration
2. Core utilities and hooks
3. Theme system
4. Base UI components
5. Navigation component
6. Content sections
7. Accessibility features
8. Performance optimizations
9. SEO and metadata
10. Integration and testing

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- Environment variable protection

## 📝 License

MIT

