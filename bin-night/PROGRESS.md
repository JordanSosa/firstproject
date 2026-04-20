# Bin Night — Progress

Status tracker for Bin Night. Updated as features land.

## How to monitor

- **Green check on the branch** means unit tests pass (see `.github/workflows/bin-night-ci.yml`)
- **Locally**: `cd bin-night && node --test test/*.test.mjs`
- **This file**: rolling list of what's done, in-flight, and planned

## Build status

| What | Status |
|------|--------|
| Schedule logic tests | ✅ passing (10 tests) |
| ICS generator tests | ✅ passing (7 tests) |
| Manual browser testing | ⚠️ not yet done on a real device |
| Deployed site | ❌ not deployed |

## Done

- [x] Static web app (HTML + vanilla JS ES modules + CSS). No build step, no deps.
- [x] Responsive UI: works on mobile and desktop, light + dark mode
- [x] Onboarding: pick collection day, reminder time, bins, cadence, and reference dates for fortnightly bins
- [x] Home screen: next bin night + preview of next 6 collections
- [x] Config persisted in `localStorage`
- [x] Schedule logic: weekly + fortnightly-with-reference-date rotation
- [x] ICS calendar file generator (52 weeks of events, one per collection day, 15-minute events at the chosen reminder time the evening before)
- [x] VALARM display alert inside each ICS event
- [x] 17 Node `node:test` unit tests covering schedule and ICS generation
- [x] GitHub Actions CI running tests on every push

## In flight

_Nothing right now — waiting on next direction._

## Planned (roughly in priority order)

### Correctness / polish
- [ ] Real-device sanity test (iOS Safari, Android Chrome): import an `.ics` and confirm reminders fire
- [ ] Public holiday shift logic (Christmas/Easter rollover, state-by-state)
- [ ] PWA manifest + service worker so the site installs to home screen and works offline
- [ ] Accessibility pass (keyboard nav on chips, ARIA labels, focus management)

### Features the user notices
- [ ] "Add to Google Calendar" / "Add to Apple Calendar" one-click links
- [ ] Multiple addresses (e.g. home + investment property)
- [ ] Share config via URL so partners/housemates can import the same schedule
- [ ] Custom bin types and colours (some councils have more than 4)
- [ ] Holiday-season rollover UI: "Collection on Dec 25 will shift to Dec 26"

### Nice-to-haves
- [ ] App icon + themed icon
- [ ] Deploy to GitHub Pages (or similar) and link from the README
- [ ] Web Push fallback for users who want native notifications instead of calendar
- [ ] Council auto-detect once we pick a data source

## Known risks / open questions

- **Timezones in ICS**: events use "floating time" (no TZID), which calendar apps interpret in the user's local timezone. Works for 99% of cases but fails if someone configures on a laptop in one timezone and imports on a phone in another. Acceptable for MVP.
- **ES modules require a server**: `file://` won't load modules. Users need `python3 -m http.server`, `npx serve`, or a real host. Documented in the README.
- **No automated browser test**: the schedule + ICS logic is tested, but the DOM code isn't. An e2e test (Playwright) is in the planned list but not worth it at current scope.

## Changelog

- 2026-04-20 — Pivoted from Android/Kotlin to a static web app with ICS calendar export. 17 unit tests, CI runs on every push.
- 2026-04-20 — (superseded) Initial Android scaffold with Compose UI + WorkManager reminders.
