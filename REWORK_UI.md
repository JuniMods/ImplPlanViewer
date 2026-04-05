# UI Rework Implementation Plan

A complete rework of the Implementation Plan Viewer UI to align with the new design system defined in `DESIGN.md`.

---

## Overview

### Current State
- Vue 3 + Vuetify + custom CSS
- Uses custom color scheme (purple accent `#7c3aed`, `#aa3bff`)
- Inconsistent spacing (mix of rem/px, arbitrary values)
- Typography based on Roboto
- Custom CSS variables scattered across multiple files (`style.css`, `global.css`, `variables.css`)
- Component-level scoped styles with ad-hoc values

### Target State
- Clean design system with Inter font family
- Primary blue accent (`#2563EB`)
- Consistent 4px-based spacing scale
- Unified CSS variable system matching DESIGN.md
- Component library aligned with design specifications

---

## Phase 1: Foundation (Design Tokens & Base Styles)

### 1.1 Create New Design Token System
**File:** `src/assets/styles/design-tokens.css`

Replace current fragmented variables with a unified token system:

```
- Colors: Primary palette, neutral palette, semantic colors, dark mode
- Typography: Font families (Inter, JetBrains Mono), type scale
- Spacing: 4px-based scale (space-1 through space-16)
- Border radius: sm (4px), default (6px), md (8px), lg (12px), full
- Shadows: xs, sm, md, lg, xl, 2xl
- Transitions: fast (100ms), normal (150ms), moderate (200ms), slow (300ms)
- Z-index layers: base, raised, sticky, dropdown, modal, tooltip, notification
```

### 1.2 Update Global Styles
**File:** `src/assets/styles/global.css`

- Update base font to Inter with proper fallbacks
- Implement new color scheme (light and dark mode)
- Set default body styles per DESIGN.md
- Update focus states (Primary color ring)
- Update selection highlight

### 1.3 Remove Legacy Style Files
- Merge/replace `src/style.css` content
- Update `src/assets/styles/variables.css` → design-tokens.css
- Update `src/assets/styles/responsive.css` with new breakpoints (1024px minimum)

### 1.4 Update Main Entry Point
**File:** `src/main.ts`

- Import Inter and JetBrains Mono fonts (via Google Fonts or local)
- Import new design-tokens.css before other styles

---

## Phase 2: Layout System

### 2.1 App Shell Rework
**File:** `src/App.vue`

Update app layout to match DESIGN.md specifications:
- Container max-width: 1440px (wide dashboard)
- Main content padding: 24px
- Remove current border-inline styling
- Implement proper grid system

### 2.2 Sidebar Navigation (New Component)
**File:** `src/components/common/AppSidebar.vue`

Create sidebar navigation component:
- Width: 240px expanded, 64px collapsed
- Nav item height: 36px
- Section headers with uppercase labels
- Active state with Primary Light background

### 2.3 Top Header Rework
**File:** `src/components/common/AppHeader.vue`

Update to match DESIGN.md:
- Height: 56px
- Horizontal padding: 24px
- Border bottom: 1px solid Gray 200
- Update search input styling (36px height, 6px radius)
- Update button styles to new specifications

### 2.4 Footer Update
**File:** `src/components/common/AppFooter.vue`

- Align with new spacing and typography system

---

## Phase 3: Core Components

### 3.1 Button System
**Files:** Create `src/components/ui/BaseButton.vue`

Implement button variants per DESIGN.md:
- Sizes: Extra Small (24px), Small (28px), Default (32px), Large (40px)
- Variants: Primary, Secondary, Ghost, Danger
- Icon button variants
- Proper focus states and transitions

### 3.2 Form Elements
**Files:** Create `src/components/ui/` directory

- `BaseInput.vue`: Text input (heights: 32px, 36px, 40px)
- `BaseSelect.vue`: Dropdown with proper styling
- `BaseCheckbox.vue`: 16×16 checkbox
- `BaseRadio.vue`: 16×16 radio button
- `BaseToggle.vue`: 36×20 toggle switch

### 3.3 Card Component
**File:** Create `src/components/ui/BaseCard.vue`

- Standard, Elevated, Outlined, Interactive variants
- Border radius: 8px
- Padding options: compact (16px), default (20px), spacious (24px)
- Proper shadow and hover states

### 3.4 Badge/Tag Component
**File:** Update `src/components/plan/PlanBadge.vue`

Update to match DESIGN.md badge specifications:
- Sizes: Small (18px), Default (22px), Large (26px)
- Variants: Default, Primary, Success, Warning, Error, Outline
- Border radius: 4px (sm/default), 6px (large)

---

## Phase 4: Plan Components

### 4.1 PlanCard Rework
**File:** `src/components/plan/PlanCard.vue`

Update styling:
- Use new card system (8px radius, proper shadows)
- Update progress bar (6px height, full radius)
- Typography per type scale (13px body, 12px caption)
- Proper spacing (16px padding default)
- Update type color indicators

