#!/bin/bash
# build.sh - Production build script for OCR Software Frontend

# Print commands for debugging
set -x

# Exit on error
set -e

echo "Starting frontend build process..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Clean any previous build artifacts
if [ -d "build" ]; then
  echo "Removing previous build directory..."
  rm -rf build
fi

# Install dependencies
echo "Installing dependencies..."
npm ci || npm install

# Create production build
echo "Creating production build..."
npm run build

# Ensure the build directory exists
if [ ! -d "build" ]; then
  echo "Error: Build failed - build directory not created"
  exit 1
fi

# Check build size
echo "Build size: $(du -sh build | cut -f1)"

echo "Build completed successfully!"
