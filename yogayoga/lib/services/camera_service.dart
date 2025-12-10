import 'package:camera/camera.dart';

class CameraService {
  CameraController? controller;

  Future<void> initCamera(CameraDescription cameraDescription, ResolutionPreset preset) async {
    controller = CameraController(cameraDescription, preset, enableAudio: false);
    await controller!.initialize();
  }

  void startImageStream(void Function(CameraImage image) onLatestImageAvailable) {
    if (controller != null && controller!.value.isInitialized) {
      controller!.startImageStream(onLatestImageAvailable);
    }
  }

  void stopImageStream() {
    controller?.stopImageStream();
  }

  void dispose() {
    controller?.dispose();
  }
}
