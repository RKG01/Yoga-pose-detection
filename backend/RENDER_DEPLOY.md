# Yoga Pose Detection - Backend API

Backend server for the Yoga Pose Detection application with user authentication and progress tracking.

## 🚀 Deployed on Render

This backend is configured for easy deployment on Render.com.

### Quick Deploy to Render

1. **Fork/Clone this repository**

2. **Create a new Web Service on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select this backend directory

3. **Configure Environment Variables:**
   
   In Render Dashboard, add these environment variables:

   ```
   MONGODB_URI=mongodb+srv://rk5849193_db_user:wXre5A3XYpnjnBUu@cluster0.c20ku2r.mongodb.net/
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy Settings:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
   - **Plan:** Free (or upgrade as needed)

5. **Click "Create Web Service"** - Render will automatically deploy!

### Alternative: Using render.yaml (Blueprint)

This repository includes a `render.yaml` file for automated deployment:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will detect `render.yaml` and create the service automatically
5. Add your secret environment variables in the Render dashboard

## 📋 Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-random-secret-key-here` |
| `JWT_EXPIRE` | JWT token expiration time | `7d` |
| `FRONTEND_URL` | Your frontend URL (for CORS) | `https://yoga-app.vercel.app` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` (Render default) |

## 🔗 API Endpoints

Once deployed, your API will be available at: `https://your-app-name.onrender.com`

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### User Routes
```
GET /api/user/profile
PUT /api/user/profile
```

### Progress Tracking
```
GET /api/progress
POST /api/progress
PUT /api/progress/:id
DELETE /api/progress/:id
```

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Create .env file with your variables
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## 📝 Important Notes

### MongoDB Setup
- Already configured with MongoDB Atlas
- Database connection string is in environment variables
- Free tier is sufficient for testing

### Frontend CORS
- Make sure to update `FRONTEND_URL` with your actual frontend URL
- Multiple origins can be configured in `server.js` if needed

### Security
- Change `JWT_SECRET` to a strong random string
- Never commit `.env` file to version control
- Use Render's environment variables for secrets

## 🔄 Auto-Deploy

Render automatically deploys when you push to your main branch. To trigger a manual deploy:

1. Go to your service in Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

## 📊 Monitoring

- **Health Check:** Visit `/api/health` to verify server status
- **Logs:** Available in Render Dashboard under "Logs" tab
- **Metrics:** Check "Metrics" tab for CPU, memory usage

## ⚡ Free Tier Limitations

Render free tier includes:
- ✅ 750 hours/month (more than enough)
- ✅ Automatic HTTPS
- ✅ Auto-deploy from Git
- ⚠️ Service spins down after 15 min of inactivity
- ⚠️ Cold starts may take 30-60 seconds

To keep service warm, consider:
- Using a cron job to ping `/api/health` every 10 minutes
- Upgrading to paid plan ($7/month)

## 🆘 Troubleshooting

**Service won't start:**
- Check environment variables are set correctly
- Verify MongoDB URI is valid
- Check logs in Render Dashboard

**CORS errors:**
- Ensure `FRONTEND_URL` matches your frontend domain exactly
- Include protocol (https://)

**Database connection failed:**
- Verify MongoDB Atlas cluster is running
- Check IP whitelist (Render uses dynamic IPs - allow all: `0.0.0.0/0`)
- Test connection string locally first

## 📞 Support

For issues related to:
- **Render deployment:** [Render Docs](https://render.com/docs)
- **MongoDB Atlas:** [MongoDB Docs](https://docs.atlas.mongodb.com/)
- **This app:** Open an issue on GitHub

---

**Live API:** https://your-service-name.onrender.com
**Status:** [![Render Status](https://img.shields.io/badge/status-deployed-success)](https://render.com)
