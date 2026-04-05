# Implementation Plan: Centralized Multi-Repository Plan Viewer

> **Type:** `feature`
> **Scope:** Cross-repository plan aggregation, GitHub Pages, static site with API integration
> **Priority:** `high`

---

## Problem / Objective

AI-generated implementation plans sit as raw markdown files scattered across multiple repositories — useful for agents and developers, but invisible and impossible to browse holistically. When managing multiple AI-assisted projects, there's no unified view of what's being planned, built, or completed across the organization. The goal is a centralized GitHub Pages dashboard that automatically discovers and aggregates implementation plans from any repository, visualizes their structure and progress, and provides cross-repository insights. Anyone opening the site should immediately understand the planning landscape across all projects without manually searching through individual repositories.

---

## Current State

- Multiple repositories across the organization contain implementation plans in `implementation-plans/` directories
- Each plan follows a consistent template structure (Type, Scope, Priority, Problem, Current State, Proposed Changes, Implementation Steps, Testing Strategy, Rollout, Success Criteria, Notes)
- Plans are named `NNN_descriptive_name.md` (e.g., `001_add_auth.md`)
- No centralized viewer exists — plans are scattered and hard to discover
- No cross-repository insights or comparison capabilities
- No automatic aggregation or synchronization mechanism
- Plans are only readable by browsing individual repositories manually

---

## Proposed Changes

### 1. Centralized Viewer Repository Structure

- **What:** A dedicated `ImplPlanViewer` repository containing the Vue/Vite app in `plan-viewer/` directory
- **Why:** This repo hosts the viewer independently from source projects, allowing it to aggregate plans from multiple repositories
- **How:** Vite + Vue 3 + TypeScript with Vuetify (Material Design 3). GitHub Actions builds the static site and deploys to GitHub Pages. No implementation plans stored in this repo — all data is fetched from source repositories.

### 2. Repository Discovery & Manifest Generation

- **What:** Automatic discovery of repositories containing implementation plans and generation of per-repository manifests
- **Why:** The viewer needs to know which repositories have plans and what plans exist in each, without manual configuration
- **How:** 
  - **Discovery**: GitHub Actions scans for repositories by organization or topic tag (`impl-plan-viewer`)
  - **Fetching**: Uses GitHub API to fetch plan files from discovered repos (supports both public and private with PAT)
  - **Parsing**: Extracts frontmatter metadata (type, scope, priority) and content sections from each markdown file
  - **Manifest Generation**: Creates JSON files per repository listing all plans with metadata
  - **Build-time Bundling**: All plan data is fetched and bundled during build, resulting in a fully static site with no runtime API calls

### 3. Repository Selector & Plan Index View

- **What:** Landing page with repository dropdown selector and plan cards grid
- **Why:** Users need to switch between repositories and see all plans from selected repo at a glance
- **How:** 
  - **Repository Selector**: Dropdown showing all discovered repositories with plan counts
  - **Plan Cards**: Grid layout showing plans from selected repository
  - Each card displays: plan number, title, type badge (color-coded), priority badge, scope tags, objective excerpt
  - **Filters**: By type (feature/bug/refactor/enhancement/chore), priority (critical/high/medium/low), scope
  - **Search**: Full-text search across titles and objectives
  - **Sort**: By date, priority, completion percentage, or number
  - Clicking a card opens the detail view with URL persistence

### 4. Plan Detail View

- **What:** Full rendered view of a single plan with structured visual sections
- **Why:** Raw markdown loses hierarchy; a visual layout makes the AI's intent scannable
- **How:**
  - **Header band:** Repository badge, plan number, title, type/priority/scope badges
  - **Objective block:** Rendered problem/objective paragraph with highlighted background
  - **Scope Impact Map:** D3.js force-directed graph showing project areas affected (nodes from Scope field + Proposed Changes headings), colored by change density and type
  - **AI Intent Summary:** "Proposed Changes" section rendered as expandable Material Design cards, each showing What/Why/How in structured layout
  - **Phase Progress Timeline:** "Implementation Steps" rendered as horizontal timeline with checkbox completion tracking per phase
  - **Testing & Rollout strip:** Side-by-side Vuetify cards for Testing Strategy and Rollout sections
  - **Success Criteria checklist:** Visual checklist with completion percentage progress bar
  - **Notes:** Collapsible expansion panel at bottom
  - **Metadata footer:** Source repository link, file path, last updated timestamp

