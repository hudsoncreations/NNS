# NNS ABCs - Project Rules

## Commands
- `npm run dev` — start dev server (port 5173)
- `npm run build` — production build (adapter-static → `build/`)
- `npm run preview` — preview production build locally
- `npm run check` — type-check with svelte-check
- `npm test` — run vitest (unit tests)
- `npm run test:watch` — run vitest in watch mode

## Architecture Rules

### Framework & Conventions
- **SvelteKit** with **Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`)
- Rune-mode is forced project-wide in `svelte.config.js` (except node_modules)
- Files using `$state` outside `.svelte` components MUST use `.svelte.ts` extension
- No backend — all persistence via `localStorage` with 300ms debounced writes
- Static site deployed to GitHub Pages via `@sveltejs/adapter-static` (SPA fallback mode)

### Base Path
- Production base path is `/NNS` (set conditionally in `svelte.config.js`)
- ALL `href` attributes in templates must use `{base}/path` (import from `$app/paths`)
- ALL `goto()` calls must use `` `${base}/path` ``
- Static asset `src` attributes in components must use `{base}/asset-path`
- Route detection must use `page.route.id` (NOT `page.url.pathname`) because pathname includes the base path in production

### Theming
- Catppuccin Mocha (dark) / Latte (light) via CSS custom properties
- All colors referenced as `var(--color-*)` semantic tokens, NEVER raw Catppuccin vars in components
- Available semantic tokens: `--color-bg`, `--color-bg-card`, `--color-bg-elevated`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-primary`, `--color-accent`, `--color-success`, `--color-error`, `--color-warning`, `--color-hint`, `--color-border`, `--color-border-muted`
- Theme switching: `data-theme` attribute on `<html>` (values: `system`, `light`, `dark`)
- For theme-conditional display, use `:global([data-theme="light"])` in scoped styles
- 3D "Duolingo-style" buttons use `border-bottom` for depth, `color-mix()` for shadow tint

### Layout Rules
- Exercise screens: `height: 100dvh`, `overflow: hidden` — must NEVER scroll
- Exercise screens hide the header (detected via `page.route.id === '/key/[key]/[exercise]'`)
- Use `clamp()` for responsive font sizes, `min()` for responsive containers
- Mobile-first: all layouts must work on 375px+ screens without scrolling

### State Management
- Three stores in `$lib/stores/index.svelte.ts`:
  - `userPreferences` — volume, speed, difficulty, theme, timer settings (persisted)
  - `progress` — per-key, per-exercise completion tracking (persisted)
  - `sessionState` — current exercise session (NOT persisted)
- Stores must be initialized with `.init()` in the page's `onMount` before use
- When reading store values in non-reactive contexts (regular functions called from `$effect`), read directly from `store.value.property` rather than through `$derived` intermediaries

### Music Theory
- All theory computation is stateless and pure — lives in `$lib/theory/index.ts`
- Key order: C → G → D → F → A → E → Bb → Eb → Ab → Db → Gb → B
- Chord names use abbreviated qualities: "C maj", "D min", "B dim"
- Roman numerals: uppercase for major (I, IV, V), lowercase for minor (ii, iii, vi), lowercase + degree symbol for diminished (vii°)

### Exercise System
- 4 exercise types per key: chordSpelling, identifyNumber, identifyChord, audioId
- Pass threshold: 80% (6/7 for chordSpelling, 4/5 or 5.6/7 for others)
- Exercise question generation and validation lives in `ExerciseRunner.svelte`
- Answer normalization handles: plain numbers → roman numerals, "em"/"emin" → "e min", bare notes → "note maj"

### Audio
- Tone.js with single shared PolySynth (triangle wave)
- Audio context starts on first user interaction (`Tone.start()`)
- Volume: 0-1 mapped to -40dB to 0dB
- Playback speed multiplier affects chord duration and inter-chord gaps

## Style Guide
- Components use Svelte scoped `<style>` blocks — no external CSS per component
- Global styles only in `$lib/theme/global.css` and `$lib/theme/catppuccin.css`
- Button depth effect: `border-bottom: 4-5px solid`, active state reduces to 2px + `translateY(2px)`
- Border radius: 16px for cards/buttons, 50% for circles, 12px for small elements
- Font stack: Nunito, system fonts fallback
- Keyboard navigation: all interactive lists support arrow keys, number key shortcuts

## Known Issues
- 4 pre-existing TypeScript errors: `string | undefined` not assignable to `string` in route param handling (`src/routes/key/[key]/+page.svelte:43`, `src/routes/key/[key]/[exercise]/+page.svelte:16,18,26`). These are benign — SvelteKit guarantees the params exist for matched routes.

## Deployment
- GitHub Pages at `https://hudsoncreations.github.io/NNS/`
- Auto-deploys on push to `main` via `.github/workflows/deploy.yml`
- Uses `adapter-static` with `fallback: '404.html'` for SPA client-side routing
