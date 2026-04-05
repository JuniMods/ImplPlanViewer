import type { PlanMetadata } from '../../types'
import { DEFAULT_FRONTMATTER, parseFrontmatter } from './frontmatter'
import { parseSections } from './sections'
import { parseProposedChanges } from './proposedChanges'
import { parseScopeAreas } from './scopeAreas'
import { parseCheckboxes } from './checkboxes'
import { assertValidPlanMetadata } from '../validators'

export interface PlanBuilderOptions {
  fallback?: Partial<PlanMetadata>
}

const SCOPE_FIELD_PATTERN = /^\s*>\s*\*\*scope:\*\*\s*(.+?)\s*$/im

const hasExplicitScopeField = (content: string): boolean => {
  const match = content.match(SCOPE_FIELD_PATTERN)
  return Boolean(match && match[1].trim().length > 0)
}

const inferScope = (
  content: string,
  frontmatterScope: string,
  fallbackScope: string | undefined,
): string => {
  if (hasExplicitScopeField(content)) {
    return frontmatterScope
  }

  const normalizedFallback = fallbackScope?.trim()
  if (normalizedFallback) {
    return normalizedFallback
  }

  const sections = parseSections(content)
  const scopeAreas = parseScopeAreas(content)
  const proposedChanges = parseProposedChanges(sections.proposedChanges)

  parseCheckboxes(sections.implementationSteps)
  parseCheckboxes(sections.successCriteria)

  const inferredFromScopeAreas = [...scopeAreas]
    .sort((a, b) => b.mentions - a.mentions || a.name.localeCompare(b.name))[0]
    ?.name

  if (inferredFromScopeAreas) {
    return inferredFromScopeAreas
  }

  const inferredFromHeading = proposedChanges[0]?.heading?.trim()
  if (inferredFromHeading) {
    return inferredFromHeading
  }

  return frontmatterScope || DEFAULT_FRONTMATTER.scope
}

export const buildPlanMetadata = (
  content: string,
  options: PlanBuilderOptions = {},
): PlanMetadata => {
  if (typeof content !== 'string') {
    throw new TypeError('Plan content must be a string')
  }

  const frontmatter = parseFrontmatter(content, options.fallback)

  const metadata: PlanMetadata = {
    type: frontmatter.type,
    priority: frontmatter.priority,
    scope: inferScope(content, frontmatter.scope, options.fallback?.scope),
  }

  assertValidPlanMetadata(metadata)
  return metadata
}
