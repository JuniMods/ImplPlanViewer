<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useKeyboard } from '../composables'
import ErrorBoundary from '../components/common/ErrorBoundary.vue'
import {
  AIIntentCard,
  MetadataFooter,
  NotesSection,
  ObjectiveBlock,
  PlanHeader,
  PlanNavigation,
  PhaseTimeline,
  RolloutPanel,
  ScopeImpactMap,
  SuccessCriteria,
  TestingPanel,
} from '../components/detail'
import { usePlansStore, useRepositoriesStore } from '../stores'
import type { Criterion, Phase, PlanMetadata, ProposedChange, ScopeArea } from '../types'
import { isCriterion, isPhase, isProposedChange, isScopeArea } from '../types'
import { parseCheckboxes, parseProposedChanges, parseScopeAreas, parseSections } from '../utils'

type PlanRecord = PlanMetadata & Record<string, unknown>

const PHASE_HEADING_PATTERN =
  /^\s*(?:(?:\d+\.\s*)?\*\*Phase\s*(\d+)\s*:\s*(.+?)\*\*|###\s*(?:Phase\s*)?(\d+)[.: -]*(.+?)|Phase\s*(\d+)\s*[:-]\s*(.+))\s*$/iu

const route = useRoute()
const router = useRouter()
const repositoriesStore = useRepositoriesStore()
const plansStore = usePlansStore()
const { current: currentRepository } = storeToRefs(repositoriesStore)

const normalizeString = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value).trim() : ''