### 4.2 PlanGrid Update
**File:** `src/components/plan/PlanGrid.vue`

- Card gap: 16px
- Responsive grid with 12-column system

### 4.3 PlanFilters Rework
**File:** `src/components/plan/PlanFilters.vue`

- Update form elements to new specifications
- Proper label styling (Caption size, 6px gap to input)
- Input-to-input gap: 16px

### 4.4 PlanSearch Update
**File:** `src/components/plan/PlanSearch.vue`

- Input height: 36px
- Border radius: 6px
- Focus state with Primary border + shadow

### 4.5 EmptyState Update
**File:** `src/components/plan/EmptyState.vue`

- Icon size: 32px (XXL)
- Proper heading and body typography

---

## Phase 5: Detail View Components

### 5.1 PlanHeader Rework
**File:** `src/components/detail/PlanHeader.vue`

- Title: Heading 1 (24px, weight 600)
- Breadcrumb styling per spec (13px, Gray 500)
- Button sizing (32px default height)
- Badge row with 8px gap

### 5.2 PhaseTimeline Rework
**File:** `src/components/detail/PhaseTimeline.vue`

- Section title: Heading 2 (20px)
- Phase cards using new card system
- Step checkboxes using new checkbox style
- Proper timeline connector styling

### 5.3 ObjectiveBlock Update
**File:** `src/components/detail/ObjectiveBlock.vue`

- Card styling per DESIGN.md
- Heading 3 for section title (16px)
- Body text (14px)

### 5.4 TestingPanel Update
**File:** `src/components/detail/TestingPanel.vue`

- Table styling per DESIGN.md specifications
- Header: Gray 50 bg, 12px font, uppercase
- Rows: 40px height, hover state
- Cell padding: 10px 12px

### 5.5 Other Detail Components

Update all remaining detail components:
- `AIIntentCard.vue`
- `MetadataFooter.vue`
- `NotesSection.vue`
- `PlanNavigation.vue`
- `RolloutPanel.vue`
- `ScopeImpactMap.vue`
- `SuccessCriteria.vue`

---

## Phase 6: Repository Components

### 6.1 RepositorySelector Update
**File:** `src/components/repository/RepositorySelector.vue`

- Select/dropdown styling per DESIGN.md
- Height: 36px
- Dropdown max-height: 240px
- Item height: 32px

### 6.2 RepositoryCard Update
**File:** `src/components/repository/RepositoryCard.vue`

- Use new card variants
- Avatar styling (32px default)
- Proper metadata caption styling

### 6.3 RepositoryStats Update
**File:** `src/components/repository/RepositoryStats.vue`

- Badge/tag styling for stats display
- Caption typography

---

## Phase 7: View Pages

### 7.1 HomeView Rework
**File:** `src/views/HomeView.vue`

- Page title: Display (32px) or Heading 1 (24px)
- Sidebar + main content layout
- Proper section spacing (24px-32px)

### 7.2 PlanDetailView Update
**File:** `src/views/PlanDetailView.vue`

- Breadcrumb navigation at top
- Content max-width consideration
- Section gaps: 24px

### 7.3 Error Views
**Files:** `ErrorView.vue`, `NotFoundView.vue`

- Centered layout
- Icon size: 32px
- Heading and body per typography scale

---

## Phase 8: Common Components

### 8.1 LoadingSpinner Update
**File:** `src/components/common/LoadingSpinner.vue`

- Sizes: 16px (small), 24px (default), 32px (large)
- Border width: 2px
- Primary color active segment

### 8.2 ThemeToggle Update
**File:** `src/components/common/ThemeToggle.vue`

- Icon button styling (32×32 default)
- Proper hover/active states

### 8.3 ErrorBoundary Update
**File:** `src/components/common/ErrorBoundary.vue`

- Error styling using semantic colors
- Error Light background, Error text
- 8px border radius

---

## Phase 9: Modal & Overlay System

### 9.1 Modal Component (New/Update)
**File:** `src/components/ui/BaseModal.vue`

- Overlay: rgba(17, 24, 39, 0.5), blur(4px)
- Container: 12px radius, proper shadow
- Header: 20px 24px padding, bottom border
- Body: 24px padding
- Footer: 16px 24px padding, top border, Gray 50 bg

### 9.2 Dropdown Menu (New/Update)
**File:** `src/components/ui/BaseDropdown.vue`

- 8px radius, shadow-lg
- Menu item: 32px height, 0 12px padding
- Divider styling

### 9.3 Tooltip System
**File:** `src/components/ui/BaseTooltip.vue`

- Background: Gray 900
- 12px font, 6px 10px padding
- 6px radius, 240px max-width

### 9.4 Toast/Notification System
**File:** `src/components/ui/BaseToast.vue`

- 360px width, 8px radius
- Position: 16px from top-right
- Stack gap: 8px

---

