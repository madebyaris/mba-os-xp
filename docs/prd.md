# Product Requirements Document (PRD)
## MBA OS - Windows XP-Style Web Operating System

**Version:** 1.0.0  
**Date:** November 16, 2025  
**Project Type:** Web Application  
**Target Platform:** Modern Web Browsers

---

## 1. Executive Summary

MBA OS is a nostalgic web-based operating system that mimics the visual aesthetics of Windows XP while implementing macOS-style interface layout (top menubar and bottom dock). The project aims to deliver a lightweight, performant, and minimalist desktop environment in the browser with essential productivity applications.

### Key Objectives
- Create an immersive Windows XP-themed desktop experience in the browser
- Implement macOS-style layout (top menu bar + bottom dock)
- Build lightweight, code-split applications that load on-demand
- Ensure smooth performance with minimal bundle size
- Provide nostalgic user experience while maintaining modern web standards

---

## 2. Product Vision

**Vision Statement:**  
To recreate the beloved Windows XP experience in a modern web environment, combining the best of Windows aesthetics with macOS usability patterns, while maintaining excellent performance through modern web technologies.

**Target Audience:**
- Nostalgia enthusiasts who grew up with Windows XP
- Web developers interested in creative web applications
- Users seeking browser-based productivity tools
- Portfolio projects and creative demonstrations

---

## 3. User Personas

### Primary Persona: The Nostalgic Developer
- **Age:** 25-40
- **Background:** Software developer or tech enthusiast
- **Goals:** Experience Windows XP nostalgia, explore creative web applications
- **Pain Points:** Modern applications lack personality and charm
- **Tech Savviness:** High

### Secondary Persona: The Casual User
- **Age:** 20-50
- **Background:** General computer user
- **Goals:** Access simple productivity tools with unique interface
- **Pain Points:** Boring, generic web applications
- **Tech Savviness:** Medium

---

## 4. Core Features

### 4.1 Desktop Environment

#### Top Menu Bar (macOS-style)
- **File Menu:** New Window, Close Window, Exit
- **Edit Menu:** Copy, Paste (for active application)
- **View Menu:** Show/Hide Dock, Fullscreen
- **Window Menu:** Minimize All, Restore All, List Open Windows
- **Help Menu:** About, Documentation

**Priority:** High  
**MVP:** Yes

#### Bottom Dock (macOS-style)
- Application launcher icons
- Visual feedback on hover
- Active application indicators
- Smooth animations
- Drag-to-reorder (future enhancement)

**Priority:** High  
**MVP:** Yes

#### Desktop Area
- Windows XP "Bliss" wallpaper or similar aesthetic
- Draggable, resizable application windows
- Window management (minimize, maximize, close)
- Multiple windows support
- Window stacking/z-index management

**Priority:** High  
**MVP:** Yes

---

### 4.2 Application Suite

#### 4.2.1 Calculator
**Description:** Basic arithmetic calculator with Windows XP styling

**Features:**
- Basic operations: +, -, ×, ÷
- Clear (C) and Clear Entry (CE) buttons
- Decimal point support
- Keyboard input support
- Memory functions (M+, M-, MR, MC)
- Windows XP calculator visual design

**User Stories:**
- As a user, I want to perform basic calculations within the web OS
- As a user, I want keyboard shortcuts for faster input
- As a user, I want to see calculation history

**Priority:** High  
**Complexity:** Low  
**Estimated Development:** 1-2 days

---

#### 4.2.2 Calendar
**Description:** Month and year view calendar with date navigation

**Features:**
- Month view display
- Year view display
- Navigate between months/years
- Highlight current date
- Display day names
- Week numbers (optional)
- Date selection capability
- Clean, readable design

**User Stories:**
- As a user, I want to view the current month's calendar
- As a user, I want to navigate to different months and years
- As a user, I want to see today's date highlighted

**Priority:** High  
**Complexity:** Medium  
**Estimated Development:** 2-3 days

---

#### 4.2.3 Music Player (Winamp-style)
**Description:** Retro-styled audio player inspired by Winamp 2.x

**Features:**
- Play, pause, stop, next, previous controls
- Volume control and mute
- Progress bar with seek functionality
- Playlist management (add, remove, reorder)
- Track information display (title, artist, duration)
- File upload support (drag & drop)
- Visualization (optional: oscilloscope or spectrum)
- Winamp classic skin aesthetic
- Mini mode (compact view)

**User Stories:**
- As a user, I want to play audio files in my browser
- As a user, I want to create and manage playlists
- As a user, I want to control playback with keyboard shortcuts
- As a user, I want to see track information and progress