const normalizePlanId = (value: unknown): string =>
  normalizeString(value)
    .replace(/^#/u, '')
    .trim()

const toPlanRecord = (plan: PlanMetadata): PlanRecord => plan as PlanRecord

const resolveRepository = (repoId: string | undefined) => {
  const normalized = normalizeString(repoId)
  if (!normalized) {
    return currentRepository.value
  }

  const lowered = normalized.toLowerCase()

  return (
    repositoriesStore.all.find((repository) => repository.id.toString() === normalized) ??
    repositoriesStore.all.find((repository) => repository.name.toLowerCase() === lowered) ??
    repositoriesStore.all.find((repository) => repository.fullName.toLowerCase() === lowered) ??
    repositoriesStore.all.find((repository) => repository.fullName.toLowerCase().endsWith(`/${lowered}`)) ??
    null
  )
}

const resolvePlan = (plans: PlanMetadata[], planId: string | undefined): PlanMetadata | null => {
  const normalizedTarget = normalizePlanId(planId)
  if (!normalizedTarget) {
    return null
  }

  const targetAsNumber = /^\d+$/u.test(normalizedTarget) ? Number(normalizedTarget) : null

  for (const plan of plans) {
    const record = toPlanRecord(plan)
    const identifiers = [record.id, record.planId, record.number]

    for (const identifier of identifiers) {
      const normalized = normalizePlanId(identifier)

      if (!normalized) {
        continue
      }

      if (normalized === normalizedTarget) {
        return plan
      }

      if (targetAsNumber !== null && /^\d+$/u.test(normalized) && Number(normalized) === targetAsNumber) {
        return plan
      }
    }
  }

  return null
}

const resolveArrayField = <T,>(
  record: PlanRecord,
  keys: string[],
  guard: (value: unknown) => value is T,
): T[] | null => {
  for (const key of keys) {
    const value = record[key]

    if (!Array.isArray(value)) {
      continue
    }

    const filtered = value.filter(guard)
    if (filtered.length > 0) {
      return filtered
    }
  }

  return null
}

const parsePhases = (implementationSteps: string): Phase[] => {
  const normalized = implementationSteps.trim()
  if (!normalized) {
    return []
  }

  const lines = normalized.split(/\r?\n/u)
  const phases: Array<{ number: number; name: string; lines: string[] }> = []
  let activePhase: { number: number; name: string; lines: string[] } | null = null
  let inferredPhaseNumber = 1

  const flush = (): void => {
    if (!activePhase) {
      return
    }
    phases.push(activePhase)
    activePhase = null
  }

  for (const line of lines) {
    const match = line.match(PHASE_HEADING_PATTERN)

    if (match) {
      flush()
      const phaseNumber = Number(match[1] ?? match[3] ?? match[5] ?? inferredPhaseNumber)
      const phaseName = normalizeString(match[2] ?? match[4] ?? match[6] ?? `Phase ${phaseNumber}`)

      activePhase = {
        number: Number.isFinite(phaseNumber) && phaseNumber > 0 ? phaseNumber : inferredPhaseNumber,
        name: phaseName || `Phase ${phaseNumber}`,
        lines: [],
      }
      inferredPhaseNumber = activePhase.number + 1
      continue
    }

    if (!activePhase) {
      activePhase = {
        number: inferredPhaseNumber,
        name: 'Implementation',
        lines: [],
      }
    }

    activePhase.lines.push(line)
  }

  flush()

  return phases
    .map((phase) => ({
      number: phase.number,
      name: phase.name,
      steps: parseCheckboxes(phase.lines.join('\n')).items,
    }))
    .filter((phase) => phase.steps.length > 0)
}

const repositoryParam = computed(() => normalizeString(route.params.repoId))
const planParam = computed(() => normalizeString(route.params.planId))

const repository = computed(() => resolveRepository(route.params.repoId as string | undefined))
const repositoryPlans = computed<PlanMetadata[]>(() => {
  const repo = repository.value

  if (!repo) {
    return []
  }

  return plansStore.byRepository[repo.fullName] ?? []
})

const plan = computed(() => resolvePlan(repositoryPlans.value, route.params.planId as string | undefined))
const planRecord = computed<PlanRecord | null>(() => (plan.value ? toPlanRecord(plan.value) : null))

const planContent = computed(() => {
  if (!planRecord.value) {
    return ''
  }

  const keys = ['markdown', 'content', 'body', 'rawContent', 'text']
  for (const key of keys) {
    const value = normalizeString(planRecord.value[key])
    if (value) {
      return value
    }
  }

  return ''
})

const parsedSections = computed(() => (planContent.value ? parseSections(planContent.value) : null))

const objective = computed(
  () => normalizeString(planRecord.value?.objective) || parsedSections.value?.objective || '',
)
const currentStateSection = computed(
  () => normalizeString(planRecord.value?.currentState) || parsedSections.value?.currentState || '',
)
const proposedChanges = computed<ProposedChange[]>(() => {
  if (!planRecord.value) {
    return []
  }

  return (
    resolveArrayField(planRecord.value, ['proposedChanges', 'changes'], isProposedChange) ??
    parseProposedChanges(parsedSections.value?.proposedChanges ?? '')
  )
})
const phases = computed<Phase[]>(() => {
  if (!planRecord.value) {
    return []
  }

  return (
    resolveArrayField(planRecord.value, ['phases', 'implementationPhases'], isPhase) ??
    parsePhases(parsedSections.value?.implementationSteps ?? '')
  )
})
const testingStrategy = computed(
  () =>
    normalizeString(planRecord.value?.testingStrategy) ||
    normalizeString(planRecord.value?.testing) ||
    parsedSections.value?.testingStrategy ||
    '',
)
const rolloutPlan = computed(
  () =>
    normalizeString(planRecord.value?.rolloutPlan) ||
    normalizeString(planRecord.value?.rollout) ||
    parsedSections.value?.rollout ||
    '',
)
const successCriteria = computed<Criterion[]>(() => {
  if (!planRecord.value) {
    return []
  }

  return (
    resolveArrayField(planRecord.value, ['successCriteria', 'criteria'], isCriterion) ??
    parseCheckboxes(parsedSections.value?.successCriteria ?? '').items
  )
})
const notes = computed(() => normalizeString(planRecord.value?.notes) || parsedSections.value?.notes || '')
const scopeAreas = computed<ScopeArea[]>(() => {
  if (!planRecord.value) {
    return []
  }

  return (
    resolveArrayField(planRecord.value, ['scopeAreas', 'affectedAreas'], isScopeArea) ??
    parseScopeAreas(planContent.value)
  )
})

const navigationBasePath = computed(() => {
  const repoSegment = repositoryParam.value || normalizeString(repository.value?.id)
  return repoSegment ? `/${encodeURIComponent(repoSegment)}` : ''
})

const navigationPlans = computed(() => repositoryPlans.value)

const currentPlanIndex = computed(() => {
  const currentPlan = plan.value
  if (!currentPlan) {
    return -1
  }

  const currentId = normalizePlanId(toPlanRecord(currentPlan).id ?? toPlanRecord(currentPlan).planId ?? toPlanRecord(currentPlan).number)

  return navigationPlans.value.findIndex((entry) => {
    const record = toPlanRecord(entry)
    const candidate = normalizePlanId(record.id ?? record.planId ?? record.number)
    return candidate.length > 0 && candidate === currentId
  })
})

const navigateToPlan = (targetPlan: PlanMetadata | undefined): void => {
  if (!targetPlan) {
    return
  }

  const targetRecord = toPlanRecord(targetPlan)
  const targetPlanId = normalizePlanId(targetRecord.id ?? targetRecord.planId ?? targetRecord.number)
  const repoSegment = repositoryParam.value || normalizeString(repository.value?.id)

  if (!targetPlanId || !repoSegment) {
    return
  }

  void router.push(`/${encodeURIComponent(repoSegment)}/${encodeURIComponent(targetPlanId)}`)
}

const goToPreviousPlan = (): void => {
  if (currentPlanIndex.value <= 0) {
    return
  }

  navigateToPlan(navigationPlans.value[currentPlanIndex.value - 1])
}

const goToNextPlan = (): void => {
  if (currentPlanIndex.value < 0 || currentPlanIndex.value >= navigationPlans.value.length - 1) {
    return
  }

  navigateToPlan(navigationPlans.value[currentPlanIndex.value + 1])
}

const goBackToIndex = (): void => {
  const repoSegment = repositoryParam.value || normalizeString(repository.value?.id)
  void router.push(repoSegment ? `/${encodeURIComponent(repoSegment)}` : '/')
}

useKeyboard({
  enabled: computed(() => Boolean(repository.value && plan.value)),
  onPreviousPlan: goToPreviousPlan,
  onNextPlan: goToNextPlan,
  onBackToIndex: goBackToIndex,
})

const isNotFound = computed(() => !repository.value || !plan.value)
const generatedAt = computed(() => normalizeString(planRecord.value?.generatedAt))
</script>

<template>
  <section class="plan-detail-view" data-testid="plan-detail-view">
    <article v-if="isNotFound" class="plan-detail-view__not-found" data-testid="plan-detail-not-found">
      <h1 class="plan-detail-view__not-found-title">Plan not found</h1>
      <p class="plan-detail-view__not-found-copy">
        The requested repository or plan could not be resolved from the loaded manifests.
      </p>
      <a href="/" class="plan-detail-view__not-found-link">← Back to plans</a>
    </article>

    <ErrorBoundary
      v-else-if="plan && repository"
      title="Unable to render plan details"
      description="One or more detail sections failed while rendering this plan."
      reset-label="Retry details"
    >
      <PlanHeader :plan="plan" :repository="repository" />

      <nav class="plan-detail-view__section-nav" aria-label="Plan sections">
        <a href="#plan-objective">Objective</a>
        <a href="#plan-intent">AI Intent</a>
        <a href="#plan-timeline">Timeline</a>
        <a href="#plan-testing">Testing</a>
        <a href="#plan-success">Success</a>
        <a href="#plan-notes">Notes</a>
      </nav>

      <section id="plan-objective">
        <ObjectiveBlock :objective="objective" :current-state="currentStateSection" />
      </section>

      <section id="plan-intent" class="plan-detail-view__split-grid">
        <article class="plan-detail-view__intent-cards" data-testid="plan-detail-intent-cards">
          <h2>AI Intent Cards</h2>
          <p v-if="proposedChanges.length === 0" class="plan-detail-view__empty">No proposed changes available.</p>
          <AIIntentCard v-for="(change, index) in proposedChanges" :key="`${change.heading}-${index}`" :change="change" :index="index" />
        </article>
        <ScopeImpactMap :scope-areas="scopeAreas" :plan-label="normalizeString(planRecord?.title) || 'Implementation Plan'" />
      </section>

      <section id="plan-timeline">
        <PhaseTimeline :phases="phases" />
      </section>

      <section id="plan-testing" class="plan-detail-view__split-grid">
        <TestingPanel :strategy="testingStrategy" />
        <RolloutPanel :plan="rolloutPlan" />
      </section>

      <section id="plan-success">
        <SuccessCriteria :criteria="successCriteria" />
      </section>

      <section id="plan-notes">
        <NotesSection :notes="notes" />
      </section>

      <MetadataFooter :plan="plan" :repository="repository" :generated-at="generatedAt" />
      <PlanNavigation :plans="navigationPlans" :current-plan-id="planParam" :base-path="navigationBasePath" />
    </ErrorBoundary>
  </section>
</template>

<style scoped>
.plan-detail-view {
  padding: 0.25rem;
  display: grid;
  gap: 1.25rem;
}

.plan-detail-view__not-found {
  border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
  border-radius: 0.5rem;
  padding: 1.1rem;
  text-align: left;
  display: grid;
  gap: 0.55rem;
  background: color-mix(in srgb, var(--surface-2) 90%, transparent);
}

.plan-detail-view__not-found-title {
  margin: 0;
  font-size: 1.3rem;
}

.plan-detail-view__not-found-copy {
  margin: 0;
  color: var(--text-m, var(--text));
}

.plan-detail-view__not-found-link,
.plan-detail-view__section-nav a {
  color: var(--accent);
  text-decoration: none;
}

.plan-detail-view__section-nav {
  border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
  border-radius: 0.5rem;
  padding: 0.8rem 0.95rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  background: color-mix(in srgb, var(--surface-2) 92%, transparent);
  box-shadow: var(--shadow-sm);
}

.plan-detail-view__section-nav a {
  border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
  border-radius: 0.3rem;
  padding: 0.3rem 0.62rem;
  font-size: 0.84rem;
  background: color-mix(in srgb, var(--surface-1) 90%, transparent);
}

.plan-detail-view__section-nav a:hover {
  border-color: var(--border-strong);
}

.plan-detail-view__split-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr);
}

.plan-detail-view__intent-cards {
  display: grid;
  gap: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
  border-radius: 0.5rem;
  padding: 1rem;
  background: color-mix(in srgb, var(--surface-2) 90%, transparent);
}

.plan-detail-view__intent-cards h2 {
  margin: 0;
  font-size: 1.1rem;
}

.plan-detail-view__empty {
  margin: 0;
  color: var(--text-m, var(--text));
}

@media (min-width: 1080px) {
  .plan-detail-view__split-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}

@media print {
  .plan-detail-view {
    padding: 0;
  }

  .plan-detail-view__section-nav,
  :deep(.plan-navigation),
  :deep(.plan-header__top-row) {
    display: none !important;
  }
}
</style>
