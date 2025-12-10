import 'dart:typed_data';
import 'package:camera/camera.dart';
import 'package:image/image.dart' as imglib;

class ImageUtils {
  /// Converts a [CameraImage] in YUV420 format to [imglib.Image] in RGB format
  static imglib.Image? convertCameraImage(CameraImage image) {
    if (image.format.group == ImageFormatGroup.yuv420) {
      return convertYUV420ToImage(
        image.planes[0].bytes,
        image.planes[1].bytes,
        image.planes[2].bytes,
        image.width,
        image.height,
        image.planes[1].bytesPerRow,
        image.planes[1].bytesPerPixel!,
      );
    } else if (image.format.group == ImageFormatGroup.bgra8888) {
      return convertBGRA8888ToImage(
        image.planes[0].bytes,
        image.width,
        image.height,
      );
    }
    return null;
  }

  static imglib.Image convertBGRA8888ToImage(
      Uint8List bytes, int width, int height) {
    return imglib.Image.fromBytes(
      width,
      height,
      bytes,
      format: imglib.Format.bgra,
    );
  }

  static imglib.Image convertYUV420ToImage(
      Uint8List plane0,
      Uint8List plane1,
      Uint8List plane2,
      int width,
      int height,
      int uvRowStride,
      int uvPixelStride) {
    
    // Much faster: just use Y plane and convert to grayscale
    // This is acceptable for pose detection as color isn't needed
    final img = imglib.Image(width, height);
    
    for (int i = 0; i < plane0.length; i++) {
      final y = plane0[i];
      img.data[i] = (0xFF << 24) | (y << 16) | (y << 8) | y;
    }
    
    return img;
  }
}
