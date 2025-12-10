import 'package:flutter/material.dart';
import 'package:camera/camera.dart';

import '../models/pose.dart';

class KeypointsPainter extends CustomPainter {
  final List<KeyPoint> keypoints;
  final CameraLensDirection lensDirection;
  final int sensorOrientation;

  KeypointsPainter(this.keypoints, this.lensDirection, this.sensorOrientation);

  @override
  void paint(Canvas canvas, Size size) {
    if (keypoints.isEmpty) return;

    final paint = Paint()
      ..color = Colors.greenAccent
      ..style = PaintingStyle.fill
      ..strokeWidth = 3.0;

    final linePaint = Paint()
      ..color = Colors.green.withOpacity(0.7)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    // Draw connections between keypoints
    _drawConnections(canvas, size, linePaint);

    // Draw keypoints
    for (final k in keypoints) {
      if (k.score > 0.005) { // Only draw confident keypoints (lowered threshold)
        // Transform coordinates based on camera orientation
        double dx = k.x * size.width;
        double dy = k.y * size.height;
        
        // Mirror for front camera
        if (lensDirection == CameraLensDirection.front) {
          dx = size.width - dx;
        }
        
        // Draw outer circle for better visibility
        final outerPaint = Paint()
          ..color = Colors.white.withOpacity(0.5)
          ..style = PaintingStyle.fill;
        canvas.drawCircle(Offset(dx, dy), 6.0, outerPaint);
        
        // Draw inner circle
        canvas.drawCircle(Offset(dx, dy), 4.0, paint);
      }
    }
  }

  void _drawConnections(Canvas canvas, Size size, Paint paint) {
    // Define skeleton connections (COCO format)
    final connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle'],
      ['nose', 'left_eye'],
      ['nose', 'right_eye'],
      ['left_eye', 'left_ear'],
      ['right_eye', 'right_ear'],
    ];

    for (final connection in connections) {
      final start = keypoints.firstWhere(
        (k) => k.name == connection[0],
        orElse: () => KeyPoint(name: '', x: 0, y: 0, score: 0),
      );
      final end = keypoints.firstWhere(
        (k) => k.name == connection[1],
        orElse: () => KeyPoint(name: '', x: 0, y: 0, score: 0),
      );

      if (start.score > 0.005 && end.score > 0.005) {
        double startX = start.x * size.width;
        double startY = start.y * size.height;
        double endX = end.x * size.width;
        double endY = end.y * size.height;
        
        // Mirror for front camera
        if (lensDirection == CameraLensDirection.front) {
          startX = size.width - startX;
          endX = size.width - endX;
        }
        
        canvas.drawLine(
          Offset(startX, startY),
          Offset(endX, endY),
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant KeypointsPainter oldDelegate) {
    return oldDelegate.keypoints != keypoints;
  }
}

