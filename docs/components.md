# Component Library

This document lists every Vue component in `plan-viewer/src/components`, including its public props, emitted events, and a minimal usage example.

## Common Components

### `common/AppHeader.vue`
- **Props:** none
- **Emits:** none
- **Usage:**
  ```vue
  <AppHeader />
  ```

### `common/AppFooter.vue`
- **Props:** none
- **Emits:** none
- **Usage:**
  ```vue
  <AppFooter />
  ```

### `common/ThemeToggle.vue`
- **Props:** none
- **Emits:** none
- **Usage:**
  ```vue
  <ThemeToggle />
  ```

### `common/LoadingSpinner.vue`
- **Props:**
  - `variant?: 'spinner' | 'skeleton'` (default: `'spinner'`)
  - `label?: string` (default: `'Loading…'`)
  - `showLabel?: boolean` (default: `true`)
  - `skeletonLines?: number` (default: `3`)
- **Emits:** none
- **Usage:**
  ```vue
  <LoadingSpinner variant="skeleton" :skeleton-lines="4" label="Loading plans" />
  ```

### `common/ErrorBoundary.vue`
- **Props:**
  - `title?: string`
  - `description?: string`
  - `resetLabel?: string`
  - `error?: unknown | null`
- **Emits:**
  - `error(error: unknown)`
  - `reset()`
- **Usage:**
  ```vue
  <ErrorBoundary @reset="reload" @error="onRenderError">
    <PlanGrid :plans="plans" />
  </ErrorBoundary>
  ```

## Plan Components

### `plan/PlanBadge.vue`
- **Props:**
  - `kind: 'type' | 'priority' | 'scope'`
  - `value?: string | null`
- **Emits:** none
- **Usage:**
  ```vue
  <PlanBadge kind="priority" :value="plan.priority" />
  ```

### `plan/PlanCard.vue`
- **Props:**
  - `plan: PlanMetadata`
  - `compact?: boolean` (default: `false`)
- **Emits:**
  - `click()`
- **Usage:**
  ```vue
  <PlanCard :plan="plan" @click="openPlan(plan)" />
  ```

### `plan/PlanGrid.vue`
- **Props:**
  - `plans: PlanMetadata[]`
  - `compact?: boolean` (default: `false`)
  - `emptyMessage?: string`
  - `showClearFilters?: boolean` (default: `false`)
- **Emits:**
  - `select(plan: PlanMetadata)`
  - `clear-filters()`
- **Usage:**
  ```vue
  <PlanGrid :plans="filteredPlans" :show-clear-filters="hasActiveFilters" @select="openPlan" @clear-filters="clearFilters" />
  ```

### `plan/PlanFilters.vue`
- **Props:** none
- **Emits:**
  - `update:filters(filters: FilterState)`
- **Usage:**
  ```vue
  <PlanFilters @update:filters="onFiltersChanged" />
  ```

### `plan/PlanSearch.vue`
- **Props:** none
- **Emits:**
  - `update:query(query: string)`
- **Usage:**
  ```vue
  <PlanSearch @update:query="onQueryChanged" />
  ```

### `plan/EmptyState.vue`
- **Props:**
  - `filtered?: boolean` (default: `false`)
  - `message?: string`
  - `clearLabel?: string` (default: `'Clear filters'`)
- **Emits:**
  - `clear()`
- **Usage:**
  ```vue
  <EmptyState filtered message="No plans match" @clear="clearFilters" />
  ```

## Repository Components

### `repository/RepositorySelector.vue`
- **Props:**
  - `repositories: Repository[]`
  - `modelValue: string`
  - `disabled?: boolean` (default: `false`)
- **Emits:**
  - `update:modelValue(value: string)`
  - `select(value: string)`
- **Usage:**
  ```vue
  <RepositorySelector
    v-model="selectedRepository"
    :repositories="repositories"
    @select="selectRepository"
  />
  ```

### `repository/RepositoryStats.vue`
- **Props:**
  - `repository: Repository | null`
- **Emits:** none
- **Usage:**
  ```vue
  <RepositoryStats :repository="currentRepository" />
  ```

### `repository/RepositoryCard.vue`
- **Props:**
  - `repository: Repository | null`
  - `compact?: boolean` (default: `false`)
- **Emits:** none
- **Usage:**
  ```vue
  <RepositoryCard :repository="currentRepository" />
  ```

## Detail Components

### `detail/PlanHeader.vue`
- **Props:**
  - `plan: PlanMetadata`
  - `repository: Repository`
- **Emits:** none
- **Usage:**
  ```vue
  <PlanHeader :plan="plan" :repository="repository" />
  ```

### `detail/ObjectiveBlock.vue`
- **Props:**
  - `objective: string`
  - `currentState?: string`
- **Emits:** none
- **Usage:**
  ```vue
  <ObjectiveBlock :objective="plan.objective" :current-state="plan.currentState" />
  ```

### `detail/AIIntentCard.vue`
- **Props:**
  - `change: ProposedChange`
  - `index: number`
- **Emits:** none
- **Usage:**
  ```vue
  <AIIntentCard v-for="(change, index) in plan.proposedChanges" :key="index" :change="change" :index="index" />
  ```

### `detail/ScopeImpactMap.vue`
- **Props:**
  - `scopeAreas?: ScopeArea[]` (default: `[]`)
  - `planLabel?: string` (default: `'Implementation Plan'`)
- **Emits:** none
- **Usage:**
  ```vue
  <ScopeImpactMap :scope-areas="plan.scopeAreas" :plan-label="plan.title" />
  ```

### `detail/PhaseTimeline.vue`
- **Props:**
  - `phases?: Phase[]` (default: `[]`)
- **Emits:** none
- **Usage:**
  ```vue
  <PhaseTimeline :phases="plan.phases" />
  ```

### `detail/TestingPanel.vue`
- **Props:**
  - `strategy?: string`
- **Emits:** none
- **Usage:**
  ```vue
  <TestingPanel :strategy="plan.testingStrategy" />
  ```

### `detail/RolloutPanel.vue`
- **Props:**
  - `plan?: string`
- **Emits:** none
- **Usage:**
  ```vue
  <RolloutPanel :plan="plan.rollout" />
  ```

### `detail/SuccessCriteria.vue`
- **Props:**
  - `criteria?: Criterion[]` (default: `[]`)
- **Emits:** none
- **Usage:**
  ```vue
  <SuccessCriteria :criteria="plan.successCriteria" />
  ```

### `detail/NotesSection.vue`
- **Props:**
  - `notes?: string`
- **Emits:** none
- **Usage:**
  ```vue
  <NotesSection :notes="plan.notes" />
  ```

### `detail/PlanNavigation.vue`
- **Props:**
  - `plans: PlanMetadata[]`
  - `currentPlanId: string | number`
  - `basePath?: string`
- **Emits:** none
- **Usage:**
  ```vue
  <PlanNavigation :plans="plans" :current-plan-id="plan.id" base-path="/plan" />
  ```

### `detail/MetadataFooter.vue`
- **Props:**
  - `plan: PlanMetadata`
  - `repository: Repository`
  - `generatedAt?: string`
- **Emits:** none
- **Usage:**
  ```vue
  <MetadataFooter :plan="plan" :repository="repository" :generated-at="manifestGeneratedAt" />
  ```

## Legacy Component

### `HelloWorld.vue`
- **Props:** none
- **Emits:** none
- **Usage:**
  ```vue
  <HelloWorld />
  ```
- **Notes:** Vite starter/demo component; not part of the plan viewer feature surface.
