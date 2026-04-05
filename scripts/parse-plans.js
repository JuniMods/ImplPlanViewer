#!/usr/bin/env node

const PLAN_TYPES = new Set(['feature', 'enhancement', 'bug fix', 'refactor', 'chore'])
const PRIORITIES = new Set(['critical', 'high', 'medium', 'low'])

const DEFAULT_METADATA = {
  type: 'feature',
  scope: 'general',
  priority: 'medium',
}

const SECTION_HEADERS = [
  'Problem / Objective',
  'Current State',
  'Proposed Changes',
  'Implementation Steps',
  'Testing Strategy',
  'Rollout',
  'Success Criteria',
  'Notes',
]

const clamp = (value) => (Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0)

const parseFrontmatter = (content) => {
  const typeMatch = content.match(/^\s*>\s*\*\*Type:\*\*\s*`?([^`\n]+)`?/im)
  const scopeMatch = content.match(/^\s*>\s*\*\*Scope:\*\*\s*(.+)$/im)
  const priorityMatch = content.match(/^\s*>\s*\*\*Priority:\*\*\s*`?([^`\n]+)`?/im)

  const type = typeMatch?.[1]?.trim().toLowerCase()
  const scope = scopeMatch?.[1]?.trim()
  const priority = priorityMatch?.[1]?.trim().toLowerCase()

  return {
    type: PLAN_TYPES.has(type) ? type : DEFAULT_METADATA.type,
    scope: scope || DEFAULT_METADATA.scope,
    priority: PRIORITIES.has(priority) ? priority : DEFAULT_METADATA.priority,
    issues: [
      ...(type && PLAN_TYPES.has(type) ? [] : ['Invalid or missing Type frontmatter']),
      ...(scope ? [] : ['Missing Scope frontmatter']),
      ...(priority && PRIORITIES.has(priority) ? [] : ['Invalid or missing Priority frontmatter']),
    ],
  }
}

