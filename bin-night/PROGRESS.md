# Bin Night — Progress

Status tracker for the Bin Night Android app. Updated as features land.

## How to monitor

- **Green check on the branch** means `:core` unit tests pass (see `.github/workflows/bin-night-ci.yml`)
- **Locally**: `cd bin-night && ./gradlew :core:test`
- **This file**: rolling list of what's done, in-flight, and planned

## Build status

| What | Status |
|------|--------|
| `:core` schedule logic tests | ✅ passing (9 tests) |
| `:app` Android build | ⚠️ not exercised in CI yet (needs Android SDK runner) |
| Instrumented/UI tests | ❌ not written |

## Done

- [x] Gradle multi-module project (`:core` pure-JVM, `:app` Android)
- [x] `BinConfig` / `BinRule` / `BinType` / `Cadence` data model with kotlinx.serialization
- [x] DataStore-backed config persistence (`BinConfigStore`)
- [x] Schedule logic: weekly + fortnightly-with-reference-date rotation
- [x] Onboarding Compose screen: pick day, reminder time, bins, cadence
- [x] Home Compose screen: next bin night + bin colours
- [x] WorkManager daily reminder worker + scheduler
- [x] Notification channel on app start
- [x] JUnit 5 unit tests for schedule logic (`BinScheduleTest`)
- [x] GitHub Actions CI running core tests on every push

## In flight

_Nothing right now — waiting on next direction._

## Planned (roughly in priority order)

### Correctness
- [ ] Add AGP caching / Android SDK runner to CI so `:app:assembleDebug` is also exercised
- [ ] Instrumented test for the reminder worker (verifies notification posts on the right day)
- [ ] Screenshot tests for Onboarding + Home via Paparazzi or Roborazzi

### Features the user notices
- [ ] Public holiday shift logic (Christmas/Easter rollover — start with a hand-curated 2026 date table per state)
- [ ] Home-screen widget showing today/tomorrow's bins
- [ ] Notification action "Mark put out" that suppresses further reminders for the cycle
- [ ] Quick preview: "next 4 bin nights" list on the home screen

### Nice-to-haves
- [ ] App icon + themed icon support
- [ ] Dark mode polish (currently uses default MaterialTheme)
- [ ] Multiple addresses (e.g. rental + investment)
- [ ] Backup/restore to Google Drive or a shareable config URL
- [ ] Optional council lookup once we pick a data source

## Known risks / open questions

- **No Android SDK in dev environment**: `:app` is not compiled locally — there may be small fixes needed on first real build. CI with an Android runner will catch these.
- **AGP repository blocked**: in this dev environment `dl.google.com` is blocked, so only `:core` can be built here. GitHub Actions can reach Google Maven fine.
- **Council auto-detection**: deliberately punted. Aussie councils don't expose a unified feed. Manual config scales to every council in the country without us maintaining scrapers.

## Changelog

- 2026-04-20 — Initial scaffold + extracted `:core` module + 9 unit tests + CI.
