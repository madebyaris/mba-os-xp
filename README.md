# MBA OS

MBA OS is a nostalgic web desktop that combines Windows XP visuals with a macOS-style layout (top menubar + bottom dock). Each productivity app is lazy-loaded to keep the main bundle tiny while still providing a rich experience.

## Features

- **Desktop shell** with wallpaper selection, keyboard shortcuts, and draggable/resizable windows.
- **Top Menubar** offering system controls (New Window, Dock visibility, window list, etc.).
- **Dock launcher** with hover animations, active indicators, and focus shortcuts.
- **Built-in applications**
  - Calculator with memory functions, history, and keyboard input.
  - Notes with multi-note management, auto-save, and export.
  - Calendar month/year view with navigation controls.
  - Todo + Pomodoro manager with task filters and timer automation.
  - Winamp-inspired Music Player with playlist persistence, drag-and-drop uploads, and visualization.
  - Browser sandbox with navigation controls, bookmarks, and search fallback.
- **System sounds** for window open/close and timer notifications.
- **Global keyboard shortcuts** for quickly launching apps or closing windows.
- **Error boundary** and loading indicators to keep UX graceful even when something fails.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Type-check and build for production
npm run build

# Run unit tests (Vitest)
npm run test
```

## Project Structure Highlights

- `src/components/Desktop` – desktop shell, shortcuts, and wallpaper handling.
- `src/components/Window` – memoized draggable/resizable window wrapper using `react-rnd`.
- `src/context` – Window/App/Theme providers and shared state.
- `src/components/apps/*` – individual app implementations (lazy-loaded via `AppContext`).
- `src/utils/sounds.ts` – audio helpers for system feedback.

## Deployment

The app is a static Vite build, so it can be deployed to any static host (Vercel, Netlify, Render, etc.).

### Vercel
1. `npm run build`
2. Deploy the generated `dist/` folder (Vercel automatically detects Vite).

### Netlify
1. Set build command to `npm run build`
2. Set publish directory to `dist`
3. Trigger a deploy (CLI or UI).

## Testing

- Vitest is configured for fast unit tests. Sample suites cover browser helpers and window manager utilities.
- Run `npm run test` to execute the full suite (automatically run in CI before deployment).

## Accessibility & Performance

- High-contrast XP palette with focus indicators and ARIA labels on interactive elements.
- Desktop shortcuts support keyboard activation.
- Manual Rollup chunks ensure vendor code doesn’t bloat the main bundle, and all heavy apps are lazy-loaded.

Enjoy exploring MBA OS! 🎶🪟🧮
