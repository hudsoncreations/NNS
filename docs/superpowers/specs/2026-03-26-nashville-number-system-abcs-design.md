# Nashville Number System ABCs — Design Spec

## Overview

A SvelteKit + Tone.js web app for learning diatonic chords and the Nashville Number System (Roman numerals I–VII for scale degrees). Duolingo-style exercise progression through all 12 major keys. No backend — all state client-side via localStorage. Catppuccin color palette for light/dark theming.

## Tech Stack

- **SvelteKit** — frontend framework (Vite-based)
- **Tone.js** — all audio generated in-browser, no audio files
- **localStorage** — client-side persistence
- **No backend** — data structures designed to migrate to a backend later without rewrite

## Learning Structure

### Core Pathway

Linear progression through 12 keys:
C → G → D → F → A → E → Bb → Eb → Ab → Db → Gb → B

Each key unlocks when all 4 exercise types in the previous key are completed.

### Free Explore

All 12 keys accessible at any time, outside the pathway. Progress is shared — completing exercises in Free Explore counts toward Core Pathway progress.

### Key Module

Within a key, 4 exercise types are shown as tiles in a pick-and-choose layout. Users can do them in any order. Each exercise type tracks independently. The key is "completed" when all 4 are done.

### Completion Criteria

Accuracy threshold: must achieve 80% (4 out of 5) correct in a single session to mark an exercise type as complete. Users can retry freely.

## Music Theory Engine

Location: `$lib/theory/`

Stateless, pure-function module that computes diatonic harmony for any major key.

### Core Data

