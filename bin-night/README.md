# Bin Night

Never miss bin night again. Configure your council's collection day and bin rotation (weekly/fortnightly), and get a notification the evening before.

See [PROGRESS.md](./PROGRESS.md) for the current status and roadmap.

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

- Kotlin + Jetpack Compose + Material 3 in `:app`
- Pure-JVM `:core` module with schedule logic + data model (easy to unit test)
- DataStore (preferences) for config
- kotlinx.serialization for config JSON
- WorkManager for daily reminder scheduling
- minSdk 26, targetSdk 34

## Build

From the `bin-night/` directory:

```bash
# Run unit tests (no Android SDK required)
./gradlew :core:test

# Build debug APK (requires Android SDK with platform 34)
./gradlew :app:assembleDebug

# Install on connected device/emulator
./gradlew :app:installDebug
```

Requires JDK 17+. Core tests also run in CI on every push — see `.github/workflows/bin-night-ci.yml`.

## Project layout

```
core/src/main/kotlin/au/binnight/core/
├── BinSchedule.kt            Pure-JVM schedule logic (nextCollectionOnOrAfter)
└── model/                    BinConfig, BinRule, BinType, Cadence

core/src/test/kotlin/au/binnight/core/
└── BinScheduleTest.kt        Unit tests for schedule logic

app/src/main/java/au/binnight/app/
├── BinNightApp.kt            Application: notification channel, schedules worker
├── MainActivity.kt           Compose host
├── data/                     DataStore persistence (BinConfigStore)
├── notifications/            WorkManager worker + scheduler
└── ui/                       Root, home screen, onboarding screen
```
