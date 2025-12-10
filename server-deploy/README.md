# Yoga Pose Detection Server

FastAPI server for real-time yoga pose detection using MoveNet Thunder model.

## Deployment Instructions

### Option 1: Render.com (Recommended - Free)

1. **Create account** at [render.com](https://render.com)
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub** and select this repository
4. **Configure:**
   - Name: `yoga-pose-api`
   - Root Directory: `server-deploy`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Click "Create Web Service"**
6. **Wait 5-10 minutes** for deployment
7. **Your URL:** `https://yoga-pose-api.onrender.com`

### Option 2: Railway.app (Free 500h/month)

1. **Create account** at [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub**
3. **Select repository → server-deploy folder**
4. **Add environment variables:**
   - `PORT=8000`
5. **Deploy automatically**
6. **Your URL:** `https://your-app.railway.app`

### Option 3: Hugging Face Spaces (Free)

1. **Create account** at [huggingface.co](https://huggingface.co)
2. **New Space → Choose Docker**
3. **Upload files** from server-deploy
4. **Create Dockerfile:**
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
```
5. **Your URL:** `https://huggingface.co/spaces/username/yoga-pose`

## After Deployment

1. **Get your server URL** (e.g., `https://yoga-pose-api.onrender.com`)
2. **Update React app:** Edit `frontend/src/services/serverPoseService.js`
   ```javascript
   const SERVER_URL = 'https://your-deployed-url.com';
   ```
3. **Rebuild app:** `npm run build && npx cap sync && cd android && ./gradlew assembleDebug`
4. **Install APK** on phone

## Testing

Test your deployed server:
```bash
curl https://your-url.com/
# Should return: {"message": "Yoga Pose Detection Server Running", "status": "ok"}
```

## Files Included

- `main.py` - FastAPI server code
- `movenet_thunder.tflite` - MoveNet Thunder model
- `requirements.txt` - Python dependencies
- `Procfile` - For Render/Heroku deployment
- `README.md` - This file
