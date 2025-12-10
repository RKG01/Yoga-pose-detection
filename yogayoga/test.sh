# Ensure namespace in build.gradle
BUILD_GRAD="packages/tflite_flutter/android/build.gradle"
if [ -f "$BUILD_GRAD" ]; then
  grep -q "namespace" "$BUILD_GRAD" || awk -v ns="org.tensorflow.lite" 'BEGIN{added=0}{print}/android[[:space:]]*\\{/ && added==0 {print "    namespace \"" ns "\""; added=1}' "$BUILD_GRAD" > "${BUILD_GRAD}.new" && mv "${BUILD_GRAD}.new" "$BUILD_GRAD"
fi

# If plugin uses build.gradle.kts instead:
BUILD_GRAD_KTS="packages/tflite_flutter/android/build.gradle.kts"
if [ -f "$BUILD_GRAD_KTS" ]; then
  # Add: namespace = "org.tensorflow.lite" after 'android {' line (kts syntax)
  grep -q "namespace" "$BUILD_GRAD_KTS" || awk -v ns="org.tensorflow.lite" 'BEGIN{added=0}{print}/android\\s*\\{/ && added==0 {print "    namespace = \"" ns "\""; added=1}' "$BUILD_GRAD_KTS" > "${BUILD_GRAD_KTS}.new" && mv "${BUILD_GRAD_KTS}.new" "$BUILD_GRAD_KTS"
fi