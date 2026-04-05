import type { PlanMetadata } from '../../types'
import { isPlanType, isPriority } from '../../types'

type PlanMetadataField = keyof PlanMetadata

export interface PlanMetadataValidationIssue {
  field: PlanMetadataField
  message: string
}

export interface PlanMetadataValidationResult {
  valid: boolean
  issues: PlanMetadataValidationIssue[]
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

export const validatePlanMetadata = (value: unknown): PlanMetadataValidationResult => {
  if (!isObject(value)) {
    return {
      valid: false,
      issues: [
        { field: 'type', message: 'Type is required and must be a valid plan type' },
        { field: 'scope', message: 'Scope is required and must be a non-empty string' },
        { field: 'priority', message: 'Priority is required and must be a valid priority' },
      ],
    }
  }

  const issues: PlanMetadataValidationIssue[] = []

  if (!isPlanType(value.type)) {
    issues.push({ field: 'type', message: 'Type is required and must be a valid plan type' })
  }

  if (!isNonEmptyString(value.scope)) {
    issues.push({ field: 'scope', message: 'Scope is required and must be a non-empty string' })
  }

  if (!isPriority(value.priority)) {
    issues.push({ field: 'priority', message: 'Priority is required and must be a valid priority' })
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

export const isValidPlanMetadata = (value: unknown): value is PlanMetadata =>
  validatePlanMetadata(value).valid

export function assertValidPlanMetadata(value: unknown): asserts value is PlanMetadata {
  const validationResult = validatePlanMetadata(value)
  if (!validationResult.valid) {
    throw new TypeError(
      `Invalid plan metadata payload: ${validationResult.issues
        .map((issue) => `${issue.field} (${issue.message})`)
        .join(', ')}`,
    )
  }
}
