#!/bin/bash
# build.sh - Production build script for OCR Software Frontend

# Print commands for debugging
set -x

# Exit on error
set -e

echo "Starting frontend build process..."
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Print environment variables (excluding secrets)
echo "REACT_APP_API_URL: $REACT_APP_API_URL"
echo "REACT_APP_ENV: $REACT_APP_ENV"
echo "NODE_ENV: $NODE_ENV"

# Clean any previous build artifacts
if [ -d "build" ]; then
  echo "Removing previous build directory..."
  rm -rf build
fi

# List source files to verify content
echo "Source files structure:"
find src -type f | sort

# Install dependencies
echo "Installing dependencies..."
npm ci || npm install

# Check package.json for homepage setting
echo "Checking package.json configuration:"
grep -E '"homepage"|"name"|"version"' package.json || echo "No homepage setting found"

# Add homepage setting if missing
if ! grep -q '"homepage"' package.json; then
  echo "Adding homepage setting to package.json..."
  sed -i 's/"private": true,/"private": true,\n  "homepage": ".",/g' package.json
fi

# Increase Node memory limit and disable CI mode to show all errors
export NODE_OPTIONS="--max-old-space-size=4096"
export CI=false
export GENERATE_SOURCEMAP=false

# Create production build with explicit environment variables
echo "Creating production build..."
REACT_APP_API_URL=${REACT_APP_API_URL:-"https://ocr-software-62gw.onrender.com"} \
REACT_APP_ENV=${REACT_APP_ENV:-"production"} \
REACT_APP_DEBUG=true \
npm run build

# Ensure the build directory exists
if [ ! -d "build" ]; then
  echo "Error: Build failed - build directory not created"
  exit 1
fi

# Check build contents
echo "Build directory structure:"
find build -type f | sort

# Verify index.html exists and has content
echo "Checking index.html content:"
cat build/index.html | grep -E 'root|script' || echo "Critical content missing from index.html"

# Check for main JS bundle
echo "JavaScript bundles:"
ls -la build/static/js/

# Check JS bundle content
echo "Checking JS bundle size:"
for file in build/static/js/*.js; do
  echo "$file: $(du -h $file | cut -f1)"
  if [ $(stat -c%s "$file") -eq 0 ]; then
    echo "ERROR: Empty JavaScript bundle detected!"
    echo "Build is failing silently. Check for syntax errors in your React code."
  fi
done

# Check build size
echo "Build size: $(du -sh build | cut -f1)"

# Create a _redirects file if it doesn't exist
if [ ! -f "build/_redirects" ]; then
  echo "Creating _redirects file for client-side routing..."
  echo "/* /index.html 200" > build/_redirects
fi

echo "Build completed successfully!"
