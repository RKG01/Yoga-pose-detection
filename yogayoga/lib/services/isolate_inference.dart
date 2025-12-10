import 'dart:isolate';
import 'dart:typed_data';

import 'package:camera/camera.dart';
import 'package:image/image.dart' as imglib;
import 'package:tflite_flutter/tflite_flutter.dart';

import '../models/pose.dart';
import '../utils/image_utils.dart';

class IsolateInference {
  static const String _debugName = "InferenceIsolate";
  final ReceivePort _receivePort = ReceivePort();
  SendPort? _sendPort;
  SendPort? _isolateSendPort;

  Future<void> start() async {
    _sendPort = _receivePort.sendPort;
    await Isolate.spawn(
      _entryPoint,
      _sendPort!,
      debugName: _debugName,
    );
    _isolateSendPort = await _receivePort.first;
  }

  Future<PersonPose> processCameraImage(CameraImage image) async {
    if (_isolateSendPort == null) {
      return PersonPose(keypoints: [], score: 0.0);
    }

    final responsePort = ReceivePort();
    
    // Extract data to send (CameraImage is not sendable)
    final message = InferenceMessage(
      responsePort: responsePort.sendPort,
      width: image.width,
      height: image.height,
      formatGroup: image.format.group,
      planes: image.planes.map((p) => PlaneData(
        bytes: p.bytes,
        bytesPerRow: p.bytesPerRow,
        bytesPerPixel: p.bytesPerPixel,
      )).toList(),
    );

    _isolateSendPort!.send(message);
    return await responsePort.first;
  }

  static void _entryPoint(SendPort sendPort) async {
    final port = ReceivePort();
    sendPort.send(port.sendPort);

    Interpreter? interpreter;
    
    try {
      // Load model inside isolate
      // Note: tflite_flutter might need to be initialized or loaded carefully in isolate
      // But usually Interpreter.fromAsset works if assets are available.
      // However, rootBundle might not be available in Isolate.
      // We might need to pass the model bytes or path.
      // For now, let's try loading it. If it fails, we might need to pass model address.
      interpreter = await Interpreter.fromAsset('models/movenet_thunder.tflite');
    } catch (e) {
      print("Error loading model in isolate: $e");
    }

    await for (final message in port) {
      if (message is InferenceMessage) {
        PersonPose result = PersonPose(keypoints: [], score: 0.0);
        
        try {
          if (interpreter != null) {
            result = _runInference(message, interpreter);
          }
        } catch (e) {
          print("Error in isolate inference: $e");
        }
        
        message.responsePort.send(result);
      }
    }
  }

  static PersonPose _runInference(InferenceMessage message, Interpreter interpreter) {
    imglib.Image? image;

    if (message.formatGroup == ImageFormatGroup.yuv420) {
      image = ImageUtils.convertYUV420ToImage(
        message.planes[0].bytes,
        message.planes[1].bytes,
        message.planes[2].bytes,
        message.width,
        message.height,
        message.planes[1].bytesPerRow,
        message.planes[1].bytesPerPixel!,
      );
    } else if (message.formatGroup == ImageFormatGroup.bgra8888) {
      image = ImageUtils.convertBGRA8888ToImage(
        message.planes[0].bytes,
        message.width,
        message.height,
      );
    }

    if (image == null) return PersonPose(keypoints: [], score: 0.0);

    // Resize
    const int inputSize = 256;
    imglib.Image resizedImage = imglib.copyResize(image, width: inputSize, height: inputSize);

    // Prepare Input
    var input = _imageToByteListUint8(resizedImage, inputSize);

    // Prepare Output
    var output = List.filled(1 * 1 * 17 * 3, 0.0).reshape([1, 1, 17, 3]);

    // Run
    interpreter.run(input, output);

    // Parse
    return _parseOutput(output);
  }

  static Uint8List _imageToByteListUint8(imglib.Image image, int inputSize) {
    var convertedBytes = Uint8List(1 * inputSize * inputSize * 3);
    var buffer = Uint8List.view(convertedBytes.buffer);
    int pixelIndex = 0;
    for (var i = 0; i < inputSize; i++) {
      for (var j = 0; j < inputSize; j++) {
        var pixel = image.getPixel(j, i);
        buffer[pixelIndex++] = imglib.getRed(pixel);
        buffer[pixelIndex++] = imglib.getGreen(pixel);
        buffer[pixelIndex++] = imglib.getBlue(pixel);
      }
    }
    return convertedBytes;
  }

  static PersonPose _parseOutput(List<dynamic> output) {
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

    return PersonPose(keypoints: keypoints, score: totalScore / keypoints.length);
  }
}

class InferenceMessage {
  final SendPort responsePort;
  final int width;
  final int height;
  final ImageFormatGroup formatGroup;
  final List<PlaneData> planes;

  InferenceMessage({
    required this.responsePort,
    required this.width,
    required this.height,
    required this.formatGroup,
    required this.planes,
  });
}

class PlaneData {
  final Uint8List bytes;
  final int bytesPerRow;
  final int? bytesPerPixel;

  PlaneData({
    required this.bytes,
    required this.bytesPerRow,
    this.bytesPerPixel,
  });
}
