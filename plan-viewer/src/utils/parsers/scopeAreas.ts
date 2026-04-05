import type { ScopeArea } from '../../types'
import { ScopeAreaChangeType, ScopeAreaSource } from '../../types'

import { parseProposedChanges } from './proposedChanges'
import { parseSections } from './sections'

const SCOPE_SPLIT_PATTERN = /[,;]+/g
const FRONTMATTER_SCOPE_PATTERN = /^\s*>\s*\*\*scope:\*\*\s*(.+?)\s*$/im

const CHANGE_TYPE_PATTERNS: Record<ScopeAreaChangeType, RegExp> = {
  [ScopeAreaChangeType.ADD]: /\b(add|create|introduce|implement|build)\b/i,
  [ScopeAreaChangeType.MODIFY]: /\b(modify|update|change|refactor|improve|enhance|replace|migrate)\b/i,
  [ScopeAreaChangeType.REMOVE]: /\b(remove|delete|deprecate|drop)\b/i,
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalizeAreaName = (value: string): string =>
  value
    .trim()
    .replace(/^`+|`+$/g, '')
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/\s+/g, ' ')

const extractScopeAreasFromFrontmatter = (scope: string): string[] =>
  scope
    .split(SCOPE_SPLIT_PATTERN)
    .flatMap((entry) => entry.split(/\s+\band\b\s+/i))
    .map(normalizeAreaName)
    .filter((entry) => entry.length > 0)

const extractExplicitScope = (content: string): string | null => {
  const match = content.match(FRONTMATTER_SCOPE_PATTERN)

  if (!match) {
    return null
  }

  const normalized = normalizeAreaName(match[1])
  return normalized.length > 0 ? normalized : null
}

const detectChangeType = (content: string): ScopeAreaChangeType | undefined => {
  if (CHANGE_TYPE_PATTERNS[ScopeAreaChangeType.REMOVE].test(content)) {
    return ScopeAreaChangeType.REMOVE
  }

  if (CHANGE_TYPE_PATTERNS[ScopeAreaChangeType.ADD].test(content)) {
    return ScopeAreaChangeType.ADD
  }

  if (CHANGE_TYPE_PATTERNS[ScopeAreaChangeType.MODIFY].test(content)) {
    return ScopeAreaChangeType.MODIFY
  }

  return undefined
}

const countMentions = (content: string, areaName: string): number => {
  const normalizedAreaName = normalizeAreaName(areaName)

  if (normalizedAreaName.length === 0) {
    return 0
  }

  const pattern = new RegExp(escapeRegex(normalizedAreaName).replace(/\s+/g, '\\s+'), 'gi')
  return content.match(pattern)?.length ?? 0
}

interface ScopeAreaCandidate {
  name: string
  source: ScopeAreaSource
  changeType?: ScopeAreaChangeType
}

export const parseScopeAreas = (content: string): ScopeArea[] => {
  const candidates = new Map<string, ScopeAreaCandidate>()

  const addCandidate = (
    name: string,
    source: ScopeAreaSource,
    changeType?: ScopeAreaChangeType,
  ): void => {
    const normalizedName = normalizeAreaName(name)

    if (normalizedName.length === 0) {
      return
    }

    const key = normalizedName.toLowerCase()
    const existing = candidates.get(key)

    if (!existing) {
      candidates.set(key, {
        name: normalizedName,
        source,
        changeType,
      })
      return
    }

    if (existing.changeType === undefined && changeType !== undefined) {
      existing.changeType = changeType
    }
  }

  const explicitScope = extractExplicitScope(content)
  if (explicitScope) {
    for (const area of extractScopeAreasFromFrontmatter(explicitScope)) {
      addCandidate(area, ScopeAreaSource.FRONTMATTER)
    }
  }

  for (const change of parseProposedChanges(parseSections(content).proposedChanges)) {
    const changeType = detectChangeType(`${change.heading}\n${change.what}\n${change.how}`)
    addCandidate(change.heading, ScopeAreaSource.HEADING, changeType)
  }

  return Array.from(candidates.values()).map((candidate) => ({
    ...candidate,
    mentions: Math.max(1, countMentions(content, candidate.name)),
  }))
}