### 5. Scope Impact Map

- **What:** Interactive D3.js force-directed graph visualization showing project areas affected by a plan
- **Why:** At a glance, readers should see "this plan touches the CI pipeline and the auth module" without reading prose. Force-directed graphs reveal relationships between areas.
- **How:** 
  - Parse the `Scope` frontmatter field and `### N. [Change Area]` headings from Proposed Changes
  - Extract file paths, module names, and system components mentioned
  - Create nodes for each unique area, edges for co-occurrence in same plan
  - D3.js force simulation with collision detection and link forces
  - Node size reflects change density (how many modifications in that area)
  - Color coding by change type: green (add), blue (modify), red (remove) — inferred from section wording
  - Interactive: hover for details, click to filter related sections, drag to reposition

### 6. Webhook-Triggered GitHub Actions Pipeline

- **What:** Automated build and deployment triggered by source repositories when their plans change
- **Why:** Plans are maintained in source repos; the viewer must rebuild automatically when any repo updates its plans
- **How:**
  - **Source Repo Webhook**: Each source repository has a workflow that sends `repository_dispatch` event to ImplPlanViewer when `implementation-plans/**` changes
  - **Viewer Workflow** (`.github/workflows/build-and-deploy.yml`):
    1. Triggered by `repository_dispatch` or manual dispatch
    2. **Discovery phase**: Query GitHub API for repos by org/topic tag
    3. **Fetch phase**: For each discovered repo, fetch all files from `implementation-plans/` directory
    4. **Parse phase**: Extract metadata and content from markdown files
    5. **Manifest generation**: Create `repositories.json` + per-repo plan manifests
    6. **Build phase**: Run `vite build` with manifests bundled as static assets
    7. **Deploy phase**: Push built site to GitHub Pages via `actions/deploy-pages`
  - **Authentication**: Uses GitHub PAT secret for accessing private repositories
  - **Caching**: Cache discovered repo list and manifests, only re-fetch changed repos

### 7. Source Repository Integration

- **What:** Setup required in each source repository to participate in the viewer
- **Why:** Source repos need to notify the viewer when plans change and be discoverable
- **How:**
  - **Directory structure**: Create `implementation-plans/` folder with `NNN_name.md` files
  - **Repository topic**: Add `impl-plan-viewer` topic tag for discovery (or ensure repo is in configured org)
  - **Notification workflow**: Add `.github/workflows/notify-plan-viewer.yml` that triggers on push to `implementation-plans/**` and sends repository_dispatch
  - **Secret configuration**: Add `PLAN_VIEWER_TOKEN` secret (PAT with `repo` scope to dispatch to viewer repo)
  - **Optional**: Add `.impl-plan-viewer.yml` config file for repo-specific settings (display name, icon, category)

---

## Implementation Steps

1. **Phase 1: Repository Structure + GitHub Actions Foundation**
   - [ ] Initialize Vite + Vue 3 + TypeScript project in `plan-viewer/`
   - [ ] Set up Vuetify 3 and Pinia state management
   - [ ] Configure Vitest for testing
   - [ ] Create `.github/workflows/build-and-deploy.yml` workflow
   - [ ] Implement repository discovery logic (GitHub API query by org/topic)
   - [ ] Implement plan fetching from discovered repos (with private repo support)
   - [ ] Write markdown parser for extracting frontmatter and sections
   - [ ] Generate repository and plan manifests as JSON
   - [ ] Verify end-to-end: discovery → fetch → parse → manifest generation

2. **Phase 2: Repository Selector + Index View**
   - [ ] Create repository selector dropdown component
   - [ ] Implement repository list state management (Pinia store)
   - [ ] Build plan card component (Material Design cards with badges)
   - [ ] Create index view with card grid layout
   - [ ] Implement filter bar (type, priority, scope, search)
   - [ ] Add sort options (date, priority, completion)
   - [ ] Wire to manifest data with Vue Router routing

