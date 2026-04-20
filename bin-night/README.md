# Bin Night

Never miss bin night again. Configure your council's collection day and bin rotation (weekly/fortnightly), and get a notification the evening before.

## Status

MVP scaffold. Core features:
- Onboarding to pick collection day, reminder time, and bin types
- Weekly or fortnightly rotation per bin (with a reference "next out" date)
- Home screen shows the next bin night and which bins to put out
- Daily WorkManager job sends a notification the evening before

Not yet implemented:
- Public holiday shift logic (e.g. Christmas rollover)
- Council auto-detect / multiple addresses
- Home-screen widget
- Backup / cloud sync

## Tech

- Kotlin + Jetpack Compose + Material 3
- DataStore (preferences) for config
- kotlinx.serialization for config JSON
- WorkManager for daily reminder scheduling
- minSdk 26, targetSdk 34

## Build

From the `bin-night/` directory:

```bash
# Generate Gradle wrapper if not present
gradle wrapper --gradle-version 8.9

# Build debug APK
./gradlew :app:assembleDebug

# Install on connected device/emulator
./gradlew :app:installDebug
```

Requires JDK 17+ and Android SDK with platform 34 installed.

## Project layout

```
app/src/main/java/au/binnight/app/
├── BinNightApp.kt            Application: notification channel, schedules worker
├── MainActivity.kt           Compose host
├── data/                     BinConfig, BinRule, BinType, DataStore
├── domain/                   Schedule calculation (nextCollectionOnOrAfter)
├── notifications/            WorkManager worker + scheduler
└── ui/                       Root, home screen, onboarding screen
```
