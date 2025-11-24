# Technical Implementation Plan: MBA OS

## Overview
This document outlines the technical implementation strategy for MBA OS, a Windows XP-themed web operating system with macOS-style layout.

## Architecture Decisions

### Technology Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite.js (fast HMR, optimized builds)
- **Styling**: CSS Modules (scoped styles, minimal bundle)
- **State Management**: React Context API + useReducer (no external dependencies)
- **Window Management**: react-rnd (draggable/resizable windows)
- **Icons**: lucide-react (tree-shakeable, modern)
- **Date Utilities**: date-fns (lightweight, modular)
- **Persistence**: localStorage (primary) + IndexedDB (fallback for large data)
- **Audio**: Web Audio API (native browser API)

### Why Not TanStack?
- **TanStack Router**: Not needed - single-page app with window management
- **TanStack Query**: Not needed - no server-side data fetching
- **TanStack Form**: Not needed - simple forms handled with controlled components
- **Bundle Savings**: ~110KB by avoiding TanStack libraries

## Project Structure

```
/src
  /components
    /Desktop          # Desktop shell, wallpaper, shortcuts
    /Window           # Memoized draggable/resizable window wrapper
    /Menubar          # Top menu bar (macOS-style)
    /Dock             # Bottom dock launcher
    /apps
      /Calculator     # Basic calculator with memory functions
      /Calendar       # Month/year calendar view
      /MusicPlayer    # Winamp-style player with visualization
      /Browser        # Iframe-based web browser
      /Notes          # Multi-note text editor
      /TodoPomodoro   # Task manager + Pomodoro timer
    /ErrorBoundary    # Error handling component
  /context
    /WindowContext    # Window state management
    /AppContext       # App registry and lazy loading
    /ThemeContext     # Theme and wallpaper management
    /Providers        # Combined context providers
  /hooks
    /useLocalStorage  # localStorage hook with TypeScript
    /useElementSize   # Window size tracking hook
  /utils
    /windowManager    # Window positioning and sizing utilities
    /sounds           # System sound effects
    /storage          # Storage abstraction (localStorage/IndexedDB)
  /types
    /window           # Window instance types
    /apps             # App definition types
  /styles
    /theme.css        # Windows XP color variables
    /global.css       # Global styles and resets
  /assets
    /icons            # Application icons
    /sounds           # System sound files
    /images           # Wallpaper images
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. **Project Setup**
   - Initialize Vite + React + TypeScript
   - Configure path aliases (@/ imports)
   - Set up CSS Modules
   - Configure build optimization

2. **Window System**
   - Create Window component with react-rnd
   - Implement drag, resize, minimize, maximize, close
   - Window state management (position, size, z-index)
   - Focus management and window stacking

3. **Global State**
   - WindowContext for window management
   - AppContext for app registry and lazy loading
   - ThemeContext for wallpaper and theme

4. **Desktop Shell**
   - Desktop component with wallpaper
   - Window rendering layer
   - Desktop shortcuts (optional)

### Phase 2: UI Shell (Week 1-2)
5. **Top Menu Bar**
   - File, Edit, View, Window, Help menus
   - Context-aware menu items
   - Keyboard shortcuts integration

6. **Bottom Dock**
   - App launcher icons
   - Active window indicators
   - Hover animations
   - Click to launch/focus

### Phase 3: Core Applications (Week 2-3)
7. **Calculator**
   - Basic arithmetic operations
   - Memory functions (M+, M-, MR, MC)
   - Keyboard input support
   - XP-styled UI

8. **Notes**
   - Multiple notes with sidebar
   - CRUD operations
   - Auto-save to localStorage
   - Export functionality

9. **Calendar**
   - Month/year views
   - Date navigation
   - Current date highlighting
   - Date selection

10. **Todo + Pomodoro**
    - Task management (CRUD, filters, sorting)
    - Pomodoro timer (25/5/15 minute intervals)
    - Sound notifications
    - localStorage persistence

### Phase 4: Advanced Applications (Week 3-4)
11. **Music Player**
    - File upload (drag & drop)
    - Playlist management
    - Audio playback controls
    - Canvas-based visualization
    - Web Audio API integration

12. **Browser**
    - Iframe sandbox
    - Navigation controls
    - URL bar with search fallback
    - Bookmarks management
    - CORS handling

### Phase 5: Polish & Optimization (Week 4-5)
13. **Performance Optimization**
    - Code splitting verification
    - Bundle size optimization
    - Memoization (React.memo for Window)
    - Lazy loading all apps

14. **Visual Polish**
    - Windows XP Luna theme
    - Consistent styling across apps
    - Smooth animations (200-300ms)
    - Icon consistency

15. **Keyboard Shortcuts**
    - Global shortcuts (Alt+F4, Ctrl+Alt+N/C/B)
    - App-specific shortcuts
    - Keyboard navigation

16. **Sound Effects**
    - Window open/close sounds
    - Timer notifications
    - System feedback

17. **Error Handling**
    - Error boundaries
    - Loading states
    - Graceful degradation

18. **Accessibility**
    - ARIA labels
    - Keyboard navigation
    - Focus management
    - WCAG AA compliance

19. **Testing**
    - Unit tests (Vitest)
    - Component tests
    - Integration tests

20. **Documentation**
    - README with setup instructions
    - Component documentation
    - Deployment guide

## Key Implementation Details

### Window Management
- Use `react-rnd` for drag/resize functionality
- Window state stored in WindowContext
- Z-index managed by focus order
- Position/size persisted in window state
- Minimized windows hidden but state preserved

### Lazy Loading Strategy
- All apps lazy-loaded via `React.lazy()`
- Component cache prevents re-loading
- Suspense boundaries with loading fallbacks
- Error boundaries catch load failures

### State Management Pattern
```typescript
// Global state (WindowContext)
- windows: WindowInstance[]
- activeWindowId: string | null
- actions: openWindow, closeWindow, focusWindow, etc.