**Technical Considerations:**
- Use Web Audio API for playback
- Support MP3, WAV, OGG formats
- Implement audio visualization using Canvas API
- Store playlist in localStorage

**Priority:** High  
**Complexity:** High  
**Estimated Development:** 4-5 days

---

#### 4.2.4 Browser
**Description:** Simple embedded web browser with navigation controls

**Features:**
- URL address bar
- Back, forward, refresh buttons
- Home button
- Stop loading button
- Iframe-based content display
- Bookmarks (simple list)
- New tab/window capability
- Search bar with default search engine

**User Stories:**
- As a user, I want to browse websites within the OS
- As a user, I want to navigate between pages
- As a user, I want to bookmark favorite sites

**Technical Considerations:**
- Iframe sandbox for security
- CORS limitations awareness
- Implement content security policy
- Handle external links properly

**Priority:** Medium  
**Complexity:** Medium  
**Estimated Development:** 2-3 days

---

#### 4.2.5 Notes
**Description:** Simple text editor for quick note-taking

**Features:**
- Plain text editing
- Save notes to localStorage
- Load saved notes
- Multiple notes support
- Note list/sidebar
- Create, rename, delete notes
- Auto-save functionality
- Character/word count
- Basic formatting (optional: bold, italic, lists)
- Export as .txt file

**User Stories:**
- As a user, I want to quickly jot down notes
- As a user, I want my notes to persist across sessions
- As a user, I want to organize multiple notes
- As a user, I want to export my notes

**Priority:** High  
**Complexity:** Low  
**Estimated Development:** 2-3 days

---

#### 4.2.6 Todo + Pomodoro
**Description:** Combined task management and time tracking application

**Todo Features:**
- Add, edit, delete tasks
- Mark tasks as complete
- Task priority levels (low, medium, high)
- Due dates
- Task categories/tags
- Filter tasks (all, active, completed)
- Sort tasks by priority, date
- Persist to localStorage
- Task counter

**Pomodoro Features:**
- 25-minute work timer (customizable)
- 5-minute break timer (customizable)
- 15-minute long break after 4 pomodoros
- Start, pause, reset controls
- Visual countdown display
- Sound notification on completion
- Session counter
- Integration with tasks (start pomodoro for specific task)

**User Stories:**
- As a user, I want to manage my daily tasks
- As a user, I want to use the Pomodoro technique for focused work
- As a user, I want to track which tasks I completed during each pomodoro
- As a user, I want to be notified when a session ends

**Technical Considerations:**
- Use setInterval for timer
- Web Audio API for notification sounds
- Store task history and statistics

**Priority:** High  
**Complexity:** Medium  
**Estimated Development:** 3-4 days

---

## 5. User Experience (UX) Requirements