## Phase 10: Dark Mode & Accessibility

### 10.1 Dark Mode Implementation

Update design tokens for dark mode:
- Background Primary: `#0F172A`
- Background Secondary: `#1E293B`
- Text Primary: `#F1F5F9`
- Border: `#475569`

Ensure all components respect dark mode tokens.

### 10.2 Accessibility Audit

- Focus indicators: 2px solid Primary, 2px offset
- Minimum click targets: 32×32
- Color contrast verification (4.5:1 for text)
- Keyboard navigation for all interactive elements

---

## Phase 11: Animation & Transitions

### 11.1 Standardize Transitions

Update all components to use design token transitions:
- Button hover: 100ms ease-out
- Card hover: 150ms ease-out
- Modal enter/exit: 200ms ease-out
- Color changes: 100ms ease-out

### 11.2 Reduced Motion Support

Ensure `prefers-reduced-motion` media query is respected.

---

## Phase 12: Cleanup & Documentation

### 12.1 Remove Vuetify Dependencies (Optional)

Evaluate if Vuetify components can be replaced with custom components.

### 12.2 Remove Legacy Styles

- Delete unused CSS from `src/style.css`
- Remove any remaining hardcoded color values
- Clean up component scoped styles

### 12.3 Storybook Updates

Update/create Storybook stories for all new UI components.

### 12.4 Component Documentation

Document prop interfaces and usage for new base components.

---

## File Change Summary

### New Files
```
src/assets/styles/design-tokens.css
src/components/ui/BaseButton.vue
src/components/ui/BaseInput.vue
src/components/ui/BaseSelect.vue
src/components/ui/BaseCheckbox.vue
src/components/ui/BaseRadio.vue
src/components/ui/BaseToggle.vue
src/components/ui/BaseCard.vue
src/components/ui/BaseModal.vue
src/components/ui/BaseDropdown.vue
src/components/ui/BaseTooltip.vue
src/components/ui/BaseToast.vue
src/components/common/AppSidebar.vue (if sidebar layout chosen)
```

### Modified Files
```
src/main.ts
src/App.vue
src/assets/styles/global.css
src/assets/styles/variables.css (merge into design-tokens)
src/assets/styles/responsive.css

src/components/common/AppHeader.vue
src/components/common/AppFooter.vue
src/components/common/LoadingSpinner.vue
src/components/common/ThemeToggle.vue
src/components/common/ErrorBoundary.vue

src/components/plan/PlanCard.vue
src/components/plan/PlanGrid.vue
src/components/plan/PlanFilters.vue
src/components/plan/PlanSearch.vue
src/components/plan/PlanBadge.vue
src/components/plan/EmptyState.vue

src/components/detail/PlanHeader.vue
src/components/detail/PhaseTimeline.vue
src/components/detail/ObjectiveBlock.vue
src/components/detail/TestingPanel.vue
src/components/detail/AIIntentCard.vue
src/components/detail/MetadataFooter.vue
src/components/detail/NotesSection.vue
src/components/detail/PlanNavigation.vue
src/components/detail/RolloutPanel.vue
src/components/detail/ScopeImpactMap.vue
src/components/detail/SuccessCriteria.vue

src/components/repository/RepositorySelector.vue
src/components/repository/RepositoryCard.vue
src/components/repository/RepositoryStats.vue

src/views/HomeView.vue
src/views/PlanDetailView.vue
src/views/ErrorView.vue
src/views/NotFoundView.vue
```

### Files to Delete/Deprecate
```
src/style.css (merge useful parts, delete)
src/components/HelloWorld.vue (if unused)
```

---

## Implementation Order (Recommended)

1. **Phase 1** - Foundation must be complete first
2. **Phase 2** - Layout system depends on Phase 1
3. **Phase 3** - Core UI components can be built in parallel
4. **Phase 4-6** - Feature components (can parallelize)
5. **Phase 7** - Views (depends on Phases 3-6)
6. **Phase 8-9** - Common components and overlays
7. **Phase 10** - Dark mode and accessibility
8. **Phase 11** - Animations (final polish)
9. **Phase 12** - Cleanup and documentation

---

## Testing Strategy

1. **Visual Regression**: Screenshot comparisons before/after
2. **Unit Tests**: Existing tests should still pass
3. **Storybook**: Verify each component in isolation
4. **Cross-browser**: Test in Chrome, Firefox, Safari, Edge
5. **Responsive**: Test at 1024px, 1280px, 1440px, 1920px widths
6. **Accessibility**: axe-core or similar automated testing

---

## Risk Mitigation

- **Incremental Rollout**: Implement phase by phase, not big-bang
- **Feature Flags**: Consider toggling new design system
- **Fallback Styles**: Keep old styles until new ones verified
- **Snapshot Tests**: Catch unintended visual changes

---

*Plan Version: 1.0*  
*Created: 2026-04-05*  
*Based on: DESIGN.md v1.0*
