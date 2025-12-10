#!/usr/bin/env bash
set -euo pipefail

# This script patches all tflite_flutter-* plugin directories in the local pub cache
# by inserting a `namespace "..."` line into their android/build.gradle if missing.

PUB_CACHE_DIRS=(
  "${PUB_CACHE:-$HOME/.pub-cache/hosted/pub.dartlang.org}"
  "${PUB_CACHE:-$HOME/.pub-cache/hosted/pub.dev}"
)
PLUGIN_PATTERN="tflite_flutter-*"
NS_FALLBACK="org.tensorflow.lite"

patched=0
notfound=1
for d in "${PUB_CACHE_DIRS[@]}"; do
  if [ -d "$d" ]; then
    for candidate in $(ls -d "$d"/$PLUGIN_PATTERN 2>/dev/null || true); do
      if [ -z "$candidate" ]; then
        continue
      fi
      notfound=0
      echo "Checking plugin dir: $candidate"

      # Try to detect package from manifest
      MANIFEST_CANDIDATES=(
        "$candidate/android/src/main/AndroidManifest.xml"
        "$candidate/android/AndroidManifest.xml"
      )
      MANIFEST=""
      for c in "${MANIFEST_CANDIDATES[@]}"; do
        if [ -f "$c" ]; then
          MANIFEST="$c"
          break
        fi
      done

      if [ -n "$MANIFEST" ]; then
        NS=$(grep -oP 'package="\\K[^"]+' "$MANIFEST" | head -n1 || true)
        if [ -z "$NS" ]; then
          NS="$NS_FALLBACK"
          echo "Could not detect package in $MANIFEST; using fallback $NS"
        else
          echo "Detected package in manifest: $NS"
        fi
      else
        NS="$NS_FALLBACK"
        echo "No manifest found; using fallback namespace $NS"
      fi

      BUILD_GRAD="$candidate/android/build.gradle"
      if [ ! -f "$BUILD_GRAD" ]; then
        echo "build.gradle not found at $BUILD_GRAD; skipping"
        continue
      fi

      if grep -q "namespace" "$BUILD_GRAD"; then
        echo "Namespace already present in $BUILD_GRAD"
        continue
      fi

      cp "$BUILD_GRAD" "$BUILD_GRAD.bak"
      awk -v ns="$NS" '\n        BEGIN{added=0}\n        {print}\n        /android[[:space:]]*\\{/ && added==0 {\n          print "    namespace \\\"" ns "\\\""\n          added=1\n        }\n      ' "$BUILD_GRAD" > "${BUILD_GRAD}.new" && mv "${BUILD_GRAD}.new" "$BUILD_GRAD"
      echo "Inserted namespace into $BUILD_GRAD (backup at $BUILD_GRAD.bak)"
      patched=$((patched+1))
    done
  fi
done

if [ $notfound -eq 1 ]; then
  echo "Could not find any tflite_flutter plugin directories in pub cache locations: ${PUB_CACHE_DIRS[*]}"
  echo "Run 'flutter pub get' inside your project first to populate the pub cache, then re-run this script."
  exit 1
fi

echo "Patched $patched plugin(s)."

echo "Done. Now run:"
echo "  flutter clean"
echo "  flutter run"
