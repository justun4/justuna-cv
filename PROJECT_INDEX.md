# Project Index: detective-desk-cv

Generated: 2026-03-28

## Overview

Interactive detective desk portfolio for Tunahan HUSEM. Users investigate a noir-themed desk with draggable folders, puzzles, a cipher, fingerprint scanner, newspaper, evidence board, and radio. Built with vanilla JS + GSAP + Vite.

**Live:** justuna.com | **Stack:** Vanilla JS, GSAP 3, Vite 6, Google Fonts

## Project Structure

```
d:\justuna\
├── index.html              # Single page entry (intro overlay + desk surface + modals)
├── vite.config.js          # Vite config (base: './', dist output)
├── package.json            # detective-desk-cv@1.0.0
│
├── js/
│   ├── main.js             # Entry point — init all modules, setup intro
│   ├── data/
│   │   └── cv-data.json    # All CV content (folders, pages, newspaper, evidence board)
│   └── modules/
│       ├── desk.js          # Desk surface, z-index manager (getNextZ)
│       ├── lamp.js          # Mouse-following lamp light effect
│       ├── sounds.js        # Sound effects manager (playSound/stopSound)
│       ├── i18n.js          # TR/EN internationalization, lang toggle, t()/tData()
│       ├── folders.js       # Create folder elements from cv-data
│       ├── draggable.js     # GSAP Draggable setup for folders → openDocument on click
│       ├── documents.js     # Document overlay (page flip modal for folder contents)
│       ├── decorations.js   # Desk props (pen, phone, clock, stapler, magnifier, etc.)
│       ├── puzzle.js        # Coffee mug + USB + desk compartment secret puzzle
│       ├── newspaper.js     # Foldable newspaper overlay (skills showcase)
│       ├── radio.js         # Interactive desk radio with volume + song
│       ├── fingerprint.js   # Fingerprint matching mini-game → GitHub link
│       ├── cipher.js        # Caesar cipher wheel → decode name puzzle
│       ├── evidence-board.js # Cork board with connected nodes (skills/experience map)
│       ├── user-notes.js    # Sticky notes users can add to desk
│       └── overlay-guard.js # Global guard preventing multiple overlays from stacking
│
├── css/
│   ├── main.css            # CSS variables, body, scrollbar, lang-toggle
│   ├── desk.css            # Desk surface, intro overlay, sound toggle
│   ├── folders.css         # Folder cards styling
│   ├── documents.css       # Document modal overlay
│   ├── decorations.css     # Desk props (pen, phone, clock, mug, usb, etc.)
│   ├── puzzle.css          # Compartment + terminal puzzle styles
│   ├── newspaper.css       # Newspaper overlay (masthead, columns, articles)
│   ├── radio.css           # Desk radio controls
│   ├── fingerprint.css     # Fingerprint scanner overlay
│   ├── cipher.css          # Cipher wheel overlay
│   ├── evidence-board.css  # Evidence board cork + nodes + strings
│   ├── user-notes.css      # Sticky notes
│   └── responsive.css      # Breakpoints: 768px, 480px, 375px + touch targets
│
├── assets/
│   ├── images/             # PNG sprites: coffee, kalem, mercek, newspaper, phone, radio, telsiz, usb, wanted, zimba, kilit
│   └── sounds/             # MP3: radio-song, sip-coffee-1, sip-coffee-2
│
├── public/assets/          # Static assets copied to dist
└── dist/                   # Vite build output
```

## Entry Points

- **HTML:** `index.html` — single page, all sections inline
- **JS:** `js/main.js` — imports all modules, calls init(), setupIntro()
- **CSS:** 13 CSS files loaded in index.html (no bundler for CSS)
- **Data:** `js/data/cv-data.json` — all CV content, folder pages, newspaper, evidence board

## Key Architecture

| Pattern | Detail |
|---------|--------|
| Module system | ES modules, each feature = 1 file with `init*()` export |
| Overlays | DOM-created at open, removed on close. Global guard via `overlay-guard.js` |
| Draggable | GSAP Draggable on folders + desk items. onClick opens overlays |
| i18n | `t(key)` for UI strings, `tData(tr, en)` for content. TR/EN toggle |
| Sound | `playSound(name)` / `stopSound(name)` — Web Audio API |
| Z-index | `getNextZ()` from desk.js — auto-incrementing stacking |
| Responsive | 3 breakpoints (768/480/375px) + touch target sizing |

## Overlays (Interactive Features)

| Overlay | Module | Trigger | Description |
|---------|--------|---------|-------------|
| Documents | documents.js | Click folder | Paginated CV content viewer |
| Newspaper | newspaper.js | Click newspaper | Skills showcase in newspaper layout |
| Fingerprint | fingerprint.js | Click magnifier | Match fingerprints → reveal GitHub |
| Cipher | cipher.js | Click cipher device | Rotate wheel to decode name |
| Evidence Board | evidence-board.js | Click cork trigger | Connected node graph of skills |
| Puzzle/Terminal | puzzle.js | Coffee mug → USB → compartment | Hidden terminal easter egg |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| gsap | ^3.12.7 | Animation + Draggable plugin |
| vite | ^6.2.0 | Dev server + build (devDep) |
| sharp | ^0.34.5 | Image processing (devDep) |

## Fonts

- **Special Elite** — typewriter font (`--font-typewriter`)
- **Caveat:400;700** — handwriting font (`--font-handwritten`)
- Source: Google Fonts (single link tag)

## CSS Variables (main.css)

- `--color-gold`, `--color-paper`, `--color-manila`, `--color-ink`
- `--font-typewriter` (Special Elite), `--font-handwritten` (Caveat)
- `--z-intro: 500`, z-index layers for overlays

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## Responsive Breakpoints

| Breakpoint | Target | Key Changes |
|------------|--------|-------------|
| 768px | Tablet | Smaller folders, overlays 95vw, lamp dimmed |
| 480px | Phone | Lamp off, items hidden (walkie, stapler, phone), smaller radio |
| 375px | iPhone SE | Minimum sizes, smallest touch targets |
| `pointer: coarse` | Touch devices | 44px min touch targets |
