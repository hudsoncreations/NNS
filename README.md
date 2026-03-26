# NNS ABCs — Nashville Number System Learning App

A Duolingo-style web app for learning diatonic chords and the Nashville Number System. Built with SvelteKit and Tone.js, no backend required.

**Live:** https://hudsoncreations.github.io/NNS/

## What It Does

Teaches users to associate chord names with their Nashville Number System roman numerals (I–vii°) across all 12 major keys through interactive exercises with audio playback.

### Learning Flow

1. **Pathway** — Linear progression: C → G → D → F → A → E → Bb → Eb → Ab → Db → Gb → B
2. **Key Module** — 4 exercises per key (complete all to unlock the next key)
3. **Free Explore** — All keys accessible anytime; progress counts toward the pathway

### Exercise Types

| Exercise | Input | What's Shown | Goal |
|----------|-------|-------------|------|
| Chord Spelling | Drag & drop | All 7 slots + chord names | Match chords to scale degrees |
| Identify the Number | Text input | Roman numeral (e.g. "IV") | Type the chord name (e.g. "F maj") |
| Identify the Chord | Number pad (I–vii°) | Chord name (e.g. "G# min") | Tap the correct roman numeral |
| Audio ID | Multiple choice or text | Reference + mystery chord audio | Identify the mystery chord's number |

### Features

- Circle of fifths home screen with progress tracking
- Optional countdown timer (15s / 30s / 1min / 2min)
- Catppuccin Mocha (dark) / Latte (light) theming
- Keyboard navigation (arrow keys, number shortcuts)
- Volume and playback speed controls
- All audio generated in-browser via Tone.js (no audio files)
- All data stored in localStorage (no account required)

## Tech Stack

- **SvelteKit** — framework (Svelte 5 with runes)
- **Tone.js** — browser audio synthesis
- **Catppuccin** — color palette (Mocha dark / Latte light)
- **adapter-static** — deployed as static SPA to GitHub Pages
- **Vitest** — unit testing

## Project Structure

```
src/
├── lib/
│   ├── audio/index.ts          # Tone.js wrapper (playChord, playProgression, volume/speed)
│   ├── components/
│   │   ├── AudioPlayer.svelte  # Play/replay button for audio exercises
│   │   ├── DragDrop.svelte     # Drag-and-drop for chord spelling
│   │   ├── ExerciseRunner.svelte  # Main exercise orchestrator (question gen, scoring, timer)
│   │   ├── FeedbackDisplay.svelte # Correct/incorrect feedback after each answer
│   │   ├── Header.svelte       # Site header with logo, back button, settings link
│   │   ├── Logo.svelte         # Theme-aware logo (dark/light PNG swap)
│   │   ├── MultipleChoice.svelte  # Option buttons for beginner audio ID
│   │   ├── NumberPad.svelte    # 7-button roman numeral pad (I–vii°)
│   │   ├── SessionSummary.svelte  # End-of-exercise score and retry/back
│   │   └── TextInput.svelte    # Free-text input with Enter to submit
│   ├── exercises/config.ts     # Exercise type definitions and metadata
│   ├── stores/index.svelte.ts  # Svelte 5 reactive stores (preferences, progress, session)
│   ├── theme/
│   │   ├── ThemeProvider.svelte  # Applies data-theme attribute to <html>
│   │   ├── catppuccin.css      # Catppuccin Mocha + Latte color tokens
│   │   └── global.css          # Reset, typography, shared button styles
│   └── theory/
│       ├── index.ts            # Music theory engine (scales, chords, roman numerals)
│       └── theory.test.ts      # Unit tests for theory engine
├── routes/
│   ├── +layout.svelte          # Root layout (header/exercise detection)
│   ├── +layout.ts              # SPA mode config (ssr=false)
│   ├── +page.svelte            # Home — circle of fifths pathway
│   ├── explore/+page.svelte    # Redirects to home with explore tab
│   ├── key/[key]/+page.svelte  # Key module — 4 exercise tiles
│   └── key/[key]/[exercise]/+page.svelte  # Exercise page wrapper
└── static/
    ├── NNSFD Logo Dark.png     # Logo for light backgrounds
    ├── NNSFD Logo Light.png    # Logo for dark backgrounds
    └── .nojekyll               # Prevents GitHub Pages Jekyll processing
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type-check
npm run check

# Run tests
npm test

# Production build
npm run build

# Preview production build
npm run preview
```

## Deployment

Automatically deployed to GitHub Pages on every push to `main` via GitHub Actions (`.github/workflows/deploy.yml`).

The SvelteKit config uses `adapter-static` with a `fallback: '404.html'` for SPA routing. The base path is set to `/NNS` in production.

## Key Design Decisions

1. **No backend** — localStorage-only persistence keeps deployment simple. Data structures are designed to migrate to a backend later without rewrites.

2. **Svelte 5 runes** — Uses `$state`, `$derived`, `$effect`, `$props` throughout. Store files use `.svelte.ts` extension for rune support outside components.

3. **SPA mode** — `ssr = false` with static adapter. Dynamic routes (`/key/[key]/[exercise]`) can't be prerendered, so we use a 404.html fallback that lets the client router handle all paths.

4. **Exercise logic centralized** — All question generation, answer validation, and scoring lives in `ExerciseRunner.svelte` rather than being split across exercise-specific components. This keeps the exercise flow (question → feedback → next → summary) in one place.

5. **Stateless theory engine** — Pure functions that compute everything from a key name. No caching needed since diatonic chord computation is trivial.

6. **Viewport-locked exercises** — Exercise screens use `height: 100dvh` with `overflow: hidden` to prevent scrolling on mobile. All exercise UIs must fit within the viewport.

## Original Design Spec

The full design specification is at `docs/superpowers/specs/2026-03-26-nashville-number-system-abcs-design.md`.
