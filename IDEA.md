# Implementation Plan: GitHub Pages Plan Viewer

> **Type:** `feature`
> **Scope:** `plan/` directory, GitHub Pages, new static site
> **Priority:** `medium`

---

## Problem / Objective

Implementation plans sit as raw markdown files in `plan/` — useful for the agent and developer, but invisible and hard to browse. The goal is a GitHub Pages site that turns those plan files into a rich visual dashboard: surfacing what the AI intended to do, which project areas each plan touches, phase progress, and success criteria at a glance. Anyone opening the site should immediately understand the history and status of changes made to the project without reading raw markdown.

---

## Current State

- Plans live in `plan/` as numbered markdown files following `TEMPLATE.md`
- No viewer, no index, no visual rendering exists
- Plans are only readable by someone with repo access looking at raw files
- Template defines a consistent structure (Type, Scope, Priority, Problem, Current State, Proposed Changes, Implementation Steps, Testing Strategy, Rollout, Success Criteria, Notes)

---

## Proposed Changes

### 1. Static Site Shell

- **What:** A self-contained `docs/` (or `plan-viewer/`) folder that GitHub Pages serves
- **Why:** GitHub Pages serves static files from `docs/` or a `gh-pages` branch with zero configuration
- **How:** Vanilla HTML + CSS + JS (no build step required). If complexity grows, a Vite + Vue/React setup with a GitHub Actions deploy step is acceptable.

### 2. Plan Manifest & Parser

- **What:** A mechanism to discover and load all plan markdown files
- **Why:** The viewer needs to know which plans exist without a server
- **How:** A GitHub Actions step regenerates a `docs/plans.json` manifest on every push to `main`. The manifest lists each plan file's path, number, title, type, scope, and priority — extracted by parsing the frontmatter blockquote. The viewer fetches this JSON on load, then fetches individual plan files via the GitHub raw content URL or a pre-bundled copy.

### 3. Plan Index View

- **What:** Landing page listing all plans as cards, sortable and filterable
- **Why:** Entry point for browsing — shows the full picture at a glance
- **How:** Each card shows: plan number, title, type badge (color-coded), priority badge, scope tag, and a one-line excerpt of the objective. Filters by type and priority. Clicking a card opens the detail view.

### 4. Plan Detail View

- **What:** Full rendered view of a single plan with structured visual sections
- **Why:** Raw markdown loses hierarchy; a visual layout makes the AI's intent scannable
- **How:**
  - **Header band:** Title, type/priority/scope badges, plan number
  - **Objective block:** Rendered paragraph with subtle background
  - **Scope Impact Map:** Visual file-tree / tag cloud showing which project areas the plan touches (parsed from the Scope field and Proposed Changes section headers). Color-coded by change type (add / modify / remove — inferred from section wording).
  - **AI Intent Summary:** The "Proposed Changes" section rendered as expandable cards, each showing What / Why / How in a three-column layout
  - **Phase Progress Timeline:** "Implementation Steps" rendered as a horizontal phase track with checkbox completion indicators per step (checked = done, unchecked = pending)
  - **Testing & Rollout strip:** Compact side-by-side panels for Testing Strategy and Rollout sections
  - **Success Criteria checklist:** Rendered checkboxes styled as a launch checklist with visual completion percentage bar
  - **Notes:** Collapsible, rendered at the bottom

### 5. Scope Impact Map

- **What:** The most distinctive visual — shows which parts of the project a plan affects
- **Why:** At a glance, a reader should see "this plan touches the CI pipeline and the auth module" without reading prose
- **How:** Parse the `Scope` frontmatter field and the `### N. [Change Area]` headings from Proposed Changes. Render as an interactive tag-node diagram (SVG or CSS grid of labeled bubbles). Each node is labeled with the area name and colored by how many changes target it. No external graph library needed — a flex-wrapped bubble layout works for MVP; upgrade to D3 force graph if desired.

### 6. GitHub Actions Deploy Step

- **What:** Automatic deployment of the viewer on every push to `main`
- **Why:** Plans change with each feature; the viewer must stay in sync automatically
- **How:** Add a `deploy-plan-viewer` job to the existing workflow (or a separate `plan-viewer.yml`). Steps: checkout → generate `plans.json` manifest → deploy `docs/` to GitHub Pages via `actions/deploy-pages`.

---

## Implementation Steps

1. **Phase 1: Static Shell + Manifest**
   - [ ] Create `docs/` folder with `index.html`, `style.css`, `app.js`
   - [ ] Write GitHub Actions step to parse plan files and emit `docs/plans.json`
   - [ ] Verify Pages deployment works end-to-end with dummy content

2. **Phase 2: Index View**
   - [ ] Build plan card component (number, title, badges, excerpt)
   - [ ] Implement type/priority filter bar
   - [ ] Wire to `plans.json` manifest

3. **Phase 3: Detail View — Core Sections**
   - [ ] Markdown-to-HTML rendering (use `marked.js` CDN, no build needed)
   - [ ] Header band with badges
   - [ ] AI Intent cards (Proposed Changes → expandable What/Why/How layout)
   - [ ] Phase Progress Timeline from Implementation Steps checkboxes
   - [ ] Success Criteria checklist with completion bar

4. **Phase 4: Scope Impact Map**
   - [ ] Parse scope tags from plan frontmatter and section headings
   - [ ] Render bubble layout (CSS flex grid, no external dep)
   - [ ] Color-coding by change density

5. **Phase 5: Polish**
   - [ ] Responsive layout (mobile-readable)
   - [ ] Dark mode support (CSS `prefers-color-scheme`)
   - [ ] Keyboard navigation between plans (← →)

---

## Testing Strategy

- Verify manifest generation correctly parses all three existing plan files
- Test filter combinations on the index view
- Test detail view with a plan that has no phases (flat checklist) — must not break layout
- Test with a plan that has all sections vs. a minimal plan with only required fields
- Test Pages deployment: confirm the deployed URL serves the latest manifest after a push

---

## Rollout

- Deploy to GitHub Pages from `docs/` on `main` — zero infrastructure cost
- Manifest generation runs in CI, so the viewer is always current without manual steps
- The viewer is read-only and has no secrets — safe to make public immediately
- Monitor: check that the manifest job doesn't slow down the main pipeline (should be < 5 seconds)

---

## Success Criteria

- [ ] All existing plans render correctly in the detail view with no broken sections
- [ ] Index view loads in under 1 second on a standard connection
- [ ] Scope Impact Map shows at least one node per plan
- [ ] Phase progress correctly reflects checkbox state from the markdown source
- [ ] Site is live at the repo's GitHub Pages URL and auto-updates on push to `main`
- [ ] Works without JavaScript build tooling — `docs/` is self-contained

---

## Notes

- Keeping the viewer dependency-free (only CDN-loaded `marked.js`) avoids a build step and keeps the `docs/` folder auditable as plain files.
- If the plan format ever gains YAML frontmatter instead of the blockquote style, the manifest parser needs updating — the blockquote approach is non-standard but what TEMPLATE.md uses.
- Future idea: link each plan to the git commits that implemented it (match by date range or a `commit:` Notes field).
- Future idea: diff view showing the actual file changes associated with a plan, fetched via GitHub API.
