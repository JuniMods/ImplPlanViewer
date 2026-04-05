import { describe, expect, it } from 'vitest'

import { parseSections } from '../../../src/utils/parsers/sections'

describe('parseSections', () => {
  it('extracts all supported h2 sections', () => {
    const result = parseSections(`
# Implementation Plan: Demo

## Problem / Objective
Primary objective content.

## Current State
Current state details.

## Proposed Changes
Planned changes.

## Implementation Steps
- [ ] Step one

## Testing Strategy
Run parser tests.

## Rollout
Ship after validation.

## Success Criteria
- [ ] Criteria one

## Notes
Additional context.
`)

    expect(result).toEqual({
      objective: 'Primary objective content.',
      currentState: 'Current state details.',
      proposedChanges: 'Planned changes.',
      implementationSteps: '- [ ] Step one',
      testingStrategy: 'Run parser tests.',
      rollout: 'Ship after validation.',
      successCriteria: '- [ ] Criteria one',
      notes: 'Additional context.',
    })
  })

  it('matches headers case-insensitively and ignores unknown sections', () => {
    const result = parseSections(`
## problem   objective
Objective text.

## Unknown Section
This should be ignored.

## TESTING STRATEGY
Validate through tests.
`)

    expect(result).toEqual({
      objective: 'Objective text.',
      currentState: '',
      proposedChanges: '',
      implementationSteps: '',
      testingStrategy: 'Validate through tests.',
      rollout: '',
      successCriteria: '',
      notes: '',
    })
  })

  it('keeps the latest content when a supported section appears multiple times', () => {
    const result = parseSections(`
## Notes
Initial note.

## Notes
Final note.
`)

    expect(result.notes).toBe('Final note.')
  })
})
