# Yoga Pose Detection - Web Version

This is the **web-only** version of the Yoga Pose Detection app, without Capacitor dependencies.

## Key Differences from `frontend/`

- ✅ **No Capacitor**: Removed all `@capacitor/*` packages
- ✅ **Web-optimized**: Clean React app for browser deployment only
- ✅ **No refresh errors**: Eliminates Capacitor-related HMR issues
- ✅ **Lightweight**: Smaller dependency footprint

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at http://localhost:3000

## Build for Production

```bash
npm run build
```

The optimized build will be in the `build/` directory.

## Features

- Real-time yoga pose detection using TensorFlow.js
- Server-based and local detection modes
- Live webcam feed with skeleton overlay
- Pose accuracy meter
- Timer and performance tracking
- Support for 7 yoga poses: Tree, Chair, Cobra, Warrior, Dog, Shoulderstand, Triangle

## Tech Stack

- React 17
- TensorFlow.js
- MoveNet pose detection model
- React Webcam
- React Router

## Notes

- This version is for **web deployment only**
- For mobile app (Android/iOS), use the `frontend/` directory with Capacitor
- Make sure your browser supports WebRTC for webcam access
- Use HTTPS or localhost for camera permissions
