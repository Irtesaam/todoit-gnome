#!/bin/bash
set -e  # Exit immediately if any command fails

# -----------------------------
# Configuration
# -----------------------------
EXTENSION_NAME="TodoZen"
UUID="todozen@irtesaam.github.io"
BUILD_DIR="build"
SRC_DIR="$(pwd)"

# -----------------------------
# Cleanup previous build
# -----------------------------
echo "######## Cleaning previous build ########"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# -----------------------------
# Build TypeScript
# -----------------------------
echo "######## Building TypeScript ########"
yarn build

# -----------------------------
# Compile schemas
# -----------------------------
echo "######## Compiling GSettings schemas ########"
make schemas

# -----------------------------
# Copy required files
# -----------------------------
echo "######## Copying files to build directory ########"
cp -r schemas "$BUILD_DIR"
cp *.js "$BUILD_DIR"
cp stylesheet.css "$BUILD_DIR"
cp metadata.json "$BUILD_DIR"
cp LICENCE "$BUILD_DIR"

# -----------------------------
# Zip the extension
# -----------------------------
echo "######## Creating ZIP ########"
cd "$BUILD_DIR"
zip -r "../$UUID.zip" . -x "*.git*" "*.DS_Store"  # Exclude unnecessary files

# -----------------------------
# Done
# -----------------------------
cd "$SRC_DIR"
echo "######## Build complete ########"
tree "$BUILD_DIR"
echo "ZIP file created: $UUID.zip"
