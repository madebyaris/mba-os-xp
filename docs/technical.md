# Technical Specification Document (Tech Spec)
## MBA OS - Windows XP-Style Web Operating System

**Version:** 1.0.0  
**Date:** November 16, 2025

---

## 1. Architecture Overview

### 1.1 Project Structure

```
/src
  /components
    /Window        // Draggable, resizable window component
    /Menubar       // Top menu bar component
    /Dock          // Bottom dock component
    /apps
      /Calculator
      /Calendar
      /MusicPlayer (Winamp-like)
      /Browser
      /Notes
      /TodoPomodoro
  /context         // Global Context and Providers
  /hooks           // Custom React hooks
  /utils           // Helper utilities
  /styles          // Theming, global styles
  /assets          // Images, icons, sounds, skins
```

### 1.2 State Management
- **Global State:** React Context API (minimal global state: window management, themes, app focus, etc.)
- **Local State:** useState/useReducer within app components (e.g., Todos, Notes)
- **Persistence:** localStorage for user data (notes, todos, calendar, playlist, etc.)
- **No TanStack required (see evaluation below)**

### 1.3 Lazy Loading & Code Splitting
- Use `React.lazy()` and `Suspense` for all heavy/major app components
- Vite.js enables automatic code splitting for dynamic imports
- Applications (calculator, music, browser, etc.) are loaded only when launched
- Library dependencies (e.g., Webamp, audio visualizer, FullCalendar) are dynamically imported
- Shared UI components (Window, Menubar, Dock) are loaded statically for performance

### 1.4 Performance Optimization
- Memoize Window components (React.memo) to avoid unnecessary re-renders
- Minimize prop drilling; favor context and hooks
- Bundle analysis and size monitoring
- Prefer CSS Modules for scoped, minimal CSS

---

## 2. Core Stack and Implementation

- **Frontend:** React 18+ with TypeScript
- **Bundler:** Vite.js (development server, build, and HMR)
- **Styling:** CSS Modules (preferred for isolation), alternate: Tailwind CSS
- **Icons & Visuals:** Windows XP icon packs, SVG/PNG assets
- **Persistence:** localStorage + optional IndexedDB fallback
- **Audio:** Web Audio API (native) for music player and notifications
- **App Libraries:**
  - For Calendar: `react-calendar` (lightweight), or custom component
  - For Music Player: `webamp` or `winamp2-js` (wrapped in React)
  - For Todo + Pomodoro: Native React implementation (see resources / samples)

---

## 3. Key Application Interfaces

### 3.1 Window System
- Draggable, resizable containers for each app (styled like XP windows)
- Removable/z-index managed on focus
- Minimize/maximize/close buttons in window headers

### 3.2 Top Menu Bar
- MacOS style bar at the top, floating above windows
  - Menus: File, Edit, View, Window, Help (see PRD for main items)
  - Dispatch global actions (show/hide dock, list windows, etc.)
- Responsive to window focus contexts

### 3.3 Bottom Dock
- App launcher icons, active app highlighting
- Ability to launch multiple instance windows (if supported)
- Drag-to-reorder support (future enhancement)

### 3.4 Application Frames
- Each app launches inside a Window frame
- Can have multiple windows (if desired per app)

---

## 4. App Implementation Outlines

### 4.1 Calculator
Simple pure React component, arithmetic state with useState. Minimal/no dependencies.

### 4.2 Calendar
Use `react-calendar` or a simple custom calendar. Display only month/year; mark today's date.

### 4.3 Music Player (Winamp)
Wrap `webamp` or `winamp2-js` in a React component, dynamically import to avoid increasing main bundle size. Use Winamp skin with XP color palette.

### 4.4 Browser
Iframe-based display; controls for navigation and URL entry. Handle sandboxing and CORS. Avoid feature creep.

### 4.5 Notes
Textarea for text; CRUD on simple string array. Persist to localStorage.

### 4.6 Todo + Pomodoro
Combine Todo app (React array state, CRUD, with priority and due date) and Pomodoro (simple timer using useState/useRef/setInterval, with notification via Audio API).

---

## 5. TanStack Analysis

**TanStack Router/Query/Form: Not required for this project.**

- No multi-route navigation: single SPA workspace with internal window management
- No server or remote data fetching: all app data is local
- No form complexity or schema: basic input forms handleable with native React
- Using TanStack adds ~45kb-110kb extra and does not align with project's lightweight goal

**Alternatives Used:**
- React Context API for global state
- Native form handling with controlled components
- All data persisted with localStorage or IndexedDB

---

## 6. Security & Browser Compatibility
- App windows are sandboxed, no code execution beyond the browser
- Browser compatibility: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- All 3rd party JS libraries evaluated for CSP compliance
- user data stored only on client, never sent to a server
- CSP in place for iframes/app browser

---

## 7. Accessibility
- ARIA labels and roles for menu, dock, windows
- Tab, Enter, and shortcut key access to UI
- Contrast and focus visible for XP theme
- Reduce motion option for animations

---

## 8. Testing
- Unit tests: Jest + React Testing Library for UI logic
- E2E tests: Playwright or Cypress for window and app integration behavior
- Performance and bundle size checks via Vite plugin and Lighthouse

---

## 9. Deployment
- Static site export (default Vite build)
- Deployable to Vercel, Netlify, Github Pages, or any static file host
- All state client-side; no server required

---

*End of Technical Specification Document*