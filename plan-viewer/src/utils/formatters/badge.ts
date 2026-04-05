import { PlanType, Priority, type PlanType as PlanTypeValue, type Priority as PriorityValue } from '../../types'

export type BadgeVariant = 'tonal' | 'outlined'

export interface BadgeStyle {
  label: string
  color: string
  variant: BadgeVariant
}

const DEFAULT_BADGE_STYLE: BadgeStyle = {
  label: 'Unknown',
  color: 'grey',
  variant: 'outlined',
}

const TYPE_BADGE_STYLES: Record<PlanTypeValue, BadgeStyle> = {
  [PlanType.FEATURE]: { label: 'Feature', color: 'plan-feature', variant: 'tonal' },
  [PlanType.ENHANCEMENT]: { label: 'Enhancement', color: 'plan-enhancement', variant: 'tonal' },
  [PlanType.BUG_FIX]: { label: 'Bug Fix', color: 'plan-bug', variant: 'tonal' },
  [PlanType.REFACTOR]: { label: 'Refactor', color: 'plan-refactor', variant: 'tonal' },
  [PlanType.CHORE]: { label: 'Chore', color: 'plan-chore', variant: 'tonal' },
}

const PRIORITY_BADGE_STYLES: Record<PriorityValue, BadgeStyle> = {
  [Priority.CRITICAL]: { label: 'Critical', color: 'priority-critical', variant: 'tonal' },
  [Priority.HIGH]: { label: 'High', color: 'priority-high', variant: 'tonal' },
  [Priority.MEDIUM]: { label: 'Medium', color: 'priority-medium', variant: 'tonal' },
  [Priority.LOW]: { label: 'Low', color: 'priority-low', variant: 'tonal' },
}

const normalizeBadgeValue = (value: string | null | undefined): string => value?.trim().toLowerCase() ?? ''

const getBadgeStyle = <T extends string>(
  value: string | null | undefined,
  styles: Record<T, BadgeStyle>,
): BadgeStyle => {
  const normalized = normalizeBadgeValue(value) as T
  return styles[normalized] ?? DEFAULT_BADGE_STYLE
}

export const getTypeBadgeStyle = (value: PlanTypeValue | string | null | undefined): BadgeStyle =>
  getBadgeStyle(value, TYPE_BADGE_STYLES)

export const getPriorityBadgeStyle = (
  value: PriorityValue | string | null | undefined,
): BadgeStyle => getBadgeStyle(value, PRIORITY_BADGE_STYLES)