### 5.1 Visual Design
- **Theme:** Windows XP Luna theme aesthetic
- **Color Scheme:** 
  - Primary: Blue (#0054E3)
  - Secondary: Green (#73D216)
  - Background: Light blue gradient
  - Window chrome: Silver/gray
- **Typography:** 
  - System: Tahoma, Segoe UI, sans-serif
  - Size: 11-12px base
- **Icons:** Windows XP-style icons (flat, colorful, 32x32px)

### 5.2 Interactions
- **Window Dragging:** Smooth, 60fps
- **Window Resizing:** Corner and edge handles
- **Animations:** Subtle, 200-300ms transitions
- **Hover States:** Clear visual feedback
- **Focus States:** Visible focus indicators for accessibility

### 5.3 Responsive Behavior
- **Minimum Resolution:** 1024x768
- **Desktop-First:** Optimized for desktop browsers
- **Mobile:** Basic support (simplified layout)

---

## 6. Technical Requirements

### 6.1 Technology Stack
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite.js
- **Styling:** CSS Modules or Tailwind CSS
- **State Management:** React Context API + useReducer
- **Data Persistence:** localStorage / IndexedDB

### 6.2 Performance Requirements
- **Initial Load Time:** < 3 seconds on 4G connection
- **Time to Interactive:** < 5 seconds
- **Bundle Size:** Main bundle < 150KB (gzipped)
- **Code Splitting:** Each app lazy-loaded separately
- **Frame Rate:** 60fps for animations

### 6.3 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 6.4 Accessibility
- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- Sufficient color contrast (WCAG AA)

---

## 7. TanStack Evaluation

### Question: Is TanStack needed for this project?

**Answer: NO**

### Reasoning:

#### TanStack Router - NOT NEEDED
- **Why:** Single-page application with no traditional routing
- **Alternative:** React Context for state management
- **Bundle Impact:** Saves ~45KB

#### TanStack Query - NOT NEEDED
- **Why:** No server-side data fetching or complex caching requirements
- **Alternative:** localStorage for data persistence, fetch API if needed
- **Bundle Impact:** Saves ~40KB

#### TanStack Form - NOT NEEDED
- **Why:** Simple form inputs, no complex validation requirements
- **Alternative:** Controlled components with useState
- **Bundle Impact:** Saves ~25KB

### Recommended Approach:
1. **State Management:** React Context API + useReducer for global state
2. **Data Persistence:** localStorage for simple data, IndexedDB for larger data (music files metadata)
3. **Forms:** Native controlled components
4. **Code Splitting:** React.lazy() and Suspense

### Total Bundle Savings: ~110KB by not using TanStack libraries

---

## 8. Success Metrics

### 8.1 Performance Metrics
- Lighthouse Performance Score > 90
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Total Bundle Size < 500KB

### 8.2 User Engagement Metrics
- Average session duration > 5 minutes
- Number of applications launched per session
- Return user rate

### 8.3 Quality Metrics
- Zero critical bugs at launch
- < 5% error rate in production
- 100% feature completion for MVP

---

## 9. Development Phases

### Phase 1: Foundation (Week 1)
- Desktop environment setup
- Window component system
- Menu bar implementation
- Dock implementation
- Basic window management

### Phase 2: Core Applications (Week 2-3)
- Calculator (2 days)
- Notes (2 days)
- Calendar (3 days)
- Todo + Pomodoro (4 days)

### Phase 3: Advanced Applications (Week 4)
- Music Player (5 days)
- Browser (2 days)

### Phase 4: Polish & Optimization (Week 5)
- Performance optimization
- Bug fixes
- Visual polish
- Documentation
- Testing

---

## 10. Future Enhancements (Post-MVP)

### Phase 2 Features
- File system simulation (like win32.run)
- Paint application (MS Paint clone)
- Minesweeper game
- Notepad++ style code editor
- Image viewer
- PDF viewer

### Phase 3 Features
- Multiple desktop support
- Custom wallpapers
- Theme customization
- Keyboard shortcuts manager
- Search functionality
- System settings panel

### Phase 4 Features
- Cloud sync (save state to cloud)
- Multi-user support
- Third-party app API
- Mobile responsive version
- PWA support

---

## 11. Constraints & Limitations

### Technical Constraints
- Browser security policies (CORS, CSP)
- localStorage size limits (5-10MB)
- No native file system access (except via File API)
- Audio format support varies by browser

### Design Constraints
- Must maintain Windows XP aesthetic
- Must keep bundle size minimal
- Must avoid copyright issues (use open-source alternatives)

### Scope Constraints
- MVP focuses on 6 core applications
- No server-side functionality in MVP
- No real networking capabilities (except iframe browser)

---

## 12. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance issues with multiple windows | High | Medium | Implement window virtualization, limit concurrent windows |
| Browser compatibility issues | Medium | Low | Comprehensive testing, polyfills |
| localStorage limitations | Medium | Medium | Implement IndexedDB fallback, data compression |
| Scope creep | High | High | Strict MVP adherence, feature freeze after planning |
| Audio playback issues | Medium | Low | Fallback players, format detection |

---

## 13. Acceptance Criteria

### Must Have (MVP)
- ✓ Desktop environment with top menu bar and bottom dock
- ✓ All 6 applications functional
- ✓ Window management (drag, resize, minimize, maximize, close)
- ✓ Data persistence across sessions
- ✓ Responsive performance (60fps)
- ✓ Code splitting implemented
- ✓ Windows XP visual theme

### Should Have
- ✓ Keyboard shortcuts
- ✓ Sound effects
- ✓ Loading states
- ✓ Error handling

### Nice to Have
- Multiple theme support
- Customizable wallpapers
- Desktop icons
- Right-click context menus

---

## 14. Glossary

- **WebOS:** Web-based operating system simulation
- **Dock:** Bottom application launcher bar (macOS-style)
- **Menu Bar:** Top system menu (macOS-style)
- **Code Splitting:** Technique to split code into smaller chunks for on-demand loading
- **Lazy Loading:** Loading components/modules only when needed
- **Pomodoro:** Time management technique with 25-minute work intervals

---

## 15. Approvals

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | [Your Name] | 2025-11-16 | _________ |
| Tech Lead | [Your Name] | 2025-11-16 | _________ |
| Designer | [Your Name] | 2025-11-16 | _________ |

---

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-16 | AI Assistant | Initial document creation |

---

*End of Product Requirements Document*
