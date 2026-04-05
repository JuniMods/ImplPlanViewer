export const PlanType = {
  FEATURE: 'feature',
  ENHANCEMENT: 'enhancement',
  BUG_FIX: 'bug fix',
  REFACTOR: 'refactor',
  CHORE: 'chore',
} as const

export type PlanType = (typeof PlanType)[keyof typeof PlanType]

export const Priority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const

export type Priority = (typeof Priority)[keyof typeof Priority]

export interface PlanMetadata {
  type: PlanType
  scope: string
  priority: Priority
}

export interface ProposedChange {
  heading: string
  emoji?: string
  what: string
  why: string
  how: string
}

export interface Step {
  text: string
  completed: boolean
}

export interface Phase {
  number: number
  name: string
  steps: Step[]
}

export interface Criterion {
  text: string
  completed: boolean
}

export const ScopeAreaSource = {
  FRONTMATTER: 'frontmatter',
  HEADING: 'heading',
} as const

export type ScopeAreaSource = (typeof ScopeAreaSource)[keyof typeof ScopeAreaSource]

export const ScopeAreaChangeType = {
  ADD: 'add',
  MODIFY: 'modify',
  REMOVE: 'remove',
} as const

export type ScopeAreaChangeType =
  (typeof ScopeAreaChangeType)[keyof typeof ScopeAreaChangeType]

export interface ScopeArea {
  name: string
  source: ScopeAreaSource
  changeType?: ScopeAreaChangeType
  mentions: number
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const hasString = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'string'

const hasBoolean = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'boolean'

const hasPositiveInteger = (value: Record<string, unknown>, key: string): boolean =>
  typeof value[key] === 'number' &&
  Number.isInteger(value[key] as number) &&
  (value[key] as number) > 0

const planTypeValues = Object.values(PlanType) as string[]
const priorityValues = Object.values(Priority) as string[]
const scopeAreaSourceValues = Object.values(ScopeAreaSource) as string[]
const scopeAreaChangeTypeValues = Object.values(ScopeAreaChangeType) as string[]

export const isPlanType = (value: unknown): value is PlanType =>
  typeof value === 'string' && planTypeValues.includes(value)

export const isPriority = (value: unknown): value is Priority =>
  typeof value === 'string' && priorityValues.includes(value)

export const isProposedChange = (value: unknown): value is ProposedChange => {
  if (!isObject(value)) {
    return false
  }

  return (
    hasString(value, 'heading') &&
    (value.emoji === undefined || typeof value.emoji === 'string') &&
    hasString(value, 'what') &&
    hasString(value, 'why') &&
    hasString(value, 'how')
  )
}

export const isStep = (value: unknown): value is Step => {
  if (!isObject(value)) {
    return false
  }

  return hasString(value, 'text') && hasBoolean(value, 'completed')
}

export const isPhase = (value: unknown): value is Phase => {
  if (!isObject(value)) {
    return false
  }

  return (
    hasPositiveInteger(value, 'number') &&
    hasString(value, 'name') &&
    Array.isArray(value.steps) &&
    value.steps.every((entry) => isStep(entry))
  )
}

export const isCriterion = (value: unknown): value is Criterion => {
  if (!isObject(value)) {
    return false
  }

  return hasString(value, 'text') && hasBoolean(value, 'completed')
}

export const isScopeAreaSource = (value: unknown): value is ScopeAreaSource =>
  typeof value === 'string' && scopeAreaSourceValues.includes(value)

export const isScopeAreaChangeType = (value: unknown): value is ScopeAreaChangeType =>
  typeof value === 'string' && scopeAreaChangeTypeValues.includes(value)

export const isScopeArea = (value: unknown): value is ScopeArea => {
  if (!isObject(value)) {
    return false
  }

  return (
    hasString(value, 'name') &&
    isScopeAreaSource(value.source) &&
    (value.changeType === undefined || isScopeAreaChangeType(value.changeType)) &&
    hasPositiveInteger(value, 'mentions')
  )
}

export const isPlanMetadata = (value: unknown): value is PlanMetadata => {
  if (!isObject(value)) {
    return false
  }

  return isPlanType(value.type) && hasString(value, 'scope') && isPriority(value.priority)
}

export const assertPlanMetadata = (value: unknown): asserts value is PlanMetadata => {
  if (!isPlanMetadata(value)) {
    throw new TypeError('Invalid plan metadata payload')
  }
}

export const assertProposedChange = (value: unknown): asserts value is ProposedChange => {
  if (!isProposedChange(value)) {
    throw new TypeError('Invalid proposed change payload')
  }
}

export const assertStep = (value: unknown): asserts value is Step => {
  if (!isStep(value)) {
    throw new TypeError('Invalid step payload')
  }
}

export const assertPhase = (value: unknown): asserts value is Phase => {
  if (!isPhase(value)) {
    throw new TypeError('Invalid phase payload')
  }
}

export const assertCriterion = (value: unknown): asserts value is Criterion => {
  if (!isCriterion(value)) {
    throw new TypeError('Invalid criterion payload')
  }
}

export const assertScopeArea = (value: unknown): asserts value is ScopeArea => {
  if (!isScopeArea(value)) {
    throw new TypeError('Invalid scope area payload')
  }
}
