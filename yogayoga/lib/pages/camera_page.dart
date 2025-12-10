import 'dart:async';
import 'dart:typed_data';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';

import '../models/pose.dart';
import '../services/camera_service.dart';
import '../services/tflite_service.dart';
import '../services/remote_inference_service.dart';
import '../widgets/keypoints_painter.dart';

class CameraPage extends StatefulWidget {
  const CameraPage({super.key});

  @override
  State<CameraPage> createState() => _CameraPageState();
}

class _CameraPageState extends State<CameraPage> {
  final CameraService _cameraService = CameraService();
  final TFLiteService _tfliteService = TFLiteService();
  final RemoteInferenceService _remoteService = RemoteInferenceService();

  CameraController? controller;
  List<CameraDescription> cameras = [];
  PersonPose? _lastPose;
  bool _processing = false;

  String? _errorMessage;

  int _currentCameraIndex = 0;
  
  // Pose detection state
  bool _isDetecting = false;
  String _selectedPose = 'Tree';
  Timer? _inferenceTimer;
  CameraImage? _latestImage;
  bool _useRemoteInference = false; // Toggle for server mode
  
  final List<String> _poseList = [
    'Tree',
    'Chair',
    'Cobra',
    'Warrior',
    'Dog',
    'Shoulderstand',
    'Triangle',
  ];

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() {
          _errorMessage = 'No cameras found. Please ensure your device has a camera.';
        });
        return;
      }

      // Default to front camera
      _currentCameraIndex = cameras.indexWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
      );
      if (_currentCameraIndex == -1) _currentCameraIndex = 0;

      await _cameraService.initCamera(cameras[_currentCameraIndex], ResolutionPreset.medium);
      controller = _cameraService.controller;
      await _tfliteService.loadModel();
      
      // Check if server is available
      await _remoteService.checkServer();
      
      setState(() {});
    } catch (e) {
      setState(() {
        _errorMessage = 'Error initializing: $e';
      });
      debugPrint('Error initializing camera or model: $e');
    }
  }

  Future<void> _toggleCamera() async {
    if (cameras.length < 2) return;

    _currentCameraIndex = (_currentCameraIndex + 1) % cameras.length;
    
    // Stop stream if running
    if (controller != null && controller!.value.isStreamingImages) {
      await controller!.stopImageStream();
    }
    
    await _cameraService.initCamera(cameras[_currentCameraIndex], ResolutionPreset.medium);
    controller = _cameraService.controller;
    setState(() {});
  }

  void _startStream() {
    if (controller == null) return;
    if (controller!.value.isStreamingImages) return;

    setState(() {
      _isDetecting = true;
    });

    debugPrint('Starting pose detection with timer-based inference...');
    
    // Start camera stream to get latest frames
    _cameraService.startImageStream((CameraImage image) {
      _latestImage = image; // Just store the latest frame
    });
    
    // Run inference on a timer (slower for remote to avoid timeouts)
    int frameCount = 0;
    _inferenceTimer = Timer.periodic(const Duration(milliseconds: 300), (timer) async {
      if (_latestImage == null || _processing) return;
      
      _processing = true;
      frameCount++;
      
      try {
        // Use remote or local inference based on toggle
        final PersonPose pose = _useRemoteInference
            ? await _remoteService.runOnFrame(_latestImage!)
            : await _tfliteService.runOnFrame(_latestImage!);
        
        if (frameCount % 10 == 0) {
          debugPrint('[${_useRemoteInference ? "REMOTE" : "LOCAL"}] Pose score: ${(pose.score * 100).toStringAsFixed(1)}%');
        }
        
        if (mounted) {
          setState(() {
            _lastPose = pose;
          });
        }
      } catch (e) {
        debugPrint("Inference error: $e");
      } finally {
        _processing = false;
      }
    });
  }

  void _stopStream() {
    _inferenceTimer?.cancel();
    _inferenceTimer = null;
    _latestImage = null;
    
    // Only stop if actually streaming
    if (controller != null && controller!.value.isStreamingImages) {
      _cameraService.stopImageStream();
    }
    
    setState(() {
      _isDetecting = false;
      _lastPose = null;
    });
  }
  
  void _toggleDetection() {
    if (_isDetecting) {
      _stopStream();
    } else {
      _startStream();
    }
  }

  @override
  void dispose() {
    _inferenceTimer?.cancel();
    _cameraService.dispose();
    _tfliteService.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_errorMessage != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(_errorMessage!, textAlign: TextAlign.center),
          ),
        ),
      );
    }

    if (controller == null || !controller!.value.isInitialized) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final keypoints = _lastPose?.keypoints ?? [];

    final size = MediaQuery.of(context).size;
    var scale = size.aspectRatio * controller!.value.aspectRatio;

    // to prevent scaling down, invert the scale if it's less than 1
    if (scale < 1) scale = 1 / scale;

    return Scaffold(
      appBar: AppBar(title: const Text('Yoga Pose Detection')),
      body: _isDetecting ? _buildDetectionView(scale) : _buildSetupView(),
    );
  }
  
  Widget _buildSetupView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Select Your Pose',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.blue),
                borderRadius: BorderRadius.circular(8),
              ),
              child: DropdownButton<String>(
                value: _selectedPose,
                isExpanded: true,
                underline: const SizedBox(),
                items: _poseList.map((String pose) {
                  return DropdownMenuItem<String>(
                    value: pose,
                    child: Text(
                      pose,
                      style: const TextStyle(fontSize: 18),
                    ),
                  );
                }).toList(),
                onChanged: (String? newValue) {
                  if (newValue != null) {
                    setState(() {
                      _selectedPose = newValue;
                    });
                  }
                },
              ),
            ),
            const SizedBox(height: 24),
            // Server mode toggle
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Server Mode',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Use laptop/server for faster detection',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                  Switch(
                    value: _useRemoteInference,
                    onChanged: (value) {
                      setState(() {
                        _useRemoteInference = value;
                      });
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 48),
            const Text(
              'Instructions:',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text(
              _getInstructions(_selectedPose),
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: _startStream,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                textStyle: const TextStyle(fontSize: 18),
              ),
              child: const Text('Start Pose'),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildDetectionView(double scale) {
    final keypoints = _lastPose?.keypoints ?? [];
    final avgScore = _lastPose?.score ?? 0.0;
    
    return Stack(
      fit: StackFit.expand,
      children: [
        Transform.scale(
          scale: scale,
          child: Center(
            child: CameraPreview(controller!),
          ),
        ),
        CustomPaint(
          painter: KeypointsPainter(
            keypoints,
            controller!.description.lensDirection,
            controller!.description.sensorOrientation,
          ),
        ),
        Positioned(
          top: 16,
          left: 16,
          right: 16,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Current Pose: $_selectedPose',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Detection: ${keypoints.isEmpty ? "Searching..." : "Active"}',
                  style: TextStyle(
                    color: keypoints.isEmpty ? Colors.orange : Colors.greenAccent,
                    fontSize: 14,
                  ),
                ),
                if (keypoints.isNotEmpty)
                  Text(
                    'Confidence: ${(avgScore * 100).toStringAsFixed(1)}%',
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
              ],
            ),
          ),
        ),
        Positioned(
          bottom: 24,
          left: 24,
          right: 24,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton(
                onPressed: _stopStream,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                  textStyle: const TextStyle(fontSize: 18),
                ),
                child: const Text('Stop Pose'),
              ),
              const SizedBox(width: 16),
              ElevatedButton(
                onPressed: _toggleCamera,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                ),
                child: const Text('Flip'),
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  String _getInstructions(String pose) {
    switch (pose) {
      case 'Tree':
        return 'Stand on one leg, place the other foot on your inner thigh, and bring your hands together above your head.';
      case 'Chair':
        return 'Stand with feet together, bend your knees and lower your hips as if sitting in a chair, raise arms overhead.';
      case 'Cobra':
        return 'Lie on your stomach, place hands under shoulders, and lift your chest off the ground while keeping hips down.';
      case 'Warrior':
        return 'Step one foot back, bend front knee, extend arms out to sides parallel to the ground.';
      case 'Dog':
        return 'Start on hands and knees, lift hips up and back, straightening legs to form an inverted V-shape.';
      case 'Shoulderstand':
        return 'Lie on your back, lift legs and hips up, support your back with your hands, keeping body vertical.';
      case 'Triangle':
        return 'Stand with feet wide apart, reach one arm down to ankle while extending the other arm up, forming a triangle.';
      default:
        return 'Follow the pose instructions carefully.';
    }
  }
}
