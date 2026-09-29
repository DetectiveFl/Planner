# Planner

A minimalist desktop calendar and task planner application built with **Electron + React + TypeScript**.  
Features a sleek dark theme (`#212121` / `#00e116`), offline-first local storage, and Obsidian-like node graphs for tracking personal goals.

---

## Features

### Calendar View
- Full-screen monthly layout with clean day-grid indicators.
- Event markers:
  - **Green dot**: Scheduled time-block tasks.
  - **Blue dot**: Mandatory / deadline tasks without specific hours.
- Collapsible and resizable side panel for focused day inspection.

### Daily Schedule
- **Time-blocked tasks**: Visual timeline from 06:00 to 23:00.
- **Mandatory items**: Untimed daily checklist.
- Recurrence support: Single instance, daily, weekdays, weekly, and monthly.
- Isolated status: Marking a recurring task as completed only affects the selected date.

### Goals & Roadmap
- Dedicated goal tracking with extended descriptions.
- Individual visual graph canvas for each goal.
- Interactive nodes and edges with draggable positioning (powered by React Flow).

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Desktop Runtime:** Electron
- **State Management:** Zustand (with local persistence)
- **Graph & Utilities:** `@xyflow/react`, `lucide-react`, `date-fns`

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (LTS)
- npm (bundled with Node.js)
- OS: Windows (for compiling the native `.exe` installer)

---

## Getting Started

1. **Clone the repository:**
   `git clone [https://github.com/DetectiveFI/Planner.git](https://github.com/DetectiveFI/Planner.git)`
   `cd Planner`

2. **Install dependencies:**
   `npm install`

3. **Start development mode:**
   `npm run dev`

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Runs Vite dev server and opens the Electron desktop window |
| `npm run build` | Runs TypeScript type checking and builds the web bundle to `dist/` |
| `npm run dist` | Packages the application into a Windows executable installer in `release/` |

---

## Project Structure

    planner/
    ├── electron/          # Electron main process and window configuration
    ├── src/
    │   ├── components/    # UI components (Calendar, Day view, Goals, Graph)
    │   ├── hooks/         # Custom React hooks
    │   ├── store/         # Zustand store and persistence layer
    │   ├── styles/        # Global styles and design tokens
    │   ├── types/         # TypeScript type definitions
    │   └── utils/         # Helper functions
    ├── public/            # Static assets
    ├── index.html         # Vite HTML entry point
    ├── package.json
    └── vite.config.ts

---

## License

This project is licensed under the [MIT License](LICENSE).
