import 'dart:convert';
import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:image/image.dart' as imglib;

import '../models/pose.dart';

class RemoteInferenceService {
  // Try multiple possible IPs - the service will test which one works
  static const List<String> possibleServerUrls = [
    'http://10.81.114.89:8000',    // Current WiFi IP
    'http://192.168.42.129:8000',  // USB tethering (common)
    'http://172.16.142.231:8000',  // Ethernet
    'http://10.42.0.1:8000',       // WiFi hotspot
    'http://192.168.1.100:8000',   // Common WiFi router IP
  ];
  
  String? _workingServerUrl;
  bool _isServerAvailable = false;

  Future<void> checkServer() async {
    // Try all possible server URLs to find one that works
    for (final serverUrl in possibleServerUrls) {
      try {
        final response = await http.get(
          Uri.parse('$serverUrl/'),
        ).timeout(const Duration(seconds: 2));
        
        if (response.statusCode == 200) {
          _workingServerUrl = serverUrl;
          _isServerAvailable = true;
          debugPrint('✓ Server found at: $serverUrl');
          return;
        }
      } catch (e) {
        // Try next URL
      }
    }
    
    _isServerAvailable = false;
    _workingServerUrl = null;
    debugPrint('✗ Server not available on any known IP');
  }

  Future<PersonPose> runOnFrame(CameraImage cameraImage) async {
    if (!_isServerAvailable || _workingServerUrl == null) {
      await checkServer();
      if (!_isServerAvailable || _workingServerUrl == null) {
        return PersonPose(keypoints: [], score: 0.0);
      }
    }

    try {
      // Convert CameraImage to JPEG bytes
      final jpegBytes = await _convertCameraImageToJpeg(cameraImage);
      
      // Encode as base64
      final base64Image = base64Encode(jpegBytes);
      
      // Send to server
      final response = await http.post(
        Uri.parse('$_workingServerUrl/detect_base64'),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: {'image_data': base64Image},
      ).timeout(const Duration(milliseconds: 2000)); // Increased timeout for network

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data.containsKey('error')) {
          debugPrint('Server error: ${data['error']}');
          return PersonPose(keypoints: [], score: 0.0);
        }

        // Parse keypoints
        final keypointsList = data['keypoints'] as List;
        final keypoints = keypointsList.map((kp) {
          return KeyPoint(
            name: kp['name'],
            x: kp['x'].toDouble(),
            y: kp['y'].toDouble(),
            score: kp['score'].toDouble(),
          );
        }).toList();

        return PersonPose(
          keypoints: keypoints,
          score: data['avg_score'].toDouble(),
        );
      }
    } catch (e) {
      debugPrint('Remote inference error: $e');
      _isServerAvailable = false;
    }

    return PersonPose(keypoints: [], score: 0.0);
  }

  Future<Uint8List> _convertCameraImageToJpeg(CameraImage image) async {
    // Convert to image package format
    imglib.Image img;
    
    if (image.format.group == ImageFormatGroup.yuv420) {
      // Simple Y-channel only for speed - create grayscale image
      final pixelCount = image.width * image.height;
      img = imglib.Image(image.width, image.height);
      final yPlane = image.planes[0].bytes;
      
      for (int i = 0; i < pixelCount && i < yPlane.length; i++) {
        final y = yPlane[i];
        img.setPixelRgba(i % image.width, i ~/ image.width, y, y, y, 255);
      }
    } else if (image.format.group == ImageFormatGroup.bgra8888) {
      img = imglib.Image.fromBytes(
        image.width,
        image.height,
        image.planes[0].bytes,
        format: imglib.Format.bgra,
      );
    } else {
      throw Exception('Unsupported image format');
    }

    // Resize to reduce network payload
    final resized = imglib.copyResize(img, width: 480);
    
    // Encode as JPEG
    return Uint8List.fromList(imglib.encodeJpg(resized, quality: 85));
  }

  void close() {
    // Cleanup if needed
  }
}
