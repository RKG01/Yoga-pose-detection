# 🧘‍♀️ PoseMinds Setup Guide

Complete setup guide for the Yoga Pose Detection app with MongoDB authentication.

## 📋 Prerequisites

- **Node.js** 
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🚀 Quick Setup

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Yoga-pose-detection

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: Follow official MongoDB installation guide

# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Whitelist your IP address

### 3. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/yoga-app
# OR for Atlas: mongodb+srv://username:password@cluster.mongodb.net/yoga-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the Application

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

#### Terminal 2 - Frontend App
```bash
cd frontend
npm start
# App will start on http://localhost:3000
```

## 🔧 Development Commands

### Backend
```bash
npm start          # Production mode
npm run dev        # Development with nodemon
```

### Frontend
```bash
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

## 📊 Database Schema

### Users Collection
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  profile: {
    firstName: String,
    lastName: String,
    age: Number,
    experienceLevel: String,
    goals: [String],
    avatar: String
  },
  preferences: {
    theme: String,
    difficulty: String,
    voiceFeedback: Boolean,
    soundEffects: Boolean,
    confidenceThreshold: Number,
    holdTime: Number
  },
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

### Progress Collection
```javascript
{
  userId: ObjectId,
  totalSessions: Number,
  totalTime: Number,
  currentStreak: Number,
  longestStreak: Number,
  poseStats: {
    Tree: { attempts, bestHold, perfectHolds, averageAccuracy },
    Chair: { ... },
    // ... other poses
  },
  achievements: [{
    achievementId: String,
    unlockedAt: Date,
    title: String,
    description: String
  }],
  sessions: [{
    pose: String,
    startTime: Date,
    endTime: Date,
    duration: Number,
    bestHold: Number,
    averageAccuracy: Number,
    perfectHolds: Number
  }]
}
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-token` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/preferences` - Update preferences
- `DELETE /api/user/account` - Deactivate account

### Progress Tracking
- `GET /api/progress` - Get user progress
- `POST /api/progress/session` - Add new session
- `POST /api/progress/achievement` - Add achievement
- `GET /api/progress/stats` - Get statistics
- `GET /api/progress/sessions` - Get session history
- `DELETE /api/progress` - Clear progress data

## 🎯 Features

### ✅ Authentication System
- User registration and login
- JWT token-based authentication
- Protected routes
- User profile management

### ✅ Progress Tracking
- Session recording with MongoDB
- Real-time statistics
- Achievement system
- Streak tracking
- Personal records

### ✅ Enhanced UI
- User dashboard
- Progress visualization
- Achievement notifications
- Settings management

### ✅ Data Persistence
- All user data stored in MongoDB
- Cross-device synchronization
- Backup and restore capabilities

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# For Atlas, verify connection string and IP whitelist
```

#### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change port in backend/.env
PORT=5001
```

#### CORS Errors
- Verify `FRONTEND_URL` in backend/.env
- Check if both servers are running

#### JWT Token Issues
- Verify `JWT_SECRET` is set in backend/.env
- Clear browser localStorage if needed

### Reset Database
```bash
# Connect to MongoDB
mongo

# Switch to yoga-app database
use yoga-app

# Drop all collections
db.users.drop()
db.progresses.drop()
```

## 📱 Mobile Development

### Android Build
```bash
cd frontend
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## 🚀 Production Deployment

### Backend (Node.js)
- Deploy to Heroku, Railway, or DigitalOcean
- Set environment variables
- Use MongoDB Atlas for database

### Frontend (React)
- Deploy to Netlify, Vercel, or GitHub Pages
- Update `REACT_APP_API_URL` to production backend URL

## 📞 Support

If you encounter any issues:

1. Check this setup guide
2. Verify all environment variables
3. Ensure MongoDB is running
4. Check console logs for errors
5. Create an issue on GitHub

---

**Happy Yoga Practice! 🧘‍♀️✨**
