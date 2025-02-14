#!/bin/bash -eu

# This script generates 4 builds, as follows:
# - dist/esm: ESM build for Node.js
# - dist/esm-browser: ESM build for the Browser
# - dist/cjs: CommonJS build for Node.js
# - dist/cjs-browser: CommonJS build for the Browser
#
# Note: that the "preferred" build for testing (local and CI) is the ESM build,
# except where we specifically test the other builds

set -e # exit on error

# Change to project root
ROOT="$(pwd)"
cd "$ROOT" || exit 1

# Prep TS output dir
DIST_DIR="$ROOT/dist"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Build each module type
for MODULE_TYPE in esm cjs; do
  echo "Building ${MODULE_TYPE}"

  NODE_DIST_DIR="$DIST_DIR/${MODULE_TYPE}"

  tsc -p tsconfig.${MODULE_TYPE}.json

  if [ "$MODULE_TYPE" = "cjs" ]; then
    echo "{\"type\":\"commonjs\"}" > "$NODE_DIST_DIR/package.json"    
  fi
done