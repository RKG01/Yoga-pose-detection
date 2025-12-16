# Yoga Pose Detection - Backend API

Express.js REST API with MongoDB for user authentication and progress tracking.

## 🚀 Quick Deploy to Render

**[📖 Full Deployment Guide →](./RENDER_DEPLOY.md)**

### One-Click Deploy (Recommended)

1. Fork this repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Render will auto-detect settings from `render.yaml`
6. Add environment variables (see below)
7. Click "Create Web Service"

### Required Environment Variables

Add these in Render Dashboard under "Environment":

```bash
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=change-this-to-a-random-string-minimum-32-characters
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend-url.vercel.app
NODE_ENV=production
```

## 📁 Project Structure

```
backend/
├── middleware/         # Auth middleware, validators
├── models/            # MongoDB schemas (User, Progress)
├── routes/            # API routes
│   ├── auth.js       # Login, register
│   ├── user.js       # User profile
│   └── progress.js   # Yoga progress tracking
├── server.js          # Main server file
├── package.json
├── render.yaml        # Render deployment config
└── RENDER_DEPLOY.md   # Detailed deployment guide
```

## 🔗 API Endpoints

### Base URL
- **Local:** `http://localhost:5000`
- **Production:** `https://your-app.onrender.com`

### Endpoints

#### Health Check
```http
GET /api/health
```
Returns server status and database connection state.

#### Authentication
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

```http
PUT /api/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "preferences": { ... }
}
```

#### Progress Tracking
```http
GET /api/progress
Authorization: Bearer <token>
```

```http
POST /api/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "pose": "Tree",
  "duration": 120,
  "accuracy": 95,
  "date": "2025-12-14T10:00:00Z"
}
```

## 🛠️ Local Development

### Prerequisites
- Node.js 16+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Setup

1. **Clone and navigate:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
cp .env.example .env
```

4. **Edit .env with your values:**
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

5. **Start development server:**
```bash
npm run dev
```

Server runs at `http://localhost:5000`

### Available Scripts

```bash
npm start       # Production server
npm run dev     # Development with nodemon
npm test        # Run tests (not configured yet)
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a database user with a secure password
3. Get your connection string from "Connect" → "Connect your application"
4. Replace the `MONGODB_URI` in your `.env` file

**Important for Render deployment:**
- Go to MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (Allow from anywhere)
- This is required because Render uses dynamic IPs

### Collections
- `users` - User accounts and auth
- `progress` - Yoga session records

## 🔐 Security Features

- ✅ Helmet.js for secure HTTP headers
- ✅ Rate limiting (100 requests per 15 min)
- ✅ CORS configured
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Environment variables for secrets

## 📊 Monitoring & Logs

### Render Dashboard
- View logs: Dashboard → Your Service → Logs
- Metrics: CPU, memory, response times
- Events: Deployments, crashes

### Health Check
Visit `/api/health` to check:
- Server status
- Database connection
- Timestamp
- Environment

## ⚡ Performance

### Free Tier (Render)
- Spins down after 15 min inactivity
- Cold start: ~30-60 seconds
- **Solution:** Use a cron job to ping `/api/health` every 10 minutes

### Recommended: UptimeRobot
1. Sign up at [UptimeRobot](https://uptimerobot.com)
2. Add monitor for `https://your-app.onrender.com/api/health`
3. Set interval to 5 minutes
4. Keeps service warm!

## 🔄 Deployment Workflow

### Automatic Deployment
1. Push to GitHub main branch
2. Render auto-deploys
3. Check logs for deployment status

### Manual Deployment
1. Go to Render Dashboard
2. Your Service → "Manual Deploy"
3. "Deploy latest commit"

## 🐛 Troubleshooting

### "Application failed to respond"
- Check environment variables are set
- Verify MongoDB connection string
- Check logs in Render Dashboard

### CORS Errors
- Ensure `FRONTEND_URL` is correct
- Include `https://` protocol
- Check server.js CORS config

### Database Connection Failed
- MongoDB Atlas: Allow IP `0.0.0.0/0`
- Verify connection string format
- Check MongoDB cluster status

### Rate Limit Errors
- Increase limit in `server.js` if needed
- Default: 100 requests per 15 min

## 📈 Scaling

### Upgrade from Free Tier
- **Starter:** $7/month - Always on, no cold starts
- **Standard:** $25/month - More resources
- **Pro:** $85/month - Priority support

### Horizontal Scaling
- Add more instances in Render Dashboard
- Consider Redis for session management
- Implement caching strategy

## 🧪 Testing

```bash
# Test health endpoint
curl https://your-app.onrender.com/api/health

# Test with authorization
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-app.onrender.com/api/user/profile
```

## 📝 Dependencies

| Package | Purpose |
|---------|---------|
| express | Web framework |
| mongoose | MongoDB ODM |
| jsonwebtoken | JWT auth |
| bcryptjs | Password hashing |
| cors | Cross-origin requests |
| helmet | Security headers |
| express-rate-limit | Rate limiting |
| dotenv | Environment variables |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test locally
5. Submit pull request

## 📄 License

MIT License - See LICENSE file

## 🆘 Support

- **Render Issues:** [Render Docs](https://render.com/docs)
- **MongoDB Issues:** [MongoDB Docs](https://docs.atlas.mongodb.com/)
- **API Issues:** Open GitHub issue

---

**Deployment Status:** [![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?logo=render)](https://render.com)