3. **Phase 3: Detail View — Core Sections**
   - [ ] Set up vue-markdown-render for content rendering
   - [ ] Create header band component with repository + plan badges
   - [ ] Build objective block component with highlight styling
   - [ ] Implement AI Intent expandable cards (What/Why/How layout)
   - [ ] Create Phase Progress Timeline component with checkbox tracking
   - [ ] Build Testing & Rollout side-by-side panels
   - [ ] Implement Success Criteria checklist with progress bar
   - [ ] Add collapsible Notes section
   - [ ] Add metadata footer with source links

4. **Phase 4: D3.js Scope Impact Map**
   - [ ] Install and configure D3.js
   - [ ] Implement scope parser (extract areas from frontmatter + headings)
   - [ ] Build force-directed graph component
   - [ ] Add node sizing by change density
   - [ ] Implement color coding by change type (add/modify/remove)
   - [ ] Add interactivity (hover tooltips, click filtering, drag repositioning)
   - [ ] Integrate into detail view layout

5. **Phase 5: Theming + Polish**
   - [ ] Implement dark/light mode toggle with Vuetify theme switching
   - [ ] Add system preference detection (`prefers-color-scheme`)
   - [ ] Persist theme choice in localStorage
   - [ ] Optimize responsive layout for mobile/tablet
   - [ ] Add keyboard navigation (← → for plans, / for search, Esc to index)
   - [ ] Implement loading states and error boundaries
   - [ ] Add transition animations between views
   - [ ] Performance optimization (lazy loading, code splitting)

6. **Phase 6: Source Repository Integration Template**
   - [ ] Create example `notify-plan-viewer.yml` workflow template
   - [ ] Write documentation for source repo setup
   - [ ] Create example `.impl-plan-viewer.yml` config file
   - [ ] Test with multiple source repositories (public + private)
   - [ ] Verify webhook triggering and rebuild flow

---

## Testing Strategy

### Unit Tests (Vitest)
- Markdown parser: correctly extracts frontmatter, sections, checkboxes
- Repository discovery: handles public/private repos, pagination, filtering
- Manifest generation: validates JSON structure, handles missing fields
- Filter logic: type/priority/scope combinations work correctly
- Search: matches across title and objective text
- D3 force graph: node creation, link generation, color mapping

### Component Tests (Vue Test Utils)
- Repository selector: displays repos, updates on selection, persists to URL
- Plan card: renders badges correctly, handles missing metadata gracefully
- Detail view sections: all template sections render with real plan data
- Scope Impact Map: graph renders, nodes are interactive, tooltips appear
- Theme toggle: switches between light/dark, persists preference

### Integration Tests
- End-to-end workflow: webhook → discovery → fetch → parse → build → deploy
- Multi-repository: viewer correctly aggregates plans from 3+ repositories
- Private repository access: PAT authentication works, fetches private plans
- Edge cases:
  - Plan with no phases (flat checklist) — layout doesn't break
  - Plan with all optional sections filled vs. minimal required fields only
  - Repository with zero plans — doesn't crash index view
  - Repository becomes unavailable — shows error state gracefully

### Manual Testing Checklist
- GitHub Pages deployment serves correct content
- Repository dispatch triggers rebuild within 2 minutes
- Manifest updates reflect latest plan changes
- Dark mode renders correctly on all components
- Mobile/tablet responsive layouts work
- Keyboard navigation functions as expected
- Links to source repositories are correct

---

## Rollout

### Deployment Strategy
- **Phase 1**: Deploy viewer with single test repository (this repo itself with example plans)
- **Phase 2**: Add 2-3 real source repositories from the organization
- **Phase 3**: Enable organization-wide discovery and rollout to all teams
- **Phase 4**: Publicly announce and document for external adoption

### Infrastructure
- Deploy to GitHub Pages from `plan-viewer/dist/` (built artifact) on `main` branch
- Zero infrastructure cost — fully static site
- No server-side components or databases required
- Viewer is read-only and contains no secrets — safe for public access
- Source repository PAT is stored in Actions secrets, never exposed to client

### Monitoring
- GitHub Actions build time (target: < 3 minutes for 10 repos, < 10 minutes for 50 repos)
- Manifest generation performance (should handle 100+ plans per repo efficiently)
- Repository discovery API rate limits (GitHub API: 5000 requests/hour)
- Pages deployment success rate
- Webhook delivery success from source repositories

