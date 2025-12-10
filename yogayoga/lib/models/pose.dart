class KeyPoint {
  final String name;
  final double x;
  final double y;
  final double score;

  KeyPoint({required this.name, required this.x, required this.y, required this.score});
}

class PersonPose {
  final List<KeyPoint> keypoints;
  final double score;

  PersonPose({required this.keypoints, required this.score});
}
