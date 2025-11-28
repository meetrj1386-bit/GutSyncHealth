// app.config.js - GutSync Expo Configuration
export default {
  expo: {
    name: "GutSync",
    slug: "gutsync",
    version: "1.0.0",
    orientation: "portrait",
    
    // App Icon
    icon: "./assets/icon.png",
    
    // Splash screen
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#4A7C59"
    },
    
    userInterfaceStyle: "light",
    
    // iOS Configuration
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.blissbiteslife.gutsync",
      buildNumber: "1",
      infoPlist: {
        NSCameraUsageDescription: "GutSync needs camera access to photograph your meals for logging and tracking.",
        NSPhotoLibraryUsageDescription: "GutSync needs photo library access to select meal photos for logging.",
        NSPhotoLibraryAddUsageDescription: "GutSync needs permission to save meal photos to your library.",
        CFBundleAllowMixedLocalizations: true,
      },
      config: {
        usesNonExemptEncryption: false
      }
    },
    
    // Android Configuration
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4A7C59"
      },
      package: "com.blissbiteslife.gutsync",
      versionCode: 1,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    
    // Web (minimal - no favicon needed)
    web: {
      bundler: "metro"
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
    
    scheme: "gutsync",
    
    extra: {
      eas: {
        projectId: "5394c1aa-b518-47e0-baaf-9de29f505f12"
      }
    },

    owner: "rahuljain1386",
    
    updates: {
      fallbackToCacheTimeout: 0
    },
    
    assetBundlePatterns: [
      "assets/*"
    ],
    
    locales: {
      en: "./locales/en.json",
      hi: "./locales/hi.json"
    }
  }
};