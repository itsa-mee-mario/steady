# Steady (demo)

A scripted demo of a helper with two parts:
- **Your screen**: follows rules the user can read (for example, "On Sundays, show Call Anna"). It changes only when the user says so.
- **Right now**: takes the shape of each request (list, reminder, note, weather, calculator).

## Run
Open `index.html` in a browser (it loads `style.css` and `app.js` from the same folder). No build step. No server. Nothing leaves the browser unless you turn on the family-phone link (then only family button requests are shared).
The font loads from Google Fonts. The page works with a fallback font if offline.

## Notes
- The demo is scripted. It has no real AI.
- State lives in memory only. A reload resets it.
- The 18-step tour is the `STEPS` array in `index.html`.
- `replay-tour.js` replays every tour step headless with Node (`node replay-tour.js`). It reads `app.js`.

## Version 2
Voice-first, English/Hindi, A-/A+ and high contrast, read-aloud, AM/PM medicine reminder, family-phone buttons (needs the published Claude link), confirm before forgetting.
