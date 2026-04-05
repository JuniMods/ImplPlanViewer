import { describe, expect, it } from 'vitest'

import { PlanType, Priority } from '../../../../src/types'
import {
  assertValidPlanMetadata,
  isValidPlanMetadata,
  validatePlanMetadata,
} from '../../../../src/utils/validators/plan'

describe('plan metadata validator', () => {
  it('accepts valid plan metadata', () => {
    const metadata = {
      type: PlanType.FEATURE,
      scope: 'validators',
      priority: Priority.MEDIUM,
    }

    const result = validatePlanMetadata(metadata)

    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
    expect(isValidPlanMetadata(metadata)).toBe(true)
  })

  it('reports invalid fields', () => {
    const result = validatePlanMetadata({
      type: 'invalid',
      scope: '   ',
      priority: 42,
    })

    expect(result.valid).toBe(false)
    expect(result.issues).toEqual([
      { field: 'type', message: 'Type is required and must be a valid plan type' },
      { field: 'scope', message: 'Scope is required and must be a non-empty string' },
      { field: 'priority', message: 'Priority is required and must be a valid priority' },
    ])
  })

  it('throws in assert mode when metadata is invalid', () => {
    expect(() => assertValidPlanMetadata(null)).toThrow('Invalid plan metadata payload')
  })

  it('reports all required fields when payload is not an object', () => {
    const result = validatePlanMetadata(undefined)

    expect(result).toEqual({
      valid: false,
      issues: [
        { field: 'type', message: 'Type is required and must be a valid plan type' },
        { field: 'scope', message: 'Scope is required and must be a non-empty string' },
        { field: 'priority', message: 'Priority is required and must be a valid priority' },
      ],
    })
  })
})
