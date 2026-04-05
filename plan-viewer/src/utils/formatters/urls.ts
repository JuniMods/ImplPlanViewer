export interface PlanUrlOptions {
  baseUrl?: string
  branch?: string
  plansDirectory?: string
}

const DEFAULT_BASE_URL = 'https://github.com'
const DEFAULT_BRANCH = 'main'
const DEFAULT_PLANS_DIRECTORY = 'implementation-plans'

const normalizeValue = (value: string | null | undefined): string => value?.trim() ?? ''

const normalizePathSegment = (value: string): string => value.replace(/^\/+|\/+$/gu, '')

const joinPath = (...segments: string[]): string =>
  segments
    .map((segment) => normalizePathSegment(segment))
    .filter((segment) => segment.length > 0)
    .map((segment) =>
      segment
        .split('/')
        .map((part) => encodeURIComponent(part))
        .join('/'),
    )
    .join('/')

export const buildRepositoryUrl = (
  repositoryId: string | null | undefined,
  baseUrl: string = DEFAULT_BASE_URL,
): string => {
  const normalizedRepositoryId = normalizePathSegment(normalizeValue(repositoryId))
  const normalizedBaseUrl = normalizeValue(baseUrl).replace(/\/+$/u, '')

  if (normalizedRepositoryId.length === 0 || normalizedBaseUrl.length === 0) {
    return ''
  }

  const repositoryPath = joinPath(normalizedRepositoryId)
  return repositoryPath.length === 0 ? '' : `${normalizedBaseUrl}/${repositoryPath}`
}

export const buildPlanUrl = (
  repositoryId: string | null | undefined,
  planId: string | null | undefined,
  options: PlanUrlOptions = {},
): string => {
  const repositoryUrl = buildRepositoryUrl(repositoryId, options.baseUrl)
  const normalizedPlanId = normalizeValue(planId)

  if (repositoryUrl.length === 0 || normalizedPlanId.length === 0) {
    return ''
  }

  const branch = normalizePathSegment(normalizeValue(options.branch) || DEFAULT_BRANCH)
  const plansDirectory = normalizePathSegment(
    normalizeValue(options.plansDirectory) || DEFAULT_PLANS_DIRECTORY,
  )
  const normalizedPlanFile = normalizedPlanId.endsWith('.md')
    ? normalizedPlanId
    : `${normalizedPlanId}.md`

  const planPath = joinPath('blob', branch, plansDirectory, normalizedPlanFile)

  return planPath.length === 0 ? '' : `${repositoryUrl}/${planPath}`
}