const parseSections = (content) => {
  const sections = Object.fromEntries(SECTION_HEADERS.map((header) => [header, '']))
  const lines = content.split('\n')
  let currentHeader = null
  let buffer = []

  const flush = () => {
    if (currentHeader) {
      sections[currentHeader] = buffer.join('\n').trim()
    }
    buffer = []
  }

  for (const line of lines) {
    const headerMatch = line.match(/^##\s+(.+)$/)
    if (headerMatch && SECTION_HEADERS.includes(headerMatch[1].trim())) {
      flush()
      currentHeader = headerMatch[1].trim()
      continue
    }

    if (currentHeader) {
      buffer.push(line)
    }
  }

  flush()
  return sections
}

const parseCheckboxes = (content) => {
  const matches = [...content.matchAll(/^- \[( |x|X)\]\s+(.+)$/gm)]
  return matches.map((entry) => ({
    completed: entry[1].toLowerCase() === 'x',
    text: entry[2].trim(),
  }))
}

const parseProposedChanges = (content) => {
  const chunks = content.split(/^###\s+/gm).map((entry) => entry.trim()).filter(Boolean)
  return chunks.map((chunk) => {
    const lines = chunk.split('\n')
    const heading = lines[0]?.replace(/^\d+\.\s*/, '').trim() ?? ''
    const body = lines.slice(1).join('\n')
    const what = body.match(/-\s*\*\*What:\*\*\s*(.+)/i)?.[1]?.trim() ?? ''
    const why = body.match(/-\s*\*\*Why:\*\*\s*(.+)/i)?.[1]?.trim() ?? ''
    const how = body.match(/-\s*\*\*How:\*\*\s*(.+)/i)?.[1]?.trim() ?? ''

    return { heading, what, why, how }
  })
}

const parseScopeAreas = (scope, proposedChanges) => {
  const areas = new Map()
  const addArea = (name, source) => {
    const key = name.trim().toLowerCase()
    if (!key) {
      return
    }
    const current = areas.get(key) ?? { name: name.trim(), source, mentions: 0 }
    current.mentions += 1
    areas.set(key, current)
  }

  addArea(scope, 'frontmatter')
  for (const change of proposedChanges) {
    if (change.heading) {
      addArea(change.heading, 'heading')
    }
  }

  return [...areas.values()]
}

const extractTitle = (content, fallbackPath) => {
  const titleMatch = content.match(/^#\s*Implementation Plan:\s*(.+)$/im)
  return titleMatch?.[1]?.trim() || fallbackPath
}

const parsePlanNumber = (path) => Number(path.match(/(\d{3})_/)?.[1] ?? 0)

const parsePlanFile = (file, repository) => {
  const frontmatter = parseFrontmatter(file.content)
  const sections = parseSections(file.content)
  const proposedChanges = parseProposedChanges(sections['Proposed Changes'])
  const implementationSteps = parseCheckboxes(sections['Implementation Steps'])
  const successCriteria = parseCheckboxes(sections['Success Criteria'])

  const allChecklistItems = [...implementationSteps, ...successCriteria]
  const completedCount = allChecklistItems.filter((entry) => entry.completed).length
  const completionPercentage =
    allChecklistItems.length === 0 ? 0 : clamp((completedCount / allChecklistItems.length) * 100)

  return {
    id: `${repository}-${file.name.replace(/\.md$/i, '')}`,
    repository,
    number: parsePlanNumber(file.path),
    title: extractTitle(file.content, file.path),
    path: file.path,
    type: frontmatter.type,
    scope: frontmatter.scope,
    priority: frontmatter.priority,
    completionPercentage,
    proposedChanges,
    implementationSteps,
    successCriteria,
    scopeAreas: parseScopeAreas(frontmatter.scope, proposedChanges),
    validationIssues: frontmatter.issues.filter(Boolean),
  }
}

const parsePlans = ({ repository, files }) => {
  if (!repository || !Array.isArray(files)) {
    throw new Error('parsePlans requires { repository, files[] } input')
  }

  const plans = []
  const errors = []
  const warnings = []

  for (const file of files) {
    if (!file || typeof file.content !== 'string' || typeof file.path !== 'string') {
      errors.push(`Invalid file payload encountered: ${JSON.stringify(file)}`)
      continue
    }

    try {
      const parsed = parsePlanFile(file, repository)
      plans.push(parsed)
      if (parsed.validationIssues.length > 0) {
        warnings.push(`${file.path}: ${parsed.validationIssues.join('; ')}`)
      }
    } catch (error) {
      errors.push(`${file.path}: ${error.message}`)
    }
  }

  plans.sort((left, right) => left.number - right.number || left.title.localeCompare(right.title))

  const averageCompletion =
    plans.length === 0
      ? 0
      : plans.reduce((sum, plan) => sum + plan.completionPercentage, 0) / plans.length

  return {
    repository,
    plans,
    validation: {
      errors,
      warnings,
    },
    statistics: {
      totalPlans: plans.length,
      averageCompletion: Number(averageCompletion.toFixed(2)),
    },
  }
}

const parseInput = (raw) => {
  if (!raw) {
    throw new Error('Input payload is required via PARSE_INPUT or stdin')
  }

  const parsed = JSON.parse(raw)
  return parsed
}

const writeActionOutputs = (result) => {
  if (!process.env.GITHUB_OUTPUT) {
    return
  }

  const output = [
    `repository=${result.repository}`,
    `plan_count=${result.statistics.totalPlans}`,
    `parsed=${JSON.stringify(result.plans)}`,
  ].join('\n')

  require('node:fs').appendFileSync(process.env.GITHUB_OUTPUT, `${output}\n`, 'utf8')
}

const runCli = async () => {
  const stdin = await new Promise((resolve) => {
    let input = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      input += chunk
    })
    process.stdin.on('end', () => resolve(input.trim()))
    process.stdin.on('error', () => resolve(''))
  })

  const raw = process.env.PARSE_INPUT || stdin
  const payload = parseInput(raw)
  const result = parsePlans(payload)
  writeActionOutputs(result)
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
}

if (require.main === module) {
  runCli().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}

module.exports = {
  parsePlans,
  parsePlanFile,
  parseFrontmatter,
  parseSections,
  parseCheckboxes,
  parseProposedChanges,
  parseScopeAreas,
}
