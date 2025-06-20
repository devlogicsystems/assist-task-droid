
# Android Permissions Setup

## Required permissions in android/app/src/main/AndroidManifest.xml

Add these permissions inside the `<manifest>` tag but outside the `<application>` tag:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-feature android:name="android.hardware.microphone" android:required="false" />
```

## App Icon Configuration

The app uses a custom logo located at `/lovable-uploads/5f55ff69-a65d-45fa-b743-8be28fec7025.png` as the application icon.

## Android-Specific Features

- **Voice Input**: On Android devices, microphone icons are automatically hidden as the app expects users to use the native voice-to-text functionality through their keyboard.
- **Native Speech-to-Text**: Users should enable "Google Voice Typing" or similar voice input methods in their Android keyboard settings.

## Steps to build APK with proper permissions:

1. First, ensure you have the latest changes:
   ```bash
   git pull
   npm install
   ```

2. Build the web app:
   ```bash
   npm run build
   ```

3. Sync with Capacitor (this updates native files):
   ```bash
   npx cap sync android
   ```

4. Open Android Studio:
   ```bash
   npx cap open android
   ```

5. In Android Studio, manually add the permissions to AndroidManifest.xml if they're not already there.

6. Configure the app icon:
   - Copy the logo file to `android/app/src/main/res/mipmap-*` directories
   - Update the app icon references in the manifest

7. Build the APK in Android Studio:
   - Go to Build → Generate Signed Bundle/APK
   - Choose APK
   - Create or use existing keystore
   - Build the APK

The APK will now properly request microphone permissions when installed and use the custom ICTasks logo as the app icon.
