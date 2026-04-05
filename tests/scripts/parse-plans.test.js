const test = require('node:test')
const assert = require('node:assert/strict')

const { parsePlans } = require('../../scripts/parse-plans.js')

const validPlanContent = `# Implementation Plan: Add parser script

> **Type:** \`chore\`
> **Scope:** CI/CD
> **Priority:** \`high\`

## Problem / Objective
Need parser.

## Current State
Missing.

## Proposed Changes
### 1. Core Unit Delivery
- **What:** Add parser
- **Why:** Needed
- **How:** Implement

## Implementation Steps
- [x] Build parser
- [ ] Add docs

## Testing Strategy
Run tests.

## Rollout
Ship.

## Success Criteria
- [x] Script exists
- [ ] Script tested

## Notes
None.
`

test('parsePlans extracts structured fields and statistics', () => {
  const result = parsePlans({
    repository: 'JuniMods/ImplPlanViewer',
    files: [
      {
        path: 'implementation-plans/001_add_parser.md',
        name: '001_add_parser.md',
        content: validPlanContent,
      },
    ],
  })

  assert.equal(result.statistics.totalPlans, 1)
  assert.equal(result.validation.errors.length, 0)
  assert.equal(result.plans[0].type, 'chore')
  assert.equal(result.plans[0].priority, 'high')
  assert.equal(result.plans[0].scope, 'CI/CD')
  assert.equal(result.plans[0].proposedChanges.length, 1)
  assert.equal(result.plans[0].completionPercentage, 50)
})

test('parsePlans keeps running with warnings for missing frontmatter', () => {
  const result = parsePlans({
    repository: 'JuniMods/ImplPlanViewer',
    files: [
      {
        path: 'implementation-plans/002_missing_frontmatter.md',
        name: '002_missing_frontmatter.md',
        content: '# Implementation Plan: Missing fields\n\n## Success Criteria\n- [ ] one',
      },
    ],
  })

  assert.equal(result.statistics.totalPlans, 1)
  assert.equal(result.plans[0].type, 'feature')
  assert.equal(result.plans[0].priority, 'medium')
  assert.equal(result.validation.warnings.length, 1)
})

test('parsePlans reports invalid input file payloads as errors', () => {
  const result = parsePlans({
    repository: 'JuniMods/ImplPlanViewer',
    files: [{ path: 'implementation-plans/003_invalid.md', name: '003_invalid.md' }],
  })

  assert.equal(result.statistics.totalPlans, 0)
  assert.equal(result.validation.errors.length, 1)
})
