# Yoga Pose Detection Server

This is a FastAPI server that runs pose detection inference on your laptop/server, allowing the Flutter app to offload heavy computation.

## Setup

### 1. Install Python dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. Start the server

```bash
python main.py
```

The server will start on `http://0.0.0.0:8000`

### 3. Find your laptop's IP address

**On Linux/Mac:**
```bash
ip addr
# or
ifconfig
```

**On Windows:**
```bash
ipconfig
```

Look for your local network IP (usually starts with `192.168.x.x` or `10.0.x.x`)

### 4. Configure the Flutter app

Edit `yogayoga/lib/services/remote_inference_service.dart` and change:

```dart
static const String serverUrl = 'http://192.168.1.100:8000'; // Your laptop's IP
```

Replace `192.168.1.100` with your actual laptop IP address.

### 5. Connect your phone and laptop to same WiFi

Make sure both devices are on the same network.

### 6. Run the Flutter app

```bash
cd ../yogayoga
flutter pub get
flutter run
```

### 7. Enable Server Mode in the app

On the pose selection screen, toggle the "Server Mode" switch to ON.

## How it works

1. **Flutter app** captures camera frames
2. **Frames are sent** to the server via HTTP (as JPEG + base64)
3. **Server runs** MoveNet inference using TensorFlow
4. **Results** (keypoints) are sent back to the app
5. **App displays** the skeleton overlay

## Benefits

- ⚡ **Much faster**: Your laptop's CPU/GPU is more powerful than phone
- 🎯 **More accurate**: Full-precision inference, no mobile optimizations
- 🔋 **Battery friendly**: Phone only handles camera and display
- 🌐 **Flexible**: Can scale to multiple users or cloud deployment

## Troubleshooting

**Connection refused:**
- Check firewall settings on your laptop
- Ensure both devices are on same WiFi
- Verify the IP address is correct

**Slow performance:**
- Check WiFi signal strength
- Server should show logs for each request
- Try reducing image quality in `remote_inference_service.dart`

**Model not found:**
- Ensure `movenet_thunder.tflite` exists in `classification model/` directory
- Check the path in `main.py` is correct
