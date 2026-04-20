# Bin Night

A tiny web app that puts your bin collection schedule on your calendar. Configure your day and bin rotation once, download an `.ics` file, and your calendar (Google, Apple, Outlook) handles the reminders — on your phone, your laptop, anywhere.

See [PROGRESS.md](./PROGRESS.md) for the current status and roadmap.

## Run it

No build step, no dependencies.

```bash
cd bin-night
python3 -m http.server 8000   # or: npx serve .
```

Then open http://localhost:8000 in a browser (mobile or desktop).

## Run the tests

Requires Node.js 18+. Uses Node's built-in test runner — no npm install.

```bash
cd bin-night
node --test test/*.test.mjs
```

Tests also run in CI on every push — see `.github/workflows/bin-night-ci.yml`.

## Project layout

```
bin-night/
├── index.html           Entry point
├── src/
│   ├── app.mjs          UI controller (vanilla DOM)
│   ├── schedule.mjs     Pure logic: which bins go out on which dates
│   ├── ics.mjs          Calendar (.ics) file generator
│   ├── storage.mjs      localStorage wrapper
│   └── styles.css       Responsive styles, light + dark mode
└── test/
    ├── schedule.test.mjs
    └── ics.test.mjs
```

## How the calendar integration works

1. You configure your collection day, bins (with weekly / fortnightly cadence), and reference dates for fortnightly bins.
2. The app computes the next 52 bin nights.
3. Clicking "Download calendar (.ics)" generates a file with one event per bin night, anchored at your chosen reminder time (e.g. 6pm) the evening before collection.
4. Each event includes a `VALARM` block so your calendar app fires its native notification.
5. You open the file on iOS/Android/desktop and your calendar offers to import it. Events sync across all your devices via your calendar account.

No server, no account, no tracking. Configuration lives in `localStorage`.

## Deploy

Static site — any host works. GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3, a USB stick. The entire app is plain HTML, CSS, and ES modules with zero build pipeline.