// App state (AppContext)
- apps: AppDefinition[]
- getAppById: (id: string) => AppDefinition | undefined
- componentCache: Map<string, LazyExoticComponent>

// Theme state (ThemeContext)
- wallpaper: string
- setWallpaper: (wallpaper: string) => void
```

### Performance Optimizations
1. **Code Splitting**: Each app is a separate chunk
2. **Memoization**: Window component memoized with React.memo
3. **Bundle Optimization**: Manual chunk splitting in vite.config.ts
4. **Lazy Loading**: Apps loaded only when launched
5. **Asset Optimization**: Images optimized, icons tree-shaken

### Storage Strategy
- **localStorage**: Notes, todos, calendar, bookmarks, playlist metadata
- **IndexedDB**: Large audio files (if needed)
- **Session Storage**: Temporary window state (optional)

## Security Considerations
- Iframe sandbox for browser app
- Content Security Policy (CSP) headers
- No eval() or dangerous code execution
- User data stays client-side (no server)
- CORS handling for external websites

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing Strategy
- **Unit Tests**: Vitest for utilities and helpers
- **Component Tests**: React Testing Library for UI components
- **Integration Tests**: Window management, app launching
- **Performance Tests**: Lighthouse CI, bundle size checks

## Deployment Strategy
- Static site build (Vite)
- Deploy to Vercel/Netlify/GitHub Pages
- No server required
- Environment variables for build-time config

## Success Criteria
- ✅ All 6 applications functional
- ✅ Window management smooth (60fps)
- ✅ Main bundle < 150KB (gzipped)
- ✅ Lighthouse Performance > 90
- ✅ All apps lazy-loaded
- ✅ Zero critical bugs
- ✅ Accessibility compliance (WCAG AA)

## Risk Mitigation
- **Performance Issues**: Code splitting, memoization, bundle analysis
- **Browser Compatibility**: Polyfills, feature detection
- **Storage Limits**: IndexedDB fallback, data compression
- **Audio Format Support**: Format detection, fallback players

---
**Created:** 2025-01-XX  
**Last Updated:** 2025-01-XX  
**Status:** completed  
**Implementation Time:** 5 weeks

