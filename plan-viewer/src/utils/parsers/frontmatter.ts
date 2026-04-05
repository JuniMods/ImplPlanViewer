import { PlanType, Priority, isPlanType, isPriority } from '../../types'

export interface FrontmatterData {
  type: PlanType
  scope: string
  priority: Priority
}

export const DEFAULT_FRONTMATTER: FrontmatterData = {
  type: PlanType.FEATURE,
  scope: 'general',
  priority: Priority.MEDIUM,
}

const normalizeValue = (value: string): string =>
  value
    .trim()
    .replace(/^`+|`+$/g, '')
    .replace(/^['"]+|['"]+$/g, '')

const normalizePlanType = (value: string): PlanType | null => {
  const normalized = normalizeValue(value).toLowerCase().replace(/\s+/g, ' ')
  return isPlanType(normalized) ? normalized : null
}

const normalizePriority = (value: string): Priority | null => {
  const normalized = normalizeValue(value).toLowerCase()
  return isPriority(normalized) ? normalized : null
}

const parseBlockquoteField = (content: string, field: 'type' | 'scope' | 'priority'): string | null => {
  const pattern = new RegExp(
    String.raw`^\s*>\s*\*\*${field}:\*\*\s*(.+?)\s*$`,
    'im',
  )
  const match = content.match(pattern)
  return match ? normalizeValue(match[1]) : null
}

export const parseFrontmatter = (
  content: string,
  fallback: Partial<FrontmatterData> = {},
): FrontmatterData => {
  const defaults: FrontmatterData = {
    type: fallback.type ?? DEFAULT_FRONTMATTER.type,
    scope: (fallback.scope ?? DEFAULT_FRONTMATTER.scope).trim() || DEFAULT_FRONTMATTER.scope,
    priority: fallback.priority ?? DEFAULT_FRONTMATTER.priority,
  }

  const rawType = parseBlockquoteField(content, 'type')
  const rawScope = parseBlockquoteField(content, 'scope')
  const rawPriority = parseBlockquoteField(content, 'priority')

  const type = rawType ? normalizePlanType(rawType) : null
  const priority = rawPriority ? normalizePriority(rawPriority) : null
  const scope = rawScope?.trim() ?? ''

  return {
    type: type ?? defaults.type,
    scope: scope.length > 0 ? scope : defaults.scope,
    priority: priority ?? defaults.priority,
  }
}
