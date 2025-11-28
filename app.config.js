// app.config.js - Complete Expo configuration for App Store & Play Store
export default {
  expo: {
    name: "GutSync",
    slug: "gutsync",
    version: "1.0.0",
    orientation: "portrait",
    
    // App Icon - You need to create this (1024x1024 PNG, no transparency)
    icon: "./assets/icon.png",
    
    // Splash screen configuration
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#4A7C59"
    },
    
    // For iOS status bar
    userInterfaceStyle: "light",
    
    // iOS Specific Configuration
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.blissbiteslife.gutsync", // CHANGE THIS
      buildNumber: "1",
      
      // App Store metadata
      infoPlist: {
        NSCameraUsageDescription: "GutSync needs camera access to photograph your meals for logging and tracking.",
        NSPhotoLibraryUsageDescription: "GutSync needs photo library access to select meal photos for logging.",
        NSPhotoLibraryAddUsageDescription: "GutSync needs permission to save meal photos to your library.",
        CFBundleAllowMixedLocalizations: true,
      },
      
      // App Store category
      config: {
        usesNonExemptEncryption: false
      },
      
      // Associated domains for deep linking (optional)
      associatedDomains: [
        // "applinks:yourdomain.com"
      ]
    },
    
    // Android Specific Configuration
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4A7C59"
      },
      package: "com.blissbiteslife.gutsync", // CHANGE THIS
      versionCode: 1,
      
      // Permissions
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ],
      
      // Google Play Store category
      // Health & Fitness
    },
    
    // Web configuration (for Expo web builds)
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png"
    },
    
    // Plugins
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow GutSync to access your photos to log meals.",
          cameraPermission: "Allow GutSync to access your camera to photograph meals."
        }
      ]
    ],
    
    // Expo Router configuration
    scheme: "gutsync",
    
    // Extra configuration
   
    extra: {
  eas: {
    projectId: "5394c1aa-b518-47e0-baaf-9de29f505f12"
  }
},

    // Owner (your Expo username)
    owner: "rahuljain1386", // CHANGE THIS
    
    // Updates configuration
    updates: {
      fallbackToCacheTimeout: 0
    },
    
    // Assets to bundle
    assetBundlePatterns: [
      "**/*"
    ],
    
    // Localization
    locales: {
      en: "./locales/en.json",
      hi: "./locales/hi.json"
    }
  }
};
