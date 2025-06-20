
# Android Permissions Setup

## Required permissions in android/app/src/main/AndroidManifest.xml

Add these permissions inside the `<manifest>` tag but outside the `<application>` tag:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-feature android:name="android.hardware.microphone" android:required="false" />
```

## Voice Input Setup for Optimal Experience

For the best voice-to-text experience, users should have Google Voice Typing installed:

1. **Check if Google Voice Typing is installed**: Go to Settings → Language & Input → Virtual Keyboard
2. **Install Google Voice Typing**: If not present, download from Play Store:
   - Package: `com.google.android.googlequicksearchbox`
   - Name: "Google" or "Google Voice Typing"
3. **Enable Voice Input**: In keyboard settings, ensure voice input is enabled

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

5. In Android Studio, verify the permissions are in AndroidManifest.xml:
   ```xml
   <manifest xmlns:android="http://schemas.android.com/apk/res/android">
       <uses-permission android:name="android.permission.RECORD_AUDIO" />
       <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
       <uses-feature android:name="android.hardware.microphone" android:required="false" />
       
       <application>
           <!-- app content -->
       </application>
   </manifest>
   ```

6. Build the APK in Android Studio:
   - Go to Build → Generate Signed Bundle/APK
   - Choose APK
   - Create or use existing keystore
   - Build the APK

## Runtime Permission Handling

The app will automatically request microphone permissions when needed. For Android 6.0+ (API 23+):
- Permissions are requested at runtime when voice features are first used
- Users can grant/deny permissions through system dialogs
- The app gracefully handles permission denials with helpful guidance

The APK will now properly request microphone permissions and provide intelligent voice input options.
