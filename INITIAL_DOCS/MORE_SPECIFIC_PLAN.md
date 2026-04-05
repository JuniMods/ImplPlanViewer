# Implementation Plan Viewer - Detailed Specification

This document provides in-depth specifications for each component of the Implementation Plan Viewer application. It bridges the gap between high-level design (IDEA.md) and concrete implementation.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Data Layer Architecture](#2-data-layer-architecture)
3. [GitHub Actions Pipeline](#3-github-actions-pipeline)
4. [Frontend Application Architecture](#4-frontend-application-architecture)
5. [Component Specifications](#5-component-specifications)
6. [State Management](#6-state-management)
7. [Routing & Navigation](#7-routing--navigation)
8. [Markdown Processing](#8-markdown-processing)
9. [D3.js Visualization](#9-d3js-visualization)
10. [Theming System](#10-theming-system)
11. [Testing Strategy](#11-testing-strategy)
12. [Build & Deployment](#12-build--deployment)

---

## 1. Project Structure

### Repository Layout

```
ImplPlanViewer/
├── .github/
│   └── workflows/
│       ├── build-and-deploy.yml         # Main CI/CD pipeline
│       └── manual-rebuild.yml           # Manual trigger workflow
│
├── plan-viewer/                         # Vue application root
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── assets/                      # Static assets
│   │   │   ├── styles/
│   │   │   │   ├── global.css
│   │   │   │   ├── variables.css
│   │   │   │   └── themes.css
│   │   │   └── icons/
│   │   │
│   │   ├── components/                  # Vue components
│   │   │   ├── common/
│   │   │   │   ├── AppHeader.vue
│   │   │   │   ├── AppFooter.vue
│   │   │   │   ├── LoadingSpinner.vue
│   │   │   │   ├── ErrorBoundary.vue
│   │   │   │   └── ThemeToggle.vue
│   │   │   │
│   │   │   ├── repository/
│   │   │   │   ├── RepositorySelector.vue
│   │   │   │   ├── RepositoryCard.vue
│   │   │   │   └── RepositoryStats.vue
│   │   │   │
│   │   │   ├── plan/
│   │   │   │   ├── PlanCard.vue
│   │   │   │   ├── PlanGrid.vue
│   │   │   │   ├── PlanFilters.vue
│   │   │   │   ├── PlanSearch.vue
│   │   │   │   └── PlanBadge.vue
│   │   │   │
│   │   │   └── detail/
│   │   │       ├── PlanHeader.vue
│   │   │       ├── ObjectiveBlock.vue
│   │   │       ├── AIIntentCard.vue
│   │   │       ├── PhaseTimeline.vue
│   │   │       ├── ScopeImpactMap.vue
│   │   │       ├── TestingPanel.vue
│   │   │       ├── RolloutPanel.vue
│   │   │       ├── SuccessCriteria.vue
│   │   │       ├── NotesSection.vue
│   │   │       └── MetadataFooter.vue
│   │   │
│   │   ├── composables/                 # Vue 3 composition functions
│   │   │   ├── useTheme.ts
│   │   │   ├── useKeyboard.ts
│   │   │   ├── useFilter.ts
│   │   │   ├── useSearch.ts
│   │   │   └── useMarkdown.ts
│   │   │
│   │   ├── stores/                      # Pinia stores
│   │   │   ├── repositories.ts
│   │   │   ├── plans.ts
│   │   │   ├── filters.ts
│   │   │   └── theme.ts
│   │   │
│   │   ├── types/                       # TypeScript types
│   │   │   ├── plan.ts
│   │   │   ├── repository.ts
│   │   │   ├── manifest.ts
│   │   │   └── filters.ts
│   │   │
│   │   ├── utils/                       # Utility functions
│   │   │   ├── parsers/
│   │   │   │   ├── frontmatter.ts
│   │   │   │   ├── sections.ts
│   │   │   │   └── checkboxes.ts
│   │   │   ├── formatters/
│   │   │   │   ├── date.ts
│   │   │   │   ├── badge.ts
│   │   │   │   └── text.ts
│   │   │   └── validators/
│   │   │       ├── plan.ts
│   │   │       └── manifest.ts
│   │   │
│   │   ├── router/                      # Vue Router configuration
│   │   │   └── index.ts
│   │   │
│   │   ├── views/                       # Page-level components
│   │   │   ├── HomeView.vue             # Landing/index view
│   │   │   ├── PlanDetailView.vue       # Plan detail view
│   │   │   ├── NotFoundView.vue         # 404 page
│   │   │   └── ErrorView.vue            # Error fallback
│   │   │
│   │   ├── App.vue                      # Root component
│   │   └── main.ts                      # App entry point
│   │
│   ├── tests/                           # Test files
│   │   ├── unit/
│   │   │   ├── parsers/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   ├── component/
│   │   │   ├── plan/
│   │   │   ├── detail/
│   │   │   └── repository/
│   │   └── integration/
│   │       └── navigation.test.ts
│   │
│   ├── .env.example
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
│
├── scripts/                             # Build scripts
│   ├── discover-repositories.js         # GitHub API repo discovery
│   ├── fetch-plans.js                   # Fetch plans from repos
│   ├── parse-plans.js                   # Parse markdown files
│   ├── generate-manifests.js            # Create JSON manifests
│   └── validate-manifests.js            # Validate generated data
│
├── .gitignore
├── IDEA.md
├── IMPLEMENTATION_PLAN_TEMPLATE.md
├── MORE_SPECIFIC_PLAN.md
└── README.md
```

---

## 2. Data Layer Architecture

### 2.1 Data Flow Overview

```
GitHub API (Source Repos)
         ↓
   [Discovery Script]
         ↓
   [Fetch Script]
         ↓
   [Parse Script]
         ↓
   [Manifest Generator]
         ↓
Static JSON Files (bundled in build)
         ↓
Vite Build Process
         ↓
Vue App (runtime)
         ↓
Pinia Stores (state)
         ↓
Components (presentation)
```

### 2.2 Manifest Schema

#### repositories.json
```typescript
interface RepositoriesManifest {
  version: string;                    // Schema version
  generatedAt: string;                // ISO timestamp
  totalRepositories: number;
  repositories: Repository[];
}

interface Repository {
  id: string;                         // org/repo-name
  name: string;                       // Display name
  owner: string;
  fullName: string;                   // org/repo-name
  description?: string;
  url: string;                        // GitHub URL
  isPrivate: boolean;
  planCount: number;
  lastUpdated: string;                // ISO timestamp
  topics: string[];
  defaultBranch: string;
  manifestFile: string;               // Path to repo-specific manifest
}
```

#### {repo-id}-plans.json
```typescript
interface RepoPlansManifest {
  repository: string;                 // org/repo-name
  generatedAt: string;
  totalPlans: number;
  plans: PlanMetadata[];
}

interface PlanMetadata {
  id: string;                         // Unique identifier (repo-number)
  number: number;                     // Plan number (001, 002, etc.)
  fileName: string;                   // 001_name.md
  title: string;                      // Extracted from # header
  
  // Frontmatter
  type: PlanType;
  scope: string;
  priority: PlanPriority;
  
  // Content metadata
  objectiveExcerpt: string;           // First 200 chars
  hasCurrentState: boolean;
  proposedChangesCount: number;       // Number of change areas
  phasesCount: number;
  totalSteps: number;
  completedSteps: number;
  completionPercentage: number;
  successCriteriaCount: number;
  successCriteriaComplete: number;
  hasNotes: boolean;
  
  // Parsed sections
  objective: string;                  // Full Problem/Objective text
  currentState?: string;
  proposedChanges: ProposedChange[];
  implementationSteps: Phase[];
  testingStrategy?: string;
  rollout?: string;
  successCriteria: Criterion[];
  notes?: string;
  
  // Metadata
  sourceUrl: string;                  // GitHub file URL
  rawUrl: string;                     // Raw content URL
  createdAt?: string;                 // From git (if available)
  updatedAt?: string;                 // From git (if available)
  
  // Parsed scope data
  scopeAreas: ScopeArea[];            // For impact map
}

type PlanType = 'feature' | 'enhancement' | 'bug fix' | 'refactor' | 'chore';
type PlanPriority = 'critical' | 'high' | 'medium' | 'low';

interface ProposedChange {
  heading: string;                    // Change area name
  emoji?: string;
  what: string;
  why: string;
  how: string;
}

interface Phase {
  number: number;
  name: string;
  steps: Step[];
}

interface Step {
  text: string;
  completed: boolean;
}

interface Criterion {
  text: string;
  completed: boolean;
}

interface ScopeArea {
  name: string;                       // Extracted area name
  source: 'frontmatter' | 'heading';
  changeType?: 'add' | 'modify' | 'remove';
  mentions: number;                   // Frequency in text
}
```

### 2.3 Data Validation Rules

**Repository Validation:**
- `id` must be unique across all repositories
- `url` must be valid GitHub repository URL
- `planCount` must match actual count in manifest
- `manifestFile` must exist in build output

**Plan Validation:**
- `id` must be unique within repository
- `number` must match filename pattern `NNN_*.md`
- `type` must be one of allowed values
- `priority` must be one of allowed values
- All required frontmatter fields present
- At least one section must be non-empty
- Checkboxes parsed correctly (completion % accurate)

**Manifest Integrity:**
- Schema version must match expected version
- `generatedAt` must be valid ISO timestamp
- Cross-references between manifests must be valid
- No orphaned or missing manifest files

---

## 3. GitHub Actions Pipeline

### 3.1 Workflow Triggers

**Primary Trigger: repository_dispatch**
```yaml
on:
  repository_dispatch:
    types: [plans_updated, manual_rebuild]
```

**Manual Trigger:**
```yaml
on:
  workflow_dispatch:
    inputs:
      force_full_rebuild:
        description: 'Force rebuild all repositories'
        type: boolean
        default: false
      specific_repo:
        description: 'Only rebuild specific repo (org/name)'
        type: string
        required: false
```

**Scheduled Trigger (optional):**
```yaml
on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly Sunday 2 AM
```

### 3.2 Job Structure

```yaml
jobs:
  discover-repositories:
    name: Discover Repositories
    outputs:
      repositories: ${{ steps.discover.outputs.repositories }}
      count: ${{ steps.discover.outputs.count }}
    steps:
      - Checkout repository
      - Setup Node.js
      - Install dependencies
      - Run discovery script
      - Cache repository list
      - Output repository JSON array

  fetch-and-parse:
    name: Fetch & Parse Plans
    needs: discover-repositories
    strategy:
      matrix:
        repository: ${{ fromJson(needs.discover-repositories.outputs.repositories) }}
      max-parallel: 5
      fail-fast: false
    outputs:
      manifests: ${{ steps.parse.outputs.manifest-path }}
    steps:
      - Checkout repository
      - Setup Node.js
      - Check cache for this repo
      - Fetch plans from GitHub API
      - Parse markdown files
      - Generate repo manifest
      - Upload manifest as artifact
      - Update cache

  build-app:
    name: Build Vue Application
    needs: fetch-and-parse
    steps:
      - Checkout repository
      - Setup Node.js
      - Download all manifest artifacts
      - Combine manifests into data directory
      - Install frontend dependencies
      - Run manifest validation
      - Build Vite app
      - Upload build artifact

  deploy:
    name: Deploy to GitHub Pages
    needs: build-app
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - Download build artifact
      - Configure Pages
      - Upload Pages artifact
      - Deploy to GitHub Pages
```

### 3.3 Script Specifications

#### discover-repositories.js

**Purpose:** Query GitHub API to find repositories with implementation plans

**Inputs:**
- Environment: `GITHUB_TOKEN`, `GITHUB_ORG`, `GITHUB_TOPIC`, `DISCOVERY_MODE`
- Optional: `INCLUDE_REPOS`, `EXCLUDE_REPOS`

**Process:**
1. Authenticate with GitHub API using token
2. Based on discovery mode:
   - **Topic mode:** Search for repos with specific topic
   - **Org mode:** List all repos in organization
3. For each repo, check if `implementation-plans/` directory exists
4. Fetch repository metadata (description, topics, last updated, etc.)
5. Filter based on include/exclude lists
6. Sort by last updated (most recent first)

**Outputs:**
- JSON array of repository objects
- Count of discovered repositories
- Cache key for incremental updates

**Error Handling:**
- API rate limit exceeded: Use conditional requests, respect retry-after
- Repository access denied: Skip and log warning
- Network errors: Retry with exponential backoff (max 3 attempts)

#### fetch-plans.js

**Purpose:** Fetch implementation plan files from a specific repository

**Inputs:**
- Repository object from discovery
- GitHub API token
- Cache key (optional)

**Process:**
1. Authenticate with GitHub API
2. Use Git Trees API to list `implementation-plans/` directory
3. Filter for `*.md` files matching `NNN_*.md` pattern
4. For each file:
   - Check cache using file SHA
   - If cache miss or force rebuild, fetch raw content
   - Store content with metadata (SHA, size, path)
5. Fetch git log for files to get created/updated dates (optional)

**Outputs:**
- Array of file objects with content
- Metadata (file count, total size, SHA hashes)
- Cache update data

**Error Handling:**
- File not found: Log and skip
- Content too large (>1MB): Log warning, attempt to parse anyway
- Binary file detected: Skip with warning
- API errors: Retry with backoff

#### parse-plans.js

**Purpose:** Parse markdown files into structured data

**Inputs:**
- Array of file objects with markdown content
- Repository metadata

**Process:**
1. For each markdown file:
   - Extract frontmatter from blockquote format
   - Validate required fields (Type, Scope, Priority)
   - Parse title from `# Implementation Plan:` header
   - Extract each section by heading
   - Parse Proposed Changes into What/Why/How structure
   - Parse Implementation Steps phases and checkboxes
   - Parse Success Criteria checkboxes
   - Calculate completion percentages
   - Extract scope areas for impact map
   - Detect change types from wording (add/modify/remove)
2. Validate parsed data against schema
3. Generate unique IDs (repo-number format)
4. Create full metadata object

**Outputs:**
- Array of PlanMetadata objects
- Validation report (errors, warnings)
- Statistics (total plans, avg completion, etc.)

**Error Handling:**
- Missing frontmatter: Use defaults, log warning
- Invalid markdown structure: Best-effort parse, log errors
- Malformed checkboxes: Count as unchecked
- Parse errors: Skip plan, include in error report

#### generate-manifests.js

**Purpose:** Combine parsed data into final manifest files

**Inputs:**
- Repository list
- Parsed plan data for each repository

**Process:**
1. Create `repositories.json`:
   - Combine all repository metadata
   - Add plan counts and statistics
   - Include generation timestamp
   - Calculate totals
2. For each repository, create `{repo-id}-plans.json`:
   - Include all plan metadata
   - Sort by plan number
   - Add repository reference
   - Include generation timestamp
3. Validate all manifests against schemas
4. Generate summary report

**Outputs:**
- `repositories.json` file
- Individual repo manifest files
- Validation report
- Build statistics JSON

**Error Handling:**
- Schema validation failure: Abort with detailed error
- Duplicate IDs: Abort with conflict report
- Missing data: Log error and exclude from manifest

---

## 4. Frontend Application Architecture

### 4.1 Technology Stack Details

**Core Framework:**
- Vue 3.4+ with Composition API
- TypeScript 5.0+ (strict mode)
- Vite 5.0+ for build tooling

**UI Framework:**
- Vuetify 3.5+ (Material Design 3)
- Material Design Icons (mdi)
- Custom theme tokens for brand consistency

**State Management:**
- Pinia 2.1+ for global state
- Vue 3 `provide/inject` for component-level state
- LocalStorage for persistence (theme, filters)

**Routing:**
- Vue Router 4.2+ (history mode)
- Route-based code splitting
- Meta tags for SEO

**Data Visualization:**
- D3.js 7.8+ for force graphs
- Canvas rendering for performance
- SVG for interactive elements

**Markdown Rendering:**
- `vue-markdown-render` or `@vueuse/core` markdown composable
- Syntax highlighting with `shiki`
- Custom renderers for special elements

### 4.2 Application Bootstrap

**main.ts Flow:**
1. Create Vue app instance
2. Register Vuetify plugin with theme configuration
3. Register Pinia store
4. Register Vue Router
5. Load manifest data from bundled JSON
6. Initialize stores with manifest data
7. Set up global error handler
8. Set up performance monitoring (if needed)
9. Mount app to DOM

**Initial Data Loading:**
- Manifest files imported as modules (Vite static import)
- Data loaded synchronously during app initialization
- No loading spinners needed (data is bundled)
- Fallback to error view if manifests missing/corrupt

### 4.3 Responsive Design Breakpoints

```typescript
const breakpoints = {
  xs: 0,      // 0-599px (mobile portrait)
  sm: 600,    // 600-959px (mobile landscape, small tablet)
  md: 960,    // 960-1263px (tablet)
  lg: 1264,   // 1264-1903px (desktop)
  xl: 1904,   // 1904px+ (wide desktop)
}
```

**Layout Adaptations:**
- **xs/sm:** Single column, stacked filters, mobile nav drawer
- **md:** Two columns for plan grid, side-by-side panels
- **lg/xl:** Three columns for plan grid, full detail layout

---

## 5. Component Specifications

### 5.1 Common Components

#### AppHeader.vue

**Purpose:** Application header with navigation and controls

**Props:** None (uses global state)

**Structure:**
- App title and logo
- Repository selector (dropdown)
- Search bar (global)
- Theme toggle button
- GitHub repo link (to viewer source)

**Behavior:**
- Sticky header on scroll
- Collapses search on mobile to icon button
- Repository selector updates route and filters

**State:**
- Reads: `repositoryStore.current`, `themeStore.mode`
- Writes: `repositoryStore.selectRepository()`

#### RepositorySelector.vue

**Purpose:** Dropdown for switching repositories

**Props:** None

**Emits:**
- `change(repositoryId: string)` - Repository changed

**Structure:**
- Autocomplete dropdown (Vuetify `v-autocomplete`)
- Repository items show: name, plan count badge, private icon
- Search/filter repositories by name
- Current selection highlighted

**Features:**
- Keyboard navigation (arrow keys, enter)
- Shows loading state while switching
- Persists selection to URL query param
- Group by organization (if multi-org)

**State:**
- Reads: `repositoryStore.all`, `repositoryStore.current`
- Writes: `repositoryStore.selectRepository()`

#### ThemeToggle.vue

**Purpose:** Switch between light/dark modes

**Props:** None

**Structure:**
- Icon button (sun/moon icon)
- Tooltip indicating mode
- Smooth transition on toggle

**Behavior:**
- Cycles: system → light → dark → system
- Shows current mode in icon
- Persists to localStorage
- Applies to Vuetify theme instantly

**State:**
- Reads: `themeStore.mode`, `themeStore.systemPreference`
- Writes: `themeStore.setMode()`

### 5.2 Plan List Components

#### PlanCard.vue

**Purpose:** Compact plan preview card for grid view

**Props:**
```typescript
{
  plan: PlanMetadata;
  compact?: boolean;
}
```

**Emits:**
- `click` - Card clicked

**Structure:**
```
┌─────────────────────────────────┐
│ #001                  [TYPE]     │ ← Number + Type badge
│ Plan Title Here                  │ ← Title
│ ─────────────────────────────    │
│ Objective excerpt text...        │ ← Excerpt (2 lines)
│                                  │
│ [Scope] [Priority]  ●●●○○ 60%   │ ← Badges + Progress
│ Repository Name    2024-04-04   │ ← Repo + Date
└─────────────────────────────────┘
```

**Features:**
- Hover elevation effect
- Color-coded border by type
- Progress bar for completion
- Truncate long titles/excerpts
- Responsive sizing

**State:**
- Read-only (props)

#### PlanFilters.vue

**Purpose:** Filter controls for plan list

**Props:** None

**Emits:**
- `update:filters` - Filters changed

**Structure:**
- Type chips (feature, bug, refactor, etc.)
- Priority chips (critical, high, medium, low)
- Scope autocomplete (extracted from all plans)
- Completion range slider (0-100%)
- Clear filters button

**Behavior:**
- Multiple selections allowed (OR logic within category)
- AND logic between categories
- Updates URL query params
- Shows active filter count badge
- Persists to session storage

**State:**
- Reads: `filterStore.types`, `filterStore.priorities`, etc.
- Writes: `filterStore.setFilters()`

#### PlanSearch.vue

**Purpose:** Full-text search across plans

**Props:** None

**Emits:**
- `update:query` - Search query changed

**Structure:**
- Search input with icon
- Debounced input (300ms)
- Clear button
- Result count display
- Keyboard shortcut hint (/)

**Behavior:**
- Focuses on `/` keypress
- Searches: title, objective, scope, change areas
- Case-insensitive
- Highlights matches in results
- Updates URL query param

**State:**
- Reads: `searchStore.query`
- Writes: `searchStore.setQuery()`

### 5.3 Plan Detail Components

#### PlanHeader.vue

**Purpose:** Detail view header section

**Props:**
```typescript
{
  plan: PlanMetadata;
  repository: Repository;
}
```

**Structure:**
```
┌────────────────────────────────────────────────┐
│ ← Back to Index          [Dark Mode] [GitHub] │
│                                                │
│ Repository Name › #001                         │
│                                                │
│ Implementation Plan: Title Here                │
│                                                │
│ [TYPE] [PRIORITY] [SCOPE] [SCOPE]             │
└────────────────────────────────────────────────┘
```

**Features:**
- Breadcrumb navigation
- Repository link badge
- Badge colors match theme
- Copy link button
- GitHub file link

#### ObjectiveBlock.vue

**Purpose:** Render Problem/Objective section

**Props:**
```typescript
{
  objective: string;
  currentState?: string;
}
```

**Structure:**
- Heading: "Problem / Objective"
- Rendered markdown content
- Subtle background panel
- Optional "Current State" subsection below

**Features:**
- Markdown rendering with proper styling
- Code blocks with syntax highlighting
- Links open in new tab

#### AIIntentCard.vue

**Purpose:** Single Proposed Change card

**Props:**
```typescript
{
  change: ProposedChange;
  index: number;
}
```

**Structure:**
```
┌─────────────────────────────────────┐
│ 1. Change Area Name 🚀              │ ← Heading
│ ─────────────────────────────────   │
│ │ What                              │ ← Expandable
│ │ Description of what...            │
│ │                                   │
│ │ Why                               │
│ │ Reason this is needed...          │
│ │                                   │
│ │ How                               │
│ │ Technical approach...             │
└─────────────────────────────────────┘
```

**Features:**
- Vuetify expansion panel
- Three-column layout on desktop
- Stacked on mobile
- Markdown in each section
- Auto-expand first card

#### PhaseTimeline.vue

**Purpose:** Visual timeline of implementation phases

**Props:**
```typescript
{
  phases: Phase[];
}
```

**Structure (Desktop):**
```
Phase 1          Phase 2          Phase 3
  ●                ●                ○
  │                │                │
[✓] Step A      [✓] Step C      [ ] Step E
[✓] Step B      [ ] Step D      [ ] Step F
```

**Structure (Mobile):**
```
● Phase 1 (2/2 complete)
  ✓ Step A
  ✓ Step B

○ Phase 2 (1/2 complete)
  ✓ Step C
  ☐ Step D
```

**Features:**
- Horizontal timeline on desktop
- Vertical on mobile
- Color-coded phase dots (complete/partial/pending)
- Checkbox icons for steps
- Percentage per phase
- Click phase to jump to that section (if detail exists)

#### ScopeImpactMap.vue

**Purpose:** D3 force-directed graph of affected areas

**Props:**
```typescript
{
  scopeAreas: ScopeArea[];
  planTitle?: string;
}
```

**Structure:**
- SVG canvas (full width, fixed height)
- Central plan node
- Surrounding area nodes
- Links connecting them
- Legend (change types)
- Zoom controls

**Features:**
- Force simulation with:
  - Charge force (repulsion)
  - Link force (attraction)
  - Collision detection
  - Center force
- Node sizing by mention frequency
- Color by change type (add/modify/remove)
- Hover tooltip with details
- Click to highlight connections
- Drag to reposition
- Zoom and pan

**Technical Details:**
- Use D3 force simulation
- Render with SVG (not canvas, for accessibility)
- Debounce resize events
- Cleanup simulation on unmount

#### SuccessCriteria.vue

**Purpose:** Checklist with progress visualization

**Props:**
```typescript
{
  criteria: Criterion[];
}
```

**Structure:**
```
Success Criteria (4/7 complete) [========>   ] 57%

☑ Criterion 1 text here
☑ Criterion 2 text here
☐ Criterion 3 text here
☑ Criterion 4 text here
```

**Features:**
- Progress bar with percentage
- Vuetify checkboxes (read-only)
- Markdown in criterion text
- Highlight completed vs pending
- Celebrate on 100% (confetti animation optional)

### 5.4 Layout Components

#### HomeView.vue (Index Page)

**Route:** `/` and `/:repoId?`

**Structure:**
```
┌──────────────────────────────────────┐
│ AppHeader                            │
├──────────────────────────────────────┤
│ [Repository Selector ▼]             │
│ [Search...] [Filters]               │
├──────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐             │
│ │Plan │ │Plan │ │Plan │   (Grid)    │
│ │ #1  │ │ #2  │ │ #3  │             │
│ └─────┘ └─────┘ └─────┘             │
│ ┌─────┐ ┌─────┐                     │
│ │Plan │ │Plan │                     │
│ │ #4  │ │ #5  │                     │
│ └─────┘ └─────┘                     │
├──────────────────────────────────────┤
│ AppFooter                            │
└──────────────────────────────────────┘
```

**Features:**
- Load repository from URL param
- Apply filters from URL query
- Infinite scroll or pagination
- Empty state if no plans
- Loading skeleton on repository switch

#### PlanDetailView.vue

**Route:** `/:repoId/:planId`

**Structure:**
```
┌──────────────────────────────────────┐
│ PlanHeader                           │
├──────────────────────────────────────┤
│ ObjectiveBlock                       │
├──────────────────────────────────────┤
│ ┌──────────────┐ ┌─────────────┐    │
│ │ AI Intent    │ │ Scope Map   │    │
│ │ Cards        │ │             │    │
│ └──────────────┘ └─────────────┘    │
├──────────────────────────────────────┤
│ PhaseTimeline                        │
├──────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐           │
│ │ Testing  │ │ Rollout  │           │
│ └──────────┘ └──────────┘           │
├──────────────────────────────────────┤
│ SuccessCriteria                      │
├──────────────────────────────────────┤
│ NotesSection (collapsed)             │
├──────────────────────────────────────┤
│ MetadataFooter                       │
├──────────────────────────────────────┤
│ Navigation: [← Prev] [Next →]       │
└──────────────────────────────────────┘
```

**Features:**
- Load plan from URL params
- 404 if plan not found
- Keyboard nav to prev/next plan
- Scroll-to-section links
- Share button (copies URL)
- Print-friendly CSS

---

## 6. State Management

### 6.1 Pinia Stores

#### repositoryStore.ts

**State:**
```typescript
{
  all: Repository[];              // All discovered repos
  current: Repository | null;     // Selected repo
  loading: boolean;
  error: string | null;
}
```

**Getters:**
```typescript
{
  currentId: (state) => state.current?.id,
  repoById: (state) => (id: string) => Repository | undefined,
  sortedByPlanCount: (state) => Repository[],
  privateRepos: (state) => Repository[],
  publicRepos: (state) => Repository[],
}
```

**Actions:**
```typescript
{
  loadRepositories(manifest: RepositoriesManifest),
  selectRepository(id: string),
  selectRepositoryByName(fullName: string),
  clearSelection(),
}
```

#### planStore.ts

**State:**
```typescript
{
  byRepository: Map<string, PlanMetadata[]>,  // Keyed by repo ID
  currentPlan: PlanMetadata | null,
  loading: boolean,
  error: string | null,
}
```

**Getters:**
```typescript
{
  plansForCurrentRepo: (state) => PlanMetadata[],
  planById: (state) => (repoId: string, planId: string) => PlanMetadata | undefined,
  totalPlans: (state) => number,
  plansSortedByNumber: (state) => PlanMetadata[],
  plansGroupedByType: (state) => Record<PlanType, PlanMetadata[]>,
}
```

**Actions:**
```typescript
{
  loadPlans(repoId: string, manifest: RepoPlansManifest),
  loadAllPlans(manifests: Map<string, RepoPlansManifest>),
  selectPlan(repoId: string, planId: string),
  getNextPlan(currentId: string): PlanMetadata | null,
  getPrevPlan(currentId: string): PlanMetadata | null,
}
```

#### filterStore.ts

**State:**
```typescript
{
  types: PlanType[];                  // Selected types
  priorities: PlanPriority[];         // Selected priorities
  scopes: string[];                   // Selected scope tags
  completionMin: number;              // 0-100
  completionMax: number;              // 0-100
  searchQuery: string;
}
```

**Getters:**
```typescript
{
  hasActiveFilters: (state) => boolean,
  activeFilterCount: (state) => number,
  filterFunction: (state) => (plan: PlanMetadata) => boolean,
}
```

**Actions:**
```typescript
{
  setTypes(types: PlanType[]),
  setPriorities(priorities: PlanPriority[]),
  setScopes(scopes: string[]),
  setCompletionRange(min: number, max: number),
  setSearchQuery(query: string),
  clearFilters(),
  applyFromUrlQuery(query: URLSearchParams),
  toUrlQuery(): URLSearchParams,
}
```

#### themeStore.ts

**State:**
```typescript
{
  mode: 'system' | 'light' | 'dark',
  systemPreference: 'light' | 'dark',
}
```

**Getters:**
```typescript
{
  effectiveTheme: (state) => 'light' | 'dark',  // Resolves 'system' to actual
  isDark: (state) => boolean,
}
```

**Actions:**
```typescript
{
  setMode(mode: 'system' | 'light' | 'dark'),
  toggleMode(),
  detectSystemPreference(),
  loadFromStorage(),
  saveToStorage(),
}
```

### 6.2 State Persistence

**LocalStorage Keys:**
- `impl-viewer-theme`: Theme mode
- `impl-viewer-filters`: Active filters (JSON)
- `impl-viewer-last-repo`: Last selected repository

**URL State:**
- Repository: `/:repoId` (route param)
- Plan: `/:repoId/:planId` (route param)
- Filters: `?type=feature&priority=high` (query params)
- Search: `?q=authentication` (query param)

---

## 7. Routing & Navigation

### 7.1 Route Definitions

```typescript
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Implementation Plan Viewer' },
  },
  {
    path: '/:repoId',
    name: 'repository',
    component: HomeView,
    meta: { title: 'Plans - :repoId' },
  },
  {
    path: '/:repoId/:planId',
    name: 'plan-detail',
    component: PlanDetailView,
    meta: { title: 'Plan :planId - :repoId' },
  },
  {
    path: '/404',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Not Found' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]
```

### 7.2 Navigation Guards

**Before Each Route:**
```typescript
router.beforeEach((to, from, next) => {
  // Validate repository exists
  if (to.params.repoId) {
    const repo = repositoryStore.repoById(to.params.repoId);
    if (!repo) {
      next('/404');
      return;
    }
  }
  
  // Validate plan exists
  if (to.params.planId) {
    const plan = planStore.planById(to.params.repoId, to.params.planId);
    if (!plan) {
      next('/404');
      return;
    }
  }
  
  // Update document title
  document.title = resolveTitle(to);
  
  next();
});
```

**After Each Route:**
```typescript
router.afterEach(() => {
  // Scroll to top
  window.scrollTo(0, 0);
  
  // Track page view (if analytics enabled)
  // analytics.pageView(to.path);
});
```

### 7.3 Link Sharing

**Generated URLs:**
- Home: `https://yourorg.github.io/ImplPlanViewer/`
- Repository: `https://yourorg.github.io/ImplPlanViewer/my-org/my-repo`
- Plan: `https://yourorg.github.io/ImplPlanViewer/my-org/my-repo/001`
- With filters: `https://yourorg.github.io/ImplPlanViewer/my-org/my-repo?type=feature&priority=high`

---

## 8. Markdown Processing

### 8.1 Frontmatter Parsing

**Input Format (Blockquote):**
```markdown
> **Type:** `feature`
> **Scope:** authentication module
> **Priority:** `high`
```

**Parser Logic:**
1. Extract lines starting with `>`
2. Match pattern: `> **{Key}:** {value}`
3. Handle backtick-wrapped values: `` `value` ``
4. Trim whitespace
5. Validate against allowed values
6. Default fallbacks if missing

**Allowed Values:**
```typescript
const ALLOWED_TYPES = ['feature', 'enhancement', 'bug fix', 'refactor', 'chore'];
const ALLOWED_PRIORITIES = ['critical', 'high', 'medium', 'low'];
```

### 8.2 Section Extraction

**Section Headers:**
- `## Problem / Objective`
- `## Current State`
- `## Proposed Changes`
- `## Implementation Steps`
- `## Testing Strategy`
- `## Rollout`
- `## Success Criteria`
- `## Notes`

**Extraction Algorithm:**
1. Split markdown by `##` headers
2. Match header text (case-insensitive, flexible spacing)
3. Content = text until next `##` or EOF
4. Trim leading/trailing whitespace
5. Store in structured object

### 8.3 Proposed Changes Parsing

**Input Format:**
```markdown
## Proposed Changes

### 1. Authentication Module 🔐

- **What:** Add JWT-based authentication
- **Why:** Current session-based auth doesn't scale
- **How:** Use passport.js with JWT strategy
```

**Parser Logic:**
1. Find all `### N. [Name]` headings
2. Extract number, name, optional emoji
3. Extract text between heading and next `###`
4. Match bullet pattern: `- **{Key}:** {text}`
5. Group into What/Why/How structure
6. Support multi-line values

### 8.4 Checkbox Parsing

**Patterns:**
- Unchecked: `- [ ]`, `- []`, `* [ ]`
- Checked: `- [x]`, `- [X]`, `* [x]`

**Parser Logic:**
1. Match regex: `^[\s]*[-*]\s*\[([ xX])\]\s*(.+)$`
2. Group 1: checkbox state
3. Group 2: step text
4. Track completion count
5. Calculate percentage

### 8.5 Rendering Configuration

**Markdown Library Settings:**
```typescript
{
  breaks: true,              // Convert \n to <br>
  linkify: true,             // Auto-link URLs
  typographer: true,         // Smart quotes
  html: false,               // Disable raw HTML (security)
  
  highlight: (code, lang) => {
    return shiki.codeToHtml(code, { lang, theme: 'github-dark' });
  },
  
  // Custom renderer for links
  renderers: {
    link: ({ href, text }) => {
      return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
    }
  }
}
```

---

## 9. D3.js Visualization

### 9.1 Force Simulation Configuration

**Forces:**
```typescript
{
  charge: d3.forceManyBody()
    .strength(-100)           // Repulsion between nodes
    .distanceMax(300),
  
  link: d3.forceLink()
    .id(d => d.id)
    .distance(50)             // Target link length
    .strength(0.5),
  
  collision: d3.forceCollide()
    .radius(d => d.radius + 5)  // Node radius + padding
    .iterations(2),
  
  center: d3.forceCenter()
    .x(width / 2)
    .y(height / 2),
  
  x: d3.forceX(width / 2)
    .strength(0.05),          // Weak centering force
  
  y: d3.forceY(height / 2)
    .strength(0.05),
}
```

### 9.2 Node Structure

**Node Data:**
```typescript
interface GraphNode {
  id: string;                 // Unique identifier
  label: string;              // Display name
  type: 'plan' | 'area';      // Node type
  changeType?: 'add' | 'modify' | 'remove';
  mentions: number;           // Frequency in text
  radius: number;             // Calculated size
  x?: number;                 // D3 position
  y?: number;
  fx?: number;                // Fixed position (drag)
  fy?: number;
}
```

**Node Sizing:**
```typescript
const radiusScale = d3.scaleSqrt()
  .domain([1, d3.max(nodes, d => d.mentions)])
  .range([10, 40]);
```

**Node Colors:**
```typescript
const colorScale = {
  'plan': '#2196F3',          // Blue
  'add': '#4CAF50',           // Green
  'modify': '#FF9800',        // Orange
  'remove': '#F44336',        // Red
  'default': '#9E9E9E',       // Gray
}
```

### 9.3 Link Structure

**Link Data:**
```typescript
interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;              // Weight/strength
}
```

**Link Creation:**
- Connect plan node to all area nodes
- No area-to-area links (star topology)
- Link opacity based on mention frequency

### 9.4 Interactivity

**Drag Behavior:**
```typescript
const drag = d3.drag()
  .on('start', (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  })
  .on('drag', (event, d) => {
    d.fx = event.x;
    d.fy = event.y;
  })
  .on('end', (event, d) => {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  });
```

**Zoom Behavior:**
```typescript
const zoom = d3.zoom()
  .scaleExtent([0.5, 3])      // Min/max zoom
  .on('zoom', (event) => {
    g.attr('transform', event.transform);
  });
```

**Hover Tooltips:**
- Show on node hover
- Display: label, type, mention count
- Position near cursor
- Fade in/out transitions

### 9.5 Responsive Behavior

**Resize Handling:**
```typescript
const resizeObserver = new ResizeObserver(() => {
  const container = svgRef.value;
  const { width, height } = container.getBoundingClientRect();
  
  svg.attr('width', width).attr('height', height);
  
  simulation
    .force('center', d3.forceCenter(width / 2, height / 2))
    .alpha(0.3)
    .restart();
});
```

**Mobile Optimizations:**
- Larger tap targets (min 44px)
- Simplified layout (fewer nodes visible)
- Disable zoom on small screens
- Pinch-to-zoom support

---

## 10. Theming System

### 10.1 Vuetify Theme Configuration

**Light Theme:**
```typescript
{
  dark: false,
  colors: {
    primary: '#2196F3',       // Blue
    secondary: '#FF9800',     // Orange
    accent: '#4CAF50',        // Green
    error: '#F44336',         // Red
    warning: '#FF9800',       // Orange
    info: '#2196F3',          // Blue
    success: '#4CAF50',       // Green
    
    background: '#FFFFFF',
    surface: '#FAFAFA',
    
    // Plan type colors
    'plan-feature': '#2196F3',
    'plan-enhancement': '#9C27B0',
    'plan-bug': '#F44336',
    'plan-refactor': '#FF9800',
    'plan-chore': '#9E9E9E',
    
    // Priority colors
    'priority-critical': '#F44336',
    'priority-high': '#FF9800',
    'priority-medium': '#2196F3',
    'priority-low': '#9E9E9E',
  }
}
```

**Dark Theme:**
```typescript
{
  dark: true,
  colors: {
    primary: '#42A5F5',
    secondary: '#FFA726',
    accent: '#66BB6A',
    error: '#EF5350',
    warning: '#FFA726',
    info: '#42A5F5',
    success: '#66BB6A',
    
    background: '#121212',
    surface: '#1E1E1E',
    
    // Same plan/priority colors (adjusted lightness)
    'plan-feature': '#42A5F5',
    'plan-enhancement': '#AB47BC',
    'plan-bug': '#EF5350',
    'plan-refactor': '#FFA726',
    'plan-chore': '#BDBDBD',
    
    'priority-critical': '#EF5350',
    'priority-high': '#FFA726',
    'priority-medium': '#42A5F5',
    'priority-low': '#BDBDBD',
  }
}
```

### 10.2 CSS Custom Properties

**Define in :root:**
```css
:root {
  /* Typography */
  --font-family-base: 'Roboto', sans-serif;
  --font-family-mono: 'Roboto Mono', monospace;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Borders */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
  
  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.15);
  --shadow-lg: 0 8px 16px rgba(0,0,0,0.2);
}
```

### 10.3 Theme Switching Logic

**Detection:**
```typescript
const detectSystemPreference = () => {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'light';
};

// Listen for system changes
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    if (themeStore.mode === 'system') {
      themeStore.systemPreference = e.matches ? 'dark' : 'light';
    }
  });
```

**Application:**
```typescript
const applyTheme = (theme: 'light' | 'dark') => {
  vuetify.theme.global.name.value = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
};
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

**Parser Tests (`tests/unit/parsers/`):**
- Frontmatter extraction with various formats
- Section extraction with edge cases
- Checkbox parsing with different syntaxes
- Scope area extraction
- Change type detection

**Store Tests (`tests/unit/stores/`):**
- Repository selection and filtering
- Plan loading and retrieval
- Filter application logic
- Theme persistence
- State mutations

**Utility Tests (`tests/unit/utils/`):**
- Date formatting
- Text truncation
- Badge color assignment
- Validation functions

### 11.2 Component Tests

**Plan Component Tests (`tests/component/plan/`):**
- PlanCard renders correctly
- PlanCard handles missing data
- PlanFilters updates filters
- PlanSearch debounces input

**Detail Component Tests (`tests/component/detail/`):**
- PhaseTimeline calculates progress
- ScopeImpactMap creates nodes
- SuccessCriteria renders checkboxes
- AIIntentCard expands/collapses

**Repository Tests (`tests/component/repository/`):**
- RepositorySelector shows repos
- RepositorySelector filters by search
- RepositoryCard displays metadata

### 11.3 Integration Tests

**Navigation Tests:**
- Routing between views
- URL persistence
- Back/forward navigation
- Deep linking to plans

**Filter Tests:**
- Multiple filter combinations
- URL sync with filters
- Clear filters resets state

**Theme Tests:**
- Theme toggle cycles modes
- System preference updates
- Theme persists across reloads

### 11.4 Test Data

**Mock Manifests:**
- `repositories.mock.json` - 5 test repositories
- `repo-a-plans.mock.json` - 10 test plans
- `repo-b-plans.mock.json` - 5 test plans

**Test Utilities:**
- `createMockRepository(overrides)`
- `createMockPlan(overrides)`
- `mockManifestData()`

### 11.5 Coverage Goals

- Overall: 80%
- Parsers: 90% (critical path)
- Stores: 85%
- Components: 75%
- Utilities: 90%

---

## 12. Build & Deployment

### 12.1 Vite Configuration

**Build Settings:**
```typescript
{
  base: '/ImplPlanViewer/',   // GitHub Pages subpath
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['vuetify'],
          'd3-vendor': ['d3'],
        }
      }
    },
    
    chunkSizeWarningLimit: 1000,
  },
  
  optimizeDeps: {
    include: ['vue', 'vuetify', 'd3'],
  },
}
```

### 12.2 Asset Handling

**Manifest Files:**
- Imported as static JSON modules
- Bundled into `dist/assets/`
- Hashed filenames for cache busting
- Preloaded in index.html

**Images/Icons:**
- SVG icons preferred (Material Design Icons)
- Optimize with SVGO
- Inline small icons (<10KB)

### 12.3 GitHub Pages Deployment

**Pages Settings:**
- Source: GitHub Actions
- Branch: Not applicable (Actions deploy)
- Custom domain: Optional

**Deploy Action:**
```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v2
  with:
    path: ./plan-viewer/dist

- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v3
```

### 12.4 Performance Optimization

**Code Splitting:**
- Route-based lazy loading
- Component lazy loading (detail view components)
- Vendor chunking (Vue, Vuetify, D3 separate)

**Bundle Analysis:**
- Run `vite-bundle-visualizer` on builds
- Target: <500KB initial bundle
- Target: <200KB per route chunk

**Caching Strategy:**
- Manifest files: Cache with version key
- Static assets: Aggressive caching (hashed filenames)
- HTML: No cache (revalidate)

### 12.5 CI/CD Pipeline Summary

**Trigger Events:**
1. Repository dispatch from source repo
2. Manual workflow dispatch
3. Scheduled weekly rebuild

**Pipeline Steps:**
1. Discover repositories (5-10 seconds)
2. Fetch and parse plans (parallel, 1-2 minutes per 10 repos)
3. Generate manifests (10-20 seconds)
4. Build Vue app (1-2 minutes)
5. Deploy to Pages (30 seconds)

**Total Time:** 3-5 minutes for 10 repositories

**Caching:**
- Node modules cache
- Repository discovery cache (1 hour TTL)
- Plan content cache (by SHA)

---

## 13. Error Handling & Edge Cases

### 13.1 Data Validation

**Repository Level:**
- Missing `implementation-plans/` directory → Skip repo, log warning
- Empty directory → Include repo with 0 plans
- Invalid repository access → Skip, include in error report

**Plan Level:**
- Missing frontmatter → Use defaults, log warning
- Invalid type/priority → Use 'unknown', flag in UI
- Malformed markdown → Best-effort parse, show errors in detail view
- Missing required sections → Show placeholder in UI
- Empty sections → Hide from UI

### 13.2 UI Error States

**Repository Selector:**
- No repositories found → Show message with setup instructions
- All repositories failed to load → Error message with retry button

**Plan List:**
- No plans in repository → Empty state with encouragement message
- All plans filtered out → "No results" with clear filters button
- Load error → Error banner with reload option

**Plan Detail:**
- Plan not found → 404 view with link to index
- Parse error → Show raw markdown fallback
- Scope map no nodes → Hide map, show message

### 13.3 Network Resilience

**GitHub API:**
- Rate limit handling with exponential backoff
- Conditional requests with ETags
- Timeout after 30 seconds
- Retry failed requests (max 3 attempts)

**Build Pipeline:**
- Continue on repo fetch failure (don't fail entire build)
- Aggregate errors in summary report
- Always deploy (even with partial data)

### 13.4 Browser Compatibility

**Minimum Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Fallbacks:**
- No SVG support → Text-only scope areas
- No localStorage → In-memory theme/filters
- No matchMedia → Default light theme

---

## 14. Future Enhancements (Out of Scope for MVP)

### 14.1 Advanced Features

**Plan Analytics:**
- Most viewed plans
- Average completion rate per repository
- Common scope areas across repos
- Implementation velocity metrics

**Git Integration:**
- Link plans to implementing commits
- Show commit timeline on plan detail
- Detect plan completion from git history

**Collaboration Features:**
- Comments via GitHub Discussions API
- Plan status updates
- Team assignments

**AI Insights:**
- Detect duplicate/similar plans
- Suggest related plans
- Auto-categorize by scope

### 14.2 Technical Improvements

**Performance:**
- Virtual scrolling for large plan lists
- Service worker for offline support
- Progressive web app (PWA)

**Developer Experience:**
- CLI for local development with mock data
- Storybook for component library
- Visual regression testing

**Accessibility:**
- WCAG 2.1 AA compliance audit
- Screen reader optimization
- Keyboard navigation improvements
- High contrast mode

---

## 15. Open Questions & Decisions Needed

### 15.1 Technical Decisions

- [ ] Should we support YAML frontmatter in addition to blockquote format?
- [ ] Max number of repositories to support (scaling limits)?
- [ ] Should scope map be interactive (clickable to filter plans) or view-only?
- [ ] Pre-render content for SEO (SSG) or client-side only?
- [ ] Support for plan versioning/history?

### 15.2 UX Decisions

- [ ] Default sort order for plan list (number, date, or priority)?
- [ ] Should filters be OR or AND within same category?
- [ ] Enable plan comparison view (side-by-side)?
- [ ] Allow users to bookmark/favorite plans?
- [ ] Show/hide completed plans toggle?

### 15.3 Design Decisions

- [ ] Use Material Design strictly or customize?
- [ ] Icon set (MDI, Font Awesome, custom)?
- [ ] Animation intensity (subtle vs. prominent)?
- [ ] Mobile-first or desktop-first approach?
- [ ] Support for custom repository branding (colors, logos)?

---

## 16. Success Metrics

### 16.1 Performance Metrics

- [ ] Initial page load: <2s (3G connection)
- [ ] Time to interactive: <3s
- [ ] Plan detail view render: <300ms
- [ ] Search results: <100ms latency
- [ ] Lighthouse score: >90 (Performance, Accessibility, Best Practices)

### 16.2 Functional Metrics

- [ ] Successfully aggregates from 10+ repositories
- [ ] Handles 100+ plans per repository
- [ ] Zero crashes in 1 hour of continuous use
- [ ] All filters work with 1000+ total plans
- [ ] Theme switching works in all views

### 16.3 Code Quality Metrics

- [ ] Test coverage >80%
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] Bundle size <500KB (initial)
- [ ] Build time <5 minutes (50 repos)

---

## Conclusion

This specification provides a comprehensive blueprint for implementing the Implementation Plan Viewer. Each section can be tackled independently while maintaining consistency with the overall architecture. The modular design allows for incremental development and testing at each phase.

**Next Steps:**
1. Review and approve this specification
2. Set up project scaffolding (Vite, Vue, TypeScript)
3. Implement Phase 1: GitHub Actions pipeline
4. Develop Phase 2: Core Vue application structure
5. Build Phase 3: Component library
6. Integrate Phase 4: D3 visualizations
7. Polish Phase 5: Theming and UX refinements
8. Test Phase 6: Comprehensive testing
9. Deploy and monitor

**Estimated Timeline:**
- Phase 1: 1 week
- Phase 2: 1 week
- Phase 3: 2 weeks
- Phase 4: 1 week
- Phase 5: 1 week
- Phase 6: 1 week
- **Total: 7 weeks** (with buffer for iterations and refinements)
