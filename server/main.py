from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import cv2
from io import BytesIO
from PIL import Image
import base64

app = FastAPI()

# Allow CORS for Flutter app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load MoveNet model
interpreter = None
input_details = None
output_details = None

@app.on_event("startup")
async def load_model():
    global interpreter, input_details, output_details
    print("Loading MoveNet Thunder model...")
    interpreter = tf.lite.Interpreter(model_path="../classification model/movenet_thunder.tflite")
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print("Model loaded successfully!")

@app.get("/")
async def root():
    return {"message": "Yoga Pose Detection Server Running", "status": "ok"}

@app.post("/detect")
async def detect_pose(file: UploadFile = File(...)):
    """
    Endpoint to detect pose from uploaded image
    Returns keypoints with coordinates and confidence scores
    """
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"error": "Failed to decode image"}
        
        # Preprocess image for MoveNet
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, (256, 256))
        img_input = np.expand_dims(img_resized.astype(np.uint8), axis=0)
        
        # Run inference
        interpreter.set_tensor(input_details[0]['index'], img_input)
        interpreter.invoke()
        keypoints_with_scores = interpreter.get_tensor(output_details[0]['index'])
        
        # Extract keypoints (shape: [1, 1, 17, 3])
        keypoints = keypoints_with_scores[0][0]
        
        # Format response
        keypoint_names = [
            'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
            'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
        ]
        
        result = {
            "keypoints": [
                {
                    "name": keypoint_names[i],
                    "y": float(keypoints[i][0]),
                    "x": float(keypoints[i][1]),
                    "score": float(keypoints[i][2])
                }
                for i in range(17)
            ],
            "avg_score": float(np.mean(keypoints[:, 2]))
        }
        
        return result
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/detect_base64")
async def detect_pose_base64(image_data: str = Form(...)):
    """
    Endpoint to detect pose from base64 encoded image
    Faster for mobile apps as it avoids multipart form encoding
    """
    try:
        # Decode base64
        img_bytes = base64.b64decode(image_data)
        img = Image.open(BytesIO(img_bytes))
        img_array = np.array(img)
        
        # Convert to BGR if needed
        if len(img_array.shape) == 2:  # Grayscale
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
        elif img_array.shape[2] == 4:  # RGBA
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGBA2BGR)
        elif img_array.shape[2] == 3:  # RGB
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        else:
            img_bgr = img_array
        
        # Preprocess image for MoveNet
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, (256, 256))
        img_input = np.expand_dims(img_resized.astype(np.uint8), axis=0)
        
        # Run inference
        interpreter.set_tensor(input_details[0]['index'], img_input)
        interpreter.invoke()
        keypoints_with_scores = interpreter.get_tensor(output_details[0]['index'])
        
        # Extract keypoints
        keypoints = keypoints_with_scores[0][0]
        
        # Format response
        keypoint_names = [
            'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
            'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
            'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
            'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
        ]
        
        result = {
            "keypoints": [
                {
                    "name": keypoint_names[i],
                    "y": float(keypoints[i][0]),
                    "x": float(keypoints[i][1]),
                    "score": float(keypoints[i][2])
                }
                for i in range(17)
            ],
            "avg_score": float(np.mean(keypoints[:, 2]))
        }
        
        return result
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
