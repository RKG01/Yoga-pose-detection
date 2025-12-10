import 'dart:typed_data';

import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:tflite_flutter/tflite_flutter.dart';

import '../models/pose.dart';

class TFLiteService {
  Interpreter? _interpreter;
  bool _isModelLoaded = false;

  Future<void> loadModel() async {
    try {
      debugPrint('Loading MoveNet model...');
      _interpreter = await Interpreter.fromAsset('models/movenet_thunder.tflite');
      _isModelLoaded = true;
      debugPrint('Model loaded successfully');
    } catch (e) {
      debugPrint('Error loading model: $e');
      rethrow;
    }
  }

  Future<PersonPose> runOnFrame(CameraImage cameraImage) async {
    if (!_isModelLoaded || _interpreter == null) {
      return PersonPose(keypoints: [], score: 0.0);
    }

    try {
      // Directly convert camera bytes to model input without intermediate conversion
      const int inputSize = 256;
      Uint8List input;
      
      if (cameraImage.format.group == ImageFormatGroup.yuv420) {
        // Fast path: directly downsample and convert YUV to RGB for model
        input = _convertYUV420DirectToInput(
          cameraImage.planes[0].bytes,
          cameraImage.width,
          cameraImage.height,
          inputSize,
        );
      } else if (cameraImage.format.group == ImageFormatGroup.bgra8888) {
        input = _convertBGRA8888DirectToInput(
          cameraImage.planes[0].bytes,
          cameraImage.width,
          cameraImage.height,
          inputSize,
        );
      } else {
        return PersonPose(keypoints: [], score: 0.0);
      }

      // Prepare output buffer
      var output = List.filled(1 * 1 * 17 * 3, 0.0).reshape([1, 1, 17, 3]);

      // Run inference
      _interpreter!.run(input, output);

      // Parse output
      return _parseOutput(output);
    } catch (e) {
      debugPrint('Error during inference: $e');
      return PersonPose(keypoints: [], score: 0.0);
    }
  }

  Uint8List _convertYUV420DirectToInput(
    Uint8List yPlane,
    int width,
    int height,
    int targetSize,
  ) {
    // Fast downsampling: just use Y channel (grayscale is fine for pose)
    final buffer = Uint8List(targetSize * targetSize * 3);
    final scaleX = width / targetSize;
    final scaleY = height / targetSize;
    
    int bufferIndex = 0;
    for (int y = 0; y < targetSize; y++) {
      for (int x = 0; x < targetSize; x++) {
        final srcX = (x * scaleX).floor();
        final srcY = (y * scaleY).floor();
        final srcIndex = srcY * width + srcX;
        
        final yVal = srcIndex < yPlane.length ? yPlane[srcIndex] : 0;
        buffer[bufferIndex++] = yVal; // R
        buffer[bufferIndex++] = yVal; // G
        buffer[bufferIndex++] = yVal; // B
      }
    }
    return buffer;
  }

  Uint8List _convertBGRA8888DirectToInput(
    Uint8List pixels,
    int width,
    int height,
    int targetSize,
  ) {
    final buffer = Uint8List(targetSize * targetSize * 3);
    final scaleX = width / targetSize;
    final scaleY = height / targetSize;
    
    int bufferIndex = 0;
    for (int y = 0; y < targetSize; y++) {
      for (int x = 0; x < targetSize; x++) {
        final srcX = (x * scaleX).floor();
        final srcY = (y * scaleY).floor();
        final srcIndex = (srcY * width + srcX) * 4;
        
        if (srcIndex + 3 < pixels.length) {
          buffer[bufferIndex++] = pixels[srcIndex + 2]; // R
          buffer[bufferIndex++] = pixels[srcIndex + 1]; // G
          buffer[bufferIndex++] = pixels[srcIndex];     // B
        } else {
          bufferIndex += 3;
        }
      }
    }
    return buffer;
  }

  PersonPose _parseOutput(List<dynamic> output) {
    List<dynamic> keypointsRaw = output[0][0];
    List<KeyPoint> keypoints = [];
    double totalScore = 0.0;
    
    const List<String> keypointNames = [
      'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
      'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ];

    for (int i = 0; i < keypointsRaw.length; i++) {
      double y = keypointsRaw[i][0];
      double x = keypointsRaw[i][1];
      double score = keypointsRaw[i][2];
      
      keypoints.add(KeyPoint(
        name: keypointNames[i],
        x: x,
        y: y,
        score: score,
      ));
      totalScore += score;
    }

    // Only log occasionally to reduce noise
    return PersonPose(keypoints: keypoints, score: totalScore / keypoints.length);
  }

  void close() {
    _interpreter?.close();
    _interpreter = null;
    _isModelLoaded = false;
  }
}
