# Implementation Plan Viewer

A centralized GitHub Pages dashboard that aggregates and visualizes AI-generated implementation plans from multiple repositories. Transform raw markdown planning documents into an interactive, searchable visual interface with phase tracking, scope impact maps, and cross-repository insights.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Vue](https://img.shields.io/badge/Built%20with-Vue%203-4FC08D?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## 🎯 Overview

When AI agents generate implementation plans as structured markdown files, they're powerful reference documents but difficult to browse, compare, and track. This viewer solves that problem by:

- **Aggregating** implementation plans from multiple repositories automatically
- **Visualizing** plan structure, scope, and progress with rich UI components
- **Tracking** completion status across phases and repositories
- **Discovering** which project areas are affected by each plan
- **Switching** between repositories to view plans from different projects

## 🏗️ Architecture

### Centralized Multi-Repository Design

```
┌─────────────────────────────────────────────────────────────┐
│  Source Repository A                                         │
│  ├── implementation-plans/                                   │
│  │   ├── 001_add_auth.md                                    │
│  │   └── 002_refactor_api.md                                │
│  └── .github/workflows/notify-plan-viewer.yml  ─────┐       │
└──────────────────────────────────────────────────────┼───────┘
                                                       │
┌──────────────────────────────────────────────────────┼───────┐
│  Source Repository B                                 │       │
│  ├── implementation-plans/                           │       │
│  │   └── 001_improve_ci.md                          │       │
│  └── .github/workflows/notify-plan-viewer.yml  ─────┤       │
└──────────────────────────────────────────────────────┼───────┘
                                                       │
                        repository_dispatch webhook    │
                                   │                   │
                                   ▼                   │
┌─────────────────────────────────────────────────────┼───────┐
│  ImplPlanViewer (This Repository)                   │       │
│                                                      │       │
│  Triggered by: repository_dispatch from sources ────┘       │
│                                                              │
│  GitHub Actions Workflow:                                   │
│  1. Auto-discover repos (by org/topic)                      │
│  2. Fetch plans via GitHub API (supports private repos)     │
│  3. Parse markdown & generate manifest                      │
│  4. Build Vite + Vue app with pre-fetched data             │
│  5. Deploy to GitHub Pages                                  │
│                                                              │
│  Output:                                                     │
│  └── plan-viewer/ (built static site)                       │
│      ├── assets/                                             │
│      ├── data/                                               │
│      │   ├── repositories.json                              │
│      │   ├── repo-a-plans.json                              │
│      │   └── repo-b-plans.json                              │
│      └── index.html                                          │
└──────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                          GitHub Pages (Static Site)
                      https://yourorg.github.io/ImplPlanViewer
```

### How It Works

1. **Source repositories** contain implementation plans in `implementation-plans/` folder
2. When plans change, source repos trigger this viewer via **repository_dispatch** webhook
3. **GitHub Actions** in this repo:
   - Discovers all repositories tagged with specific topic or in organization
   - Fetches implementation plan files via GitHub API (with token for private repos)
   - Parses markdown to extract metadata and content
   - Generates static JSON manifests per repository
   - Builds Vue SPA with Vite, bundling pre-fetched data
   - Deploys to GitHub Pages
4. **Users** browse the static site with instant navigation (no runtime API calls)

## ✨ Features

### 📊 Plan Index View
- Card-based layout showing all plans across repositories
- Filter by repository, type (feature/bug/refactor), priority, scope
- Sort by date, priority, or completion status
- Color-coded badges for quick visual scanning
- Search across plan titles and objectives

### 📄 Plan Detail View
Rich structured rendering of each plan:

- **Header Band**: Plan number, title, type/priority/scope badges
- **Objective Block**: Highlighted problem statement and goals
- **AI Intent Cards**: Expandable What/Why/How layout from "Proposed Changes"
- **Scope Impact Map**: D3.js force-directed graph showing affected project areas
- **Phase Progress Timeline**: Horizontal timeline with checkbox completion tracking
- **Testing & Rollout Panels**: Side-by-side strategy display
- **Success Criteria Checklist**: Visual completion percentage bar
- **Notes Section**: Collapsible additional context

### 🔄 Repository Selector
- Dropdown to switch between tracked repositories
- Shows plan count per repository
- Auto-updates when new repos are discovered
- Persists selection in URL for sharing

### 🎨 Theming
- Light and dark modes
- System preference detection as default
- Persistent toggle switch
- Material Design 3 components via Vuetify

### ⌨️ Keyboard Navigation
- `←` / `→` to navigate between plans
- `Esc` to return to index
- `/` to focus search

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- A GitHub token with access to repositories containing plan files

### 1) Clone and install

```bash
git clone https://github.com/YOUR_ORG/ImplPlanViewer.git
cd ImplPlanViewer
cd plan-viewer
npm install
```

### 2) Configure environment

Create local env files from the provided templates:

```bash
cd /path/to/ImplPlanViewer
cp .env.example .env
cp plan-viewer/.env.example plan-viewer/.env
```

`/.env` is used by root automation scripts in `scripts/`.  
`/plan-viewer/.env` is used by the Vite app.

### 3) Run the app locally

```bash
cd plan-viewer
npm run dev
```

Open `http://localhost:5173`.

### 4) Validate locally

```bash
cd plan-viewer
npm run lint
npm run test
npm run build
npm run build:analyze # Optional: generates dist/bundle-analysis.html
npm run perf:bundle  # Optional: alias for bundle analysis build
npm run perf:lighthouse # Optional: builds, serves, and runs Lighthouse
npm run test:cross-browser # Optional: smoke checks chromium/firefox/webkit
npm run test:responsive # Optional: smoke checks multiple viewport sizes
npm run build-storybook # Optional: validates Storybook static build
```

## 🔧 Configuration

### Root script environment (`.env`)

```env
GITHUB_TOKEN=
DISCOVERY_MODE=topic
GITHUB_ORG=
GITHUB_TOPIC=impl-plan-viewer
INCLUDE_REPOS=
EXCLUDE_REPOS=
REPOSITORY=owner/repo
MANIFEST_DATA_DIR=plan-viewer/src/data
MANIFEST_INPUT=
PARSE_INPUT=
```

### App environment (`plan-viewer/.env`)

```env
VITE_GITHUB_TOKEN=
VITE_GITHUB_ORG=
VITE_GITHUB_TOPIC=impl-plan-viewer
VITE_DISCOVERY_MODE=topic
VITE_INCLUDE_REPOS=
VITE_EXCLUDE_REPOS=
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_MEASUREMENT_ID=
```

### Discovery modes

- `topic` (recommended): finds repositories tagged with `GITHUB_TOPIC`
- `org`: scans repositories in `GITHUB_ORG`

### Manual pipeline commands (optional)

```bash
# Discover repositories with implementation-plans/
node scripts/discover-repositories.js

# Fetch plan markdown files for one repository
REPOSITORY=owner/repo node scripts/fetch-plans.js

# Parse plans to structured JSON (reads stdin or PARSE_INPUT)
node scripts/parse-plans.js < parsed-input.json

# Generate manifests (reads stdin or MANIFEST_INPUT)
node scripts/generate-manifests.js < manifest-input.json

# Validate generated manifests
node scripts/validate-manifests.js plan-viewer/src/data
```

## 📤 Source Repository Setup (Adding Plans)

1. Create `implementation-plans/` in the source repository.
2. Add plan files using `NNN_name.md` (example: `001_add_auth.md`).
3. Add topic `impl-plan-viewer` (or include the repository explicitly).
4. Add a workflow that sends `repository_dispatch` to this repository on plan changes.
5. Store a PAT with repo access as `PLAN_VIEWER_TOKEN` in the source repository secrets.

## 📋 Plan File Format

Plans must follow the template structure:

```markdown
# Implementation Plan: [Title]

> **Type:** `feature` | `enhancement` | `bug fix` | `refactor` | `chore`
> **Scope:** [affected area]
> **Priority:** `critical` | `high` | `medium` | `low`

---

## Problem / Objective
[One paragraph description]

## Current State
[What exists today]

## Proposed Changes
### 1. [Change Area]
- **What:** Description
- **Why:** Justification
- **How:** Technical approach

## Implementation Steps
1. **Phase 1: [Name]**
   - [ ] Step A
   - [ ] Step B

## Testing Strategy
[How to verify correctness]

## Rollout
[Deployment approach]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Notes
[Optional: tradeoffs, alternatives, follow-ups]
```

### Naming Convention
Files in `implementation-plans/` must follow: `NNN_descriptive_name.md`
- `NNN`: Zero-padded 3-digit number (001, 002, ..., 099)
- `descriptive_name`: Lowercase, underscores, no spaces
- Examples: `001_add_authentication.md`, `042_refactor_api_layer.md`

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Vue 3 | Reactive UI components |
| **Language** | TypeScript | Type safety and IDE support |
| **Build Tool** | Vite | Fast dev server and optimized builds |
| **UI Library** | Vuetify 3 | Material Design components |
| **Routing** | Vue Router | Client-side navigation |
| **State** | Pinia | Centralized state management |
| **Markdown** | vue-markdown-render | Vue-integrated markdown parsing |
| **Visualization** | D3.js | Force-directed scope graphs |
| **Testing** | Vitest + Vue Test Utils | Unit and component tests |
| **Linting** | ESLint + Prettier | Code quality and formatting |
| **CI/CD** | GitHub Actions | Automated build and deploy |

## 🤝 Contributing

### Adding Features

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make changes in `plan-viewer/src/`
4. Write tests for new functionality
5. Ensure tests pass: `npm run test`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Reporting Issues

Use the issue tracker for:
- Bug reports (parsing errors, rendering issues)
- Feature requests (new visualizations, filters)
- Documentation improvements

## 📊 Project Status

- ⚙️ **Status**: In Development
- 📅 **Started**: April 2026
- 🎯 **Target**: MVP by Q2 2026

### Roadmap

- [x] Architecture design
- [ ] Phase 1: Manifest generation + GitHub Actions
- [ ] Phase 2: Vue app with index and detail views
- [ ] Phase 3: D3.js scope impact visualization
- [ ] Phase 4: Repository selector and multi-repo support
- [ ] Phase 5: Polish, dark mode, keyboard nav
- [ ] Beta testing with real repositories
- [ ] Public launch

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🔗 Related Projects

- [IMPLEMENTATION_PLAN_TEMPLATE.md](IMPLEMENTATION_PLAN_TEMPLATE.md) - The plan template file
- [IDEA.md](IDEA.md) - Original project proposal and detailed design

## 💡 Inspiration

Created to solve the challenge of tracking AI-generated implementation plans across multiple projects. When you have dozens of repositories with AI-assisted development, each generating detailed implementation plans, you need a centralized way to visualize, track, and understand what's being built where.

---

**Built with ❤️ for AI-assisted development workflows**
