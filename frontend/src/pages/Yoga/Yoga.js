import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import React, { useRef, useState, useEffect } from 'react'
import backend from '@tensorflow/tfjs-backend-webgl'
import Webcam from 'react-webcam'
import { count } from '../../utils/music'; 
import { detectPoseOnServer, checkServerHealth, imageDataToBase64 } from '../../services/serverPoseService';
 
import Instructions from '../../components/Instrctions/Instructions';

import './Yoga.css'
 
import DropDown from '../../components/DropDown/DropDown';
import { poseImages } from '../../utils/pose_images';
import { POINTS, keypointConnections } from '../../utils/data';
import { drawPoint, drawSegment } from '../../utils/helper'



let skeletonColor = 'rgb(255,255,255)'
let poseList = [
  'Tree', 'Chair', 'Cobra', 'Warrior', 'Dog',
  'Shoulderstand', 'Traingle'
]

let interval

// flag variable is used to help capture the time when AI just detect 
// the pose as correct(probability more than threshold)
let flag = false


function Yoga() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)


  const [startingTime, setStartingTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [poseTime, setPoseTime] = useState(0)
  const [bestPerform, setBestPerform] = useState(0)
  const [currentPose, setCurrentPose] = useState('Tree')
  const [isStartPose, setIsStartPose] = useState(false)
  const [detectionStatus, setDetectionStatus] = useState('Waiting...')
  const [useServer, setUseServer] = useState(true) // Server mode by default
  const [serverAvailable, setServerAvailable] = useState(false)

  
  useEffect(() => {
    const timeDiff = (currentTime - startingTime)/1000
    if(flag) {
      setPoseTime(timeDiff)
    }
    if((currentTime - startingTime)/1000 > bestPerform) {
      setBestPerform(timeDiff)
    }
  }, [currentTime])


  useEffect(() => {
    setCurrentTime(0)
    setPoseTime(0)
    setBestPerform(0)
  }, [currentPose])

  const CLASS_NO = {
    Chair: 0,
    Cobra: 1,
    Dog: 2,
    No_Pose: 3,
    Shoulderstand: 4,
    Traingle: 5,
    Tree: 6,
    Warrior: 7,
  }

  function get_center_point(landmarks, left_bodypart, right_bodypart) {
    let left = tf.gather(landmarks, left_bodypart, 1)
    let right = tf.gather(landmarks, right_bodypart, 1)
    const center = tf.add(tf.mul(left, 0.5), tf.mul(right, 0.5))
    return center
    
  }

  function get_pose_size(landmarks, torso_size_multiplier=2.5) {
    let hips_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    let shoulders_center = get_center_point(landmarks,POINTS.LEFT_SHOULDER, POINTS.RIGHT_SHOULDER)
    let torso_size = tf.norm(tf.sub(shoulders_center, hips_center))
    let pose_center_new = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    pose_center_new = tf.expandDims(pose_center_new, 1)

    pose_center_new = tf.broadcastTo(pose_center_new,
        [1, 17, 2]
      )
      // return: shape(17,2)
    let d = tf.gather(tf.sub(landmarks, pose_center_new), 0, 0)
    let max_dist = tf.max(tf.norm(d,'euclidean', 0))

    // normalize scale
    let pose_size = tf.maximum(tf.mul(torso_size, torso_size_multiplier), max_dist)
    return pose_size
  }

  function normalize_pose_landmarks(landmarks) {
    let pose_center = get_center_point(landmarks, POINTS.LEFT_HIP, POINTS.RIGHT_HIP)
    pose_center = tf.expandDims(pose_center, 1)
    pose_center = tf.broadcastTo(pose_center, 
        [1, 17, 2]
      )
    landmarks = tf.sub(landmarks, pose_center)

    let pose_size = get_pose_size(landmarks)
    landmarks = tf.div(landmarks, pose_size)
    return landmarks
  }

  function landmarks_to_embedding(landmarks) {
    // normalize landmarks 2D
    landmarks = normalize_pose_landmarks(tf.expandDims(landmarks, 0))
    let embedding = tf.reshape(landmarks, [1,34])
    return embedding
  }

  const runMovenet = async () => {
    try {
      console.log('Initializing TensorFlow.js...')
      await tf.ready()
      console.log('TensorFlow.js ready, backend:', tf.getBackend())
      
      // Use LIGHTNING model for better mobile performance
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true
      };
      console.log('Loading MoveNet detector (LIGHTNING for mobile)...')
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
      console.log('MoveNet loaded successfully')
      
      console.log('Loading pose classifier...')
      const poseClassifier = await tf.loadLayersModel('https://models.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json')
      console.log('Pose classifier loaded successfully')
      
      const countAudio = new Audio(count)
      countAudio.loop = true
      
      // Wait for webcam to be fully ready
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Starting pose detection...')
      
      interval = setInterval(() => { 
          detectPose(detector, poseClassifier, countAudio)
      }, 400)  // Increased to 400ms for smooth mobile performance (~2.5 FPS)
    } catch (error) {
      console.error('Error initializing pose detection:', error)
      alert('Error loading AI models. Please check your internet connection and try again.')
    }
  }

  const detectPose = async (detector, poseClassifier, countAudio) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      let notDetected = 0 
      const video = webcamRef.current.video
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight
      
      // Set canvas size to match video
      canvasRef.current.width = videoWidth
      canvasRef.current.height = videoHeight
      
      const pose = await detector.estimatePoses(video)
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Check if pose was detected
      if (!pose || pose.length === 0 || !pose[0] || !pose[0].keypoints) {
        console.log('No pose detected in frame')
        setDetectionStatus('No pose detected - move into frame')
        return
      }
      
      console.log('Pose detected! Keypoints:', pose[0].keypoints.length)
      setDetectionStatus(`✓ Pose detected! ${pose[0].keypoints.length} keypoints`)
      
      try {
        const keypoints = pose[0].keypoints 
        let input = keypoints.map((keypoint) => {
          if(keypoint.score > 0.2) {  // Lowered from 0.4 to 0.2 for better mobile detection
            if(!(keypoint.name === 'left_eye' || keypoint.name === 'right_eye')) {
              drawPoint(ctx, keypoint.x, keypoint.y, 8, 'rgb(255,255,255)')
              console.log('Drawing point:', keypoint.name, 'at', keypoint.x, keypoint.y)
              let connections = keypointConnections[keypoint.name]
              try {
                connections.forEach((connection) => {
                  let conName = connection.toUpperCase()
                  drawSegment(ctx, [keypoint.x, keypoint.y],
                      [keypoints[POINTS[conName]].x,
                       keypoints[POINTS[conName]].y]
                  , skeletonColor)
                })
              } catch(err) {
                console.error('Error drawing segment:', err)
              }
              
            }
          } else {
            notDetected += 1
          } 
          return [keypoint.x, keypoint.y]
        }) 
        if(notDetected > 4) {
          skeletonColor = 'rgb(255,255,255)'
          return
        }
        const processedInput = landmarks_to_embedding(input)
        const classification = poseClassifier.predict(processedInput)

        classification.array().then((data) => {         
          const classNo = CLASS_NO[currentPose]
          console.log(data[0][classNo])
          if(data[0][classNo] > 0.97) {
            
            if(!flag) {
              countAudio.play()
              setStartingTime(new Date(Date()).getTime())
              flag = true
            }
            setCurrentTime(new Date(Date()).getTime()) 
            skeletonColor = 'rgb(0,255,0)'
          } else {
            flag = false
            skeletonColor = 'rgb(255,255,255)'
            countAudio.pause()
            countAudio.currentTime = 0
          }
        })
      } catch(err) {
        console.log(err)
      }
      
      
    }
  }

  function startYoga(){
    setIsStartPose(true)
    if (useServer) {
      // Check server availability first
      checkServerHealth().then(available => {
        setServerAvailable(available);
        if (available) {
          console.log('Using server-based detection');
          runServerDetection();
        } else {
          alert('Server not available! Switching to local detection...');
          setUseServer(false);
          runMovenet();
        }
      });
    } else {
      runMovenet();
    }
  } 

  function stopPose() {
    setIsStartPose(false)
    clearInterval(interval)
  }

  const runServerDetection = async () => {
    const countAudio = new Audio(count);
    countAudio.loop = true;
    
    // Create a hidden canvas for capturing frames
    const captureCanvas = document.createElement('canvas');
    
    interval = setInterval(async () => {
      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        // Update canvas size
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
        
        // Convert frame to base64
        const base64Image = imageDataToBase64(captureCanvas, video);
        
        // Send to server
        const keypoints = await detectPoseOnServer(base64Image);
        
        if (!keypoints || keypoints.length === 0) {
          setDetectionStatus('No pose detected - move into frame');
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          return;
        }
        
        setDetectionStatus(`✓ Server detected! ${keypoints.length} keypoints`);
        
        // Draw keypoints on canvas
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Convert normalized coordinates to pixel coordinates
        keypoints.forEach((keypoint, i) => {
          if (keypoint.score > 0.2 && keypoint.name !== 'left_eye' && keypoint.name !== 'right_eye') {
            const x = keypoint.x * videoWidth;
            const y = keypoint.y * videoHeight;
            drawPoint(ctx, x, y, 8, 'rgb(255,255,255)');
          }
        });
        
        // Draw connections
        const connections = keypointConnections;
        keypoints.forEach((keypoint, i) => {
          if (keypoint.score > 0.2 && connections[keypoint.name]) {
            const x1 = keypoint.x * videoWidth;
            const y1 = keypoint.y * videoHeight;
            
            connections[keypoint.name].forEach(targetName => {
              const targetKeypoint = keypoints.find(kp => kp.name === targetName);
              if (targetKeypoint && targetKeypoint.score > 0.2) {
                const x2 = targetKeypoint.x * videoWidth;
                const y2 = targetKeypoint.y * videoHeight;
                drawSegment(ctx, [x1, y1], [x2, y2], skeletonColor);
              }
            });
          }
        });
      }
    }, 500); // 500ms for server round-trip
  };

    

  if(isStartPose) {
    return (
      <div className="yoga-container">
        <div className="performance-container">
            <div className="pose-performance">
              <h4>Pose Time: {poseTime} s</h4>
            </div>
            <div className="pose-performance">
              <h4>Best: {bestPerform} s</h4>
            </div>
          </div>
        <div style={{ textAlign: 'center', color: 'white', margin: '10px 0', fontSize: '16px', fontWeight: 'bold' }}>
          {detectionStatus}
        </div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          
          <Webcam 
          id="webcam"
          ref={webcamRef}
          style={{
            display: 'block',
            margin: '0 auto',
            width: '100%',
            maxWidth: '640px',
          }}
        />
          <canvas
            ref={canvasRef}
            id="my-canvas"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              zIndex: 1
            }}
          >
          </canvas>
        <div>
            <img 
              src={poseImages[currentPose]}
              className="pose-img"
              alt={currentPose + " pose"}
            />
          </div>
         
        </div>
        <button
          onClick={stopPose}
          className="secondary-btn"    
        >Stop Pose</button>
      </div>
    )
  }

  return (
    <div
      className="yoga-container"
    >
      <DropDown
        poseList={poseList}
        currentPose={currentPose}
        setCurrentPose={setCurrentPose}
      />
      <Instructions
          currentPose={currentPose}
        />
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <label style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={useServer} 
            onChange={(e) => setUseServer(e.target.checked)}
            style={{ marginRight: '10px', transform: 'scale(1.5)' }}
          />
          Use Server Detection (More Accurate)
        </label>
      </div>
      <button
          onClick={startYoga}
          className="secondary-btn"    
        >Start Pose</button>
    </div>
  )
}

export default Yoga