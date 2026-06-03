# Building & Publishing to Google Play Store

## Prerequisites

- Node.js 18+
- Java 17+ (JDK)
- Android Studio (for SDK tools and emulator)
- A Google Play Developer account ($25 one-time fee)

---

## 1. Generate a Release Keystore (one-time only)

Run this in the project root. **Keep this file safe — losing it means you can never update your app.**

```bash
keytool -genkey -v \
  -keystore my-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias mini-games-key
```

You will be prompted for a store password, key alias, and key password. Remember these — you need them every time you build a release.

---

## 2. Create `keystore.properties`

Copy the example file and fill in your values:

```bash
cp keystore.properties.example keystore.properties
```

Edit `keystore.properties`:
```
storeFile=../my-release-key.jks
storePassword=<your store password>
keyAlias=mini-games-key
keyPassword=<your key password>
```

> `keystore.properties` and `*.jks` are in `.gitignore` — they will never be committed.

---

## 3. Build the Web App + Sync to Android

```bash
npm run cap:sync
```

This runs `vite build` then `npx cap sync android` to copy the latest web assets into the Android project.

---

## 4. Build a Signed Release AAB

```bash
cd android
./gradlew bundleRelease
```

On Windows:
```powershell
cd android
.\gradlew.bat bundleRelease
```

The output file will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 5. Test on a Device Before Publishing

```bash
# Build a signed APK for sideloading (easier for testing)
cd android
./gradlew assembleRelease
```

APK output: `android/app/build/outputs/apk/release/app-release.apk`

Transfer to your phone and install to verify everything works.

---

## 6. Upload to Google Play Console

1. Go to [play.google.com/console](https://play.google.com/console)
2. Create a new app → fill in name "Mini Games Arcade"
3. Go to **Release > Testing > Internal testing** → Create new release
4. Upload `app-release.aab`
5. Add release notes, save and roll out
6. Install via the internal test link on your device — final check
7. When ready: **Release > Production** → create release, submit for review

---

## Play Store Listing Checklist

- [ ] App icon: 512×512 PNG (no alpha) — replace icons in `android/app/src/main/res/mipmap-*/`
- [ ] Feature graphic: 1024×500 PNG
- [ ] At least 2 phone screenshots
- [ ] Short description (max 80 chars)
- [ ] Full description (max 4000 chars)
- [ ] Privacy policy URL (required — host a simple page or use a generator)
- [ ] Content rating questionnaire (answer questions in Play Console)
- [ ] App category: Games > Casual

---

## Version Bumping

Before each release, update `versionCode` and `versionName` in [android/app/build.gradle](android/app/build.gradle):

```gradle
versionCode 2          // increment by 1 each release
versionName "1.1"      // human-readable version
```
