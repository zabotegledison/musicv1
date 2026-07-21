# Brazilian Syncopation Lab

Interactive rhythm-study generator for Brazilian rhythmic grammar (see project spec for full pedagogical background).

## Structure

```
brazilian-syncopation-lab/
├── index.html              # App shell (loads CSS/JS, no upload UI)
├── assets/
│   ├── fragments/          # MusicXML rhythm cells (A1–A6, B1–B10) — 1 quarter note each
│   └── audio/               # Backing tracks (mp3, 100 BPM, 16 bars)
├── src/
│   ├── css/style.css        # All styling
│   └── js/
│       ├── manifest.js      # Lists which files in assets/ to load
│       ├── patterns.js      # Traditional Brazilian pattern library (fragment-ID sequences)
│       └── app.js           # App logic (generation, notation, playback, saved studies)
└── README.md
```

Fragments and backing tracks are **not uploaded by the user** — they're fixed project files loaded automatically at startup via `manifest.js`.

## Running locally

Fragments/audio are loaded with `fetch()`, which browsers block on `file://`. You need a static server:

```bash
cd brazilian-syncopation-lab
python3 -m http.server 8000
# open http://localhost:8000
```

(or `npx serve`, or VS Code's "Live Server" extension — any static file server works.)

## Adding new material

- **New fragment**: drop the `.xml` in `assets/fragments/`, add the filename to `FRAGMENT_FILES` in `src/js/manifest.js`.
- **New backing track**: pitch stays clean at any tempo because each track ships as several pre-rendered versions (one file per BPM) instead of being stretched live in the browser. To add one:
  1. Export your loop at its natural tempo (e.g. `meu-groove.wav`).
  2. Render tempo variants offline with `ffmpeg` (needs the `rubberband` filter, good for percussion):
     ```bash
     ffmpeg -i meu-groove.wav -filter:a "rubberband=tempo=0.8:transients=crisp:detector=percussive" -codec:a libmp3lame -b:a 128k assets/audio/meugroove_80.mp3
     ```
     (`tempo` = target BPM ÷ original BPM — e.g. for 80 BPM from a 100 BPM original, `tempo=0.8`.) Repeat for each BPM you want covered (e.g. 60,70,80,...,140), naming files `<id>_<bpm>.mp3`.
  3. Add an entry to `AUDIO_TRACKS` in `src/js/manifest.js` listing the id, name, and the `tempos` array of BPMs you rendered.
- **New traditional pattern**: add an entry to the array in `src/js/patterns.js`.

No other code changes needed for any of the three.

## Replicating in your own Git repo

1. Create a new empty repo on GitHub/GitLab (no README/license, so there's no conflict).
2. On your machine, in the folder containing this `brazilian-syncopation-lab/` directory:
   ```bash
   cd brazilian-syncopation-lab
   git init
   git add .
   git commit -m "Initial commit: Brazilian Syncopation Lab"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. To deploy for free static hosting (optional): GitHub Pages → repo Settings → Pages → deploy from `main` branch, root folder. GitHub Pages serves static files over HTTPS, so `fetch()` of `assets/` works with no extra config.

## Notes

- Saved studies (favorites) still use browser `localStorage`, independent of the fragment/audio library.
- Fragment A/B quality tags can still be edited in the UI; overrides persist in `localStorage` per browser.
