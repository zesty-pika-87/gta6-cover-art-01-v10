# Neon Coast — Vice City Cover Maker

[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/zesty-pika-87/gta6-cover-art-01-v10/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/zesty-pika-87/gta6-cover-art-01-v10/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns your photos and a caption into GTA-style
multi-panel cover art, and exports it as a PNG to share. Built for make.fun's
[Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty ($250 in USDC).

## What it does

- **Any photo:** upload up to three photos into slots A, B and C, or tap a
  sample — the pier, the boulevard, or the built-in Neon Alley street scene,
  drawn by the app itself so its sign stays sharp at any size.
- **Six layouts:** solo hero, duo split, trio strip, quad grid, nine-panel
  mosaic, and story stack. Click any panel in the live preview to tune it:
  zoom and shift that panel's photo until the faces sit right.
- **Six colour grades:** Vice sunset, neon night, palm gold, teal dusk,
  bubblegum, and noir chrome.
- **Lettering that reads:** a bold title plus tagline in three styles —
  block outline, neon glow, or sunset gradient — over a dark scrim band, so
  the words stay legible on any photo. A clean star pill scores the cover
  live as you fill panels and write the caption.
- **Fast export:** one click each for Square 1080 × 1080, Portrait
  1080 × 1350, and Wide 1920 × 1080 PNGs. The preview and the PNG are drawn
  by the same renderer, so what you see is what the file holds.

## Try it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Everything runs from
static files under `app/` — no build step, no network request, and photos
never leave the machine.

## Files

- `app/index.html` — the editor page
- `app/style.css` — the dark workbench styling
- `app/src/main.js` — wiring: photos, controls, panel tuning, export
- `app/src/cover.js` — the cover renderer: panels, grades, lettering, star pill
- `app/src/backdrop.js` — the procedural Neon Alley street scene
- `app/src/shots.js` — fixed scenes for screenshots
- `main.ts` — hands the app and its screenshots in as the entry
- `screenshots/` — the cover and the editor, taken from the app itself

All art here is original and made on this machine: no Rockstar logo, artwork
or font. The two sample photos under `app/samples/` were made for make.fun
with an image model and are free to use.

## License

MIT — see [LICENSE](LICENSE).