- 12 chromatic notes with enharmonic preferences (Bb for flat keys, F# for sharp keys)
- Major scale formula: W-W-H-W-W-W-H
- Diatonic chord quality pattern: major, minor, minor, major, major, minor, diminished

### API

```ts
type Chord = {
  name: string;       // "C major", "D minor"
  root: string;       // "C", "D"
  quality: 'major' | 'minor' | 'diminished';
  degree: number;     // 1-7
  roman: string;      // "I", "ii", "iii", "IV", "V", "vi", "vii°"
  notes: string[];    // ["C4", "E4", "G4", "C5"] — voiced for playback
}
```

Functions:
- `getScaleNotes(key: string): string[]` — 7 notes of the major scale
- `getDiatonicChords(key: string): Chord[]` — all 7 chords with name, quality, roman numeral, notes
- `getChordByDegree(key: string, degree: number): Chord` — lookup by degree
- `getChordDegree(key: string, chordName: string): number` — reverse lookup
- `getRomanNumeral(degree: number, quality: string): string` — formatted Roman numeral

### Voicings

Root position, 4-note: root, third, fifth, octave (root doubled). Middle register rooted around C4–C5.

## Audio Engine

Location: `$lib/audio/`

Wraps Tone.js with a clean API.

### Synth Setup

- `PolySynth` with warm piano-like tone
- ADSR: Attack 10ms, Decay 200ms, Sustain 0.6, Release 500ms
- Single shared instance, initialized on first user interaction (browser AudioContext restriction)

### API

- `playChord(notes: string[], duration?: number): Promise<void>`
- `playProgression(chords: string[][], tempo?: number): Promise<void>`
- `playReferenceAndTarget(key: string, targetDegree: number): Promise<void>` — I chord → 0.5s pause → target chord
- `setVolume(level: number): void` — 0 to 1
- `setPlaybackSpeed(rate: number): void` — 0.75, 1, 1.25, 1.5
- `isPlaying(): boolean`

### Audio Controls

- Volume slider (0–100%), mute toggle
- Playback speed (0.75x, 1x, 1.25x, 1.5x)
- Visual feedback while audio plays (animated indicator)
- Replay button on every audio exercise

## Exercise Engine

Location: `$lib/exercises/`

Data-driven architecture. Each exercise type is a config object; a generic `ExerciseRunner` component renders any type.

### Exercise Config

```ts
type ExerciseConfig = {
  id: string;
  name: string;
  description: string;
  inputModes: {
    beginner: 'dragDrop' | 'multipleChoice' | 'dropdown';
    intermediate: 'text' | 'multipleChoice';
    advanced: 'text';
  };
  hasAudio: boolean;
  questionsPerSession: number;
  passThreshold: number;          // 0.8 = 80%
  generateQuestion: (key: string, difficulty: string) => Question;
  validateAnswer: (question: Question, answer: Answer) => boolean;
}
```

### Question / Answer Types

```ts
type Question = {
  prompt: string;
  key: string;
  targetDegree?: number;
  audioSequence?: string[][];
  correctAnswer: Answer;
  options?: string[];
}

type Answer = string | string[];
```

### MVP Exercise Types

**1. Chord Spelling**
- Prompt: "Drag each chord to its correct scale degree"
- Beginner: Drag & drop — 7 shuffled chord tiles into labeled I–vii° slots
- Intermediate+: Text input per slot
- Audio: Optional playback of each chord after placement
- Questions per session: 1 (all 7 chords in one go). Pass criteria: at least 6 of 7 slots correct (~86%). This is a single composite question — the session summary shows which slots were wrong.

**2. Identify the Number**
- Prompt: "What scale degree is [chord name]?"
- Beginner: Multiple choice grid (I, ii, iii, IV, V, vi, vii°)
- Intermediate+: Text input
- Audio: None
- Questions per session: 5

**3. Identify the Chord (Reverse)**
- Prompt: "What chord is the [Roman numeral]?"
- Beginner: Multiple choice grid (7 chord names)
- Intermediate+: Text input
- Audio: None
- Questions per session: 5

**4. Audio Chord Identification**
- Prompt: "You hear the I chord, then a mystery chord. What number is it?"
- Playback: I chord (1s) → pause (0.5s) → target chord (1s)
- Beginner: Multiple choice grid (I–vii°)
- Intermediate+: Text input
- Questions per session: 5

### Session Flow

Question → Answer → Feedback (1.5s auto-advance) → next Question → ... → Session Summary

Session Summary shows: score (e.g. "4/5"), pass/fail, incorrect answers with corrections, "Try Again" or "Back to Key" buttons.

## State Management

Location: `$lib/stores/`

### Three Stores

**1. `userPreferences` (persisted)**
```ts
{
  volume: 0.8,
  playbackSpeed: 1,
  difficulty: 'beginner',
  theme: 'system'
}
```

**2. `progress` (persisted)**
```ts
{
  keys: {
    "C": {
      status: "in_progress",
      exercises: {
        "chordSpelling": { attempts: 3, correct: 1, completed: false, bestScore: 0.57 },
        "identifyNumber": { attempts: 10, correct: 8, completed: true, bestScore: 1.0 }
      }
    },
    "G": { status: "locked", exercises: {} }
  }
}
```

**3. `sessionState` (not persisted)**
```ts
{
  currentKey: "C",
  currentExercise: "identifyNumber",
  questionIndex: 2,
  answers: [],
  score: { correct: 2, total: 2 }
}
```

### Persistence

- `persistStore` wrapper subscribes to changes and writes to localStorage with 300ms debounce
- On load, validates stored shape with defaults for missing fields
- Key unlock logic: when all 4 exercises in a key have `completed: true`, set key status to `"completed"` and set next key in pathway order to `"in_progress"`

### Backend Migration Path

Store shapes map to database tables: `users`, `user_preferences`, `key_progress`, `exercise_progress`. Future auth layer replaces localStorage read/writes with API calls; store interface stays identical.

## Routing

```
/                       → Key Pathway (home)
/key/[key]              → Key Module (4 exercise tiles)
/key/[key]/[exercise]   → Exercise Session (ExerciseRunner)
/explore                → Free Explore (all keys unlocked)
/settings               → Settings Panel
```

Home screen has a bottom toggle between "Pathway" and "Explore" tabs.

## Component Architecture

```
+layout.svelte
├── Header.svelte
├── /  (home)
│   └── KeyPathway.svelte
│       └── KeyCircle.svelte
├── /explore
│   └── KeyPathway.svelte (all unlocked)
├── /key/[key]
│   └── KeyModule.svelte
│       └── ExerciseTile.svelte
├── /key/[key]/[exercise]
│   └── ExerciseRunner.svelte
│       ├── ProgressBar.svelte
│       ├── ExercisePrompt.svelte
│       ├── AudioPlayer.svelte
│       ├── AnswerInput/
│       │   ├── MultipleChoice.svelte
│       │   ├── DragDrop.svelte
│       │   └── TextInput.svelte
│       ├── FeedbackDisplay.svelte
│       └── SessionSummary.svelte
├── /settings
│   └── SettingsPanel.svelte
└── ThemeProvider.svelte
```

**ExerciseRunner** is the sole "smart" component: holds session state, calls config's `generateQuestion`/`validateAnswer`, selects input component by difficulty.

All answer input components share a common interface: receive `options`/`slots` as props, dispatch an `answer` event.

**AudioPlayer** is self-contained: receives chord sequence, handles Tone.js internally, exposes play/replay.

## Theming

Catppuccin Mocha (dark) and Latte (light) via CSS custom properties.

### Token Layer

All Catppuccin color tokens defined as `--ctp-*` variables on `:root` (Mocha default). Latte overrides applied via `[data-theme="light"]` and `@media (prefers-color-scheme: light)` for system preference.

### Semantic Layer

```css
--color-bg: var(--ctp-base);
--color-bg-card: var(--ctp-surface0);
--color-text: var(--ctp-text);
--color-text-muted: var(--ctp-subtext0);
--color-primary: var(--ctp-blue);
--color-accent: var(--ctp-mauve);
--color-success: var(--ctp-green);
--color-error: var(--ctp-maroon);
--color-warning: var(--ctp-yellow);
--color-hint: var(--ctp-lavender);
```

All components reference `var(--color-*)` only — never raw Catppuccin values. Palette changes are a single-file edit.

### Theme Switching

`ThemeProvider.svelte` reads preference store, sets `data-theme` attribute on `<html>`. Three options: system (default), light, dark. Toggle in settings + optional header icon.

## UI/UX

### Layout Principles
- One exercise at a time — full visual focus
- Mobile-first responsive design
- Clean typography, purposeful color, smooth transitions

### Visual Feedback
- Correct: Catppuccin Green highlight, brief success animation
- Incorrect: Catppuccin Maroon highlight, show correct answer, no harsh screens
- Hints: gentle fade-in with Lavender accent

### Accessibility
- Keyboard navigation: arrow keys, Enter to submit, Space to play audio, N for next
- Clear focus states on all interactive elements
- Text alternatives for all audio exercises
- High contrast text (Catppuccin handles this)

### Progress Indicators
- Key pathway: circles showing locked/active/completed states
- Key module: tiles with status icons (checkmark, in-progress ring, empty circle) and best score
- Exercise session: thin progress bar + "2 / 5" counter

## MVP Scope

1. All 12 keys computed by theory engine, but only C Major exercises fully playable as proof of concept
2. Four exercise types end-to-end with beginner (visual) and intermediate (text) difficulty modes
3. Tone.js audio: all 7 diatonic chords in C major with piano-like voicings
4. Core pathway screen: all 12 keys visible, C unlocked, others locked
5. Free Explore: jump to C major exercises directly
6. localStorage progress persistence
7. Settings: volume, speed, difficulty, theme toggle
8. Catppuccin Mocha/Latte with system preference default
9. Responsive mobile + desktop layout

## Post-MVP (Design For, Don't Build)

- Hint system ("hear the I chord to compare")
- Streak counter and achievements
- Sound effects (toggle-able)
- Spaced repetition for weaker areas
- Export/import progress as JSON
- Keyboard shortcut legend
- Speed drill exercise type
- Seventh chord extensions
- Minor key support
- User accounts and cloud sync
- Progression Recognition (Type 5) and Fill in the Blank (Type 6) exercise types