### Rollback Plan
- If build fails: previous deployment remains live (no downtime)
- If parser breaks: skip problematic plans, log warnings, continue with others
- If API rate limit hit: use conditional requests with ETags, cache results
- Manual trigger available for emergency rebuilds

---

## Success Criteria

### Functionality
- [ ] Viewer successfully discovers and aggregates plans from at least 3 repositories (mix of public/private)
- [ ] All plans render correctly in detail view with no broken sections or missing data
- [ ] Repository selector dropdown shows all discovered repos with accurate plan counts
- [ ] Filters (type, priority, scope, search) work across all aggregated plans
- [ ] D3 Scope Impact Map renders for every plan with at least one node
- [ ] Phase progress timeline correctly reflects checkbox state from markdown source
- [ ] Webhook trigger → rebuild → deploy completes in under 5 minutes for 10 repos

### Performance
- [ ] Index view initial load: < 2 seconds on standard connection
- [ ] Detail view transition: < 300ms
- [ ] Search/filter response: < 100ms for 500+ plans
- [ ] Build time: < 3 minutes for 10 repositories, < 10 minutes for 50 repositories

### User Experience
- [ ] Site works on mobile (320px width) and tablet (768px) viewports
- [ ] Dark/light mode toggle works on all pages, persists across sessions
- [ ] Keyboard navigation (arrows, search, escape) functions as documented
- [ ] All external links (to source repos, files) are correct and open in new tab

### Deployment
- [ ] Site is live at GitHub Pages URL (e.g., `https://yourorg.github.io/ImplPlanViewer`)
- [ ] Auto-updates when source repository sends webhook (within 5 minutes)
- [ ] Manual workflow dispatch works for emergency rebuilds
- [ ] GitHub Actions workflow succeeds with both public and private source repos

### Documentation
- [ ] README.md fully documents setup for both viewer and source repositories
- [ ] Template workflow files provided for source repo integration
- [ ] IMPLEMENTATION_PLAN_TEMPLATE.md is referenced and linked in viewer

---

## Notes

### Technology Choices
- **Vite + Vue 3 + TypeScript**: Chosen over vanilla JS for scalability with multiple repos and complex state management
- **Vuetify 3**: Material Design provides consistent, accessible UI components out of the box
- **D3.js for graphs**: Industry standard for data visualization, extensive community support
- **Build-time fetching**: All data fetched during build (not at runtime) ensures fast page loads and no client-side API keys

### Parser Considerations
- The blockquote frontmatter format (`> **Type:** ...`) is non-standard but matches `IMPLEMENTATION_PLAN_TEMPLATE.md`
- If plans migrate to YAML frontmatter in the future, parser needs updating
- Parser must handle partial plans (missing optional sections) gracefully
- Checkbox state parsing: `- [ ]` (unchecked) vs `- [x]` or `- [X]` (checked)

### Future Enhancements
- **Git integration**: Link each plan to commits that implemented it (match by date range or `commit:` field in Notes)
- **Diff view**: Show actual file changes associated with a plan via GitHub API
- **Plan templates**: In-browser template generator for creating new plans
- **Analytics**: Track which plans are most viewed, which repositories are most active
- **Comparison view**: Side-by-side comparison of similar plans across repositories
- **AI insights**: Detect patterns (e.g., "5 plans touching auth module — possible refactor needed")
- **Timeline view**: Chronological view of all plans across all repos
- **Export**: Generate PDF/markdown reports of plan collections
- **Commenting**: Integrate with GitHub Discussions for plan feedback (requires backend)
- **Status tracking**: Automated detection of plan completion (monitor commits, PRs, issues)

### Security Considerations
- PAT (Personal Access Token) must have minimal scope: `repo` for private repos, `public_repo` for public only
- Token stored in GitHub Actions secrets, never exposed to client
- If exposing viewer publicly, ensure no sensitive repo names or data in manifests
- Consider allowlist/blocklist for repositories to prevent accidental exposure

### Tradeoffs
- **Static vs. dynamic**: Chose static (build-time fetch) over dynamic (runtime API calls) for performance and simplicity, but sacrifices real-time updates
- **Centralized vs. distributed**: Chose centralized viewer over per-repo viewers for unified experience, but requires webhook setup in each repo
- **Topic vs. org discovery**: Topic-based more flexible, org-based simpler but less granular control
