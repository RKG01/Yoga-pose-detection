# 🚀 Render Deployment Checklist

## Before You Deploy

- [ ] MongoDB Atlas is set up and running
- [ ] IP whitelist includes `0.0.0.0/0` in MongoDB Atlas → Network Access
- [ ] You have your MongoDB connection string ready
- [ ] Backend code is pushed to GitHub

## Deployment Steps

### 1. Create Web Service on Render

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not already)
4. Select your repository: `Yoga-pose-detection`
5. Click **"Connect"**

### 2. Configure Build Settings

Render should auto-detect from `render.yaml`, but verify:

- **Name:** `yoga-pose-backend` (or your choice)
- **Region:** Oregon (Free)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 3. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add each of these:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `MONGODB_URI` | `mongodb+srv://rk5849193_db_user:wXre5A3XYpnjnBUu@cluster0.c20ku2r.mongodb.net/` | Your MongoDB connection |
| `JWT_SECRET` | `your-random-secret-minimum-32-chars` | **CHANGE THIS!** Use a password generator |
| `JWT_EXPIRE` | `7d` | Token expiration |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your frontend URL |
| `PORT` | `10000` | Render default |

**Important:** Generate a strong JWT_SECRET:
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use: https://www.uuidgenerator.net/
```

### 4. Configure Health Check

- **Health Check Path:** `/api/health`
- Leave other settings as default

### 5. Deploy!

- Click **"Create Web Service"**
- Wait 2-3 minutes for initial deployment
- Check logs for any errors

## After Deployment

### Test Your API

1. **Get your Render URL:** 
   - Example: `https://yoga-pose-backend.onrender.com`

2. **Test health endpoint:**
```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Yoga API Server is running",
  "timestamp": "2025-12-14T10:30:00.000Z",
  "environment": "production",
  "database": "Connected"
}
```

3. **Test registration:**
```bash
curl -X POST https://your-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'
```

### Update Frontend

Update your frontend environment variables with the Render URL:

**In frontend-web/.env:**
```
REACT_APP_API_URL=https://your-app.onrender.com
```

**Or in Vercel dashboard:**
- Add environment variable: `REACT_APP_API_URL`
- Value: `https://your-app.onrender.com`
- Redeploy frontend

## Keep Service Warm (Optional)

Render free tier sleeps after 15 min of inactivity. Keep it warm:

### Option 1: UptimeRobot (Recommended)

1. Sign up at https://uptimerobot.com (free)
2. Add Monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://your-app.onrender.com/api/health`
   - Monitoring Interval: 5 minutes
3. Save - your service will stay warm!

### Option 2: GitHub Actions Cron

Create `.github/workflows/keep-warm.yml`:
```yaml
name: Keep Backend Warm
on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl https://your-app.onrender.com/api/health
```

## Troubleshooting

### ❌ Service Won't Start

**Check logs in Render Dashboard:**
1. Go to your service
2. Click "Logs" tab
3. Look for errors

**Common issues:**
- Missing environment variables
- MongoDB connection failed
- Port binding error

### ❌ Database Connection Failed

1. **MongoDB Atlas Network Access:**
   - Go to MongoDB Atlas dashboard
   - Network Access → Add IP Address
   - Enter `0.0.0.0/0`
   - Click "Confirm"

2. **Test connection locally:**
```bash
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connect('YOUR_MONGODB_URI')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err));
"
```

### ❌ CORS Errors

1. Verify `FRONTEND_URL` environment variable
2. Make sure it includes `https://` protocol
3. Check Render logs for CORS errors
4. Update `server.js` if needed to add more origins

### ❌ Application Failed to Respond

- Check if start command is correct: `npm start`
- Verify `PORT` environment variable exists
- Check if all dependencies are in `package.json` (not devDependencies)

## Monitoring

### Check Service Status
- Dashboard → Your Service → "Overview"
- Green = Running
- Red = Error (check logs)

### View Logs
- Real-time logs in Dashboard
- Or via Render CLI

### Metrics
- CPU usage
- Memory usage  
- Response times
- Request count

## Upgrade Options

### When to Upgrade from Free Tier?

**Upgrade if you need:**
- No cold starts (instant responses)
- More CPU/memory
- Multiple instances
- Priority support

**Pricing:**
- Free: $0/month (with cold starts)
- Starter: $7/month (always on)
- Standard: $25/month (more resources)
- Pro: $85/month (high performance)

### To Upgrade:
1. Dashboard → Your Service
2. "Settings" → "Plan"
3. Select new plan
4. Confirm

## Next Steps

- [ ] API is deployed and responding
- [ ] Frontend is updated with backend URL
- [ ] Tested authentication endpoints
- [ ] Set up monitoring (UptimeRobot)
- [ ] Backend stays warm
- [ ] Consider upgrading plan if needed

## 🎉 You're Done!

Your backend is now live on Render!

**Backend URL:** https://your-app.onrender.com
**Health Check:** https://your-app.onrender.com/api/health
**API Docs:** See backend/README.md

---

**Need help?** Check:
- [Render Documentation](https://render.com/docs)
- [Backend README](./README.md)
- [Full Deploy Guide](./RENDER_DEPLOY.md)
