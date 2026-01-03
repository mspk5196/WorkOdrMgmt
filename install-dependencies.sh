#!/bin/bash

# Work Order Management System - Frontend Dependency Installer
# Run this script from the WorkOdrMgmt directory

echo "📦 Installing Work Order Management System Dependencies..."
echo ""
echo "This will install all required React Native packages for:"
echo "  ✓ Navigation (Stack & Bottom Tabs)"
echo "  ✓ Storage & Authentication"
echo "  ✓ UI Components"
echo "  ✓ Icons & File Handling"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the WorkOdrMgmt directory:"
    echo "  cd WorkOdrMgmt"
    echo "  bash ../install-dependencies.sh"
    exit 1
fi

echo "Current directory: $(pwd)"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install \
  @react-navigation/native \
  @react-navigation/native-stack \
  @react-navigation/bottom-tabs \
  react-native-screens \
  react-native-safe-area-context \
  react-native-gesture-handler \
  @react-native-async-storage/async-storage \
  react-native-vector-icons \
  react-native-paper \
  @react-native-google-signin/google-signin \
  react-native-fs \
  react-native-file-viewer

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Update Backend/server.js (change app to newApp on line 2)"
    echo "  2. Configure WorkOdrMgmt/src/config/env.js with your backend URL"
    echo "  3. Setup database: mysql < Backend/database/schema.sql"
    echo "  4. Start backend: cd Backend && npm start"
    echo "  5. Start metro: npm start"
    echo "  6. Run Android: npm run android (in new terminal)"
    echo ""
    echo "📱 For Android, also add to android/app/build.gradle:"
    echo "   apply from: \"../../node_modules/react-native-vector-icons/fonts.gradle\""
    echo ""
    echo "🍎 For iOS, run: cd ios && pod install && cd .."
    echo ""
    echo "📚 See QUICK_START_GUIDE.md for complete setup instructions"
    echo ""
    echo "🎉 Ready to build your Work Order Management System!"
else
    echo ""
    echo "❌ Installation failed!"
    echo "Try running manually:"
    echo "  npm install @react-navigation/native @react-navigation/native-stack ..."
    exit 1
fi
