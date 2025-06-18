
# Android Permissions Setup

## Required permissions in android/app/src/main/AndroidManifest.xml

Add these permissions inside the `<manifest>` tag but outside the `<application>` tag:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-feature android:name="android.hardware.microphone" android:required="false" />
```

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

6. Build the APK in Android Studio:
   - Go to Build → Generate Signed Bundle/APK
   - Choose APK
   - Create or use existing keystore
   - Build the APK

The APK will now properly request microphone permissions when installed.
