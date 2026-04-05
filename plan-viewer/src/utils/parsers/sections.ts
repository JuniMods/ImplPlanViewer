export interface ParsedSections {
  objective: string
  currentState: string
  proposedChanges: string
  implementationSteps: string
  testingStrategy: string
  rollout: string
  successCriteria: string
  notes: string
}

const SECTION_MAP: Readonly<Record<string, keyof ParsedSections>> = {
  'problem objective': 'objective',
  'current state': 'currentState',
  'proposed changes': 'proposedChanges',
  'implementation steps': 'implementationSteps',
  'testing strategy': 'testingStrategy',
  rollout: 'rollout',
  'success criteria': 'successCriteria',
  notes: 'notes',
}

const EMPTY_SECTIONS: ParsedSections = {
  objective: '',
  currentState: '',
  proposedChanges: '',
  implementationSteps: '',
  testingStrategy: '',
  rollout: '',
  successCriteria: '',
  notes: '',
}

const normalizeHeader = (header: string): string =>
  header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export const parseSections = (content: string): ParsedSections => {
  const sections: ParsedSections = { ...EMPTY_SECTIONS }
  const lines = content.split(/\r?\n/)
  let currentSection: keyof ParsedSections | null = null
  let buffer: string[] = []

  const flush = (): void => {
    if (!currentSection) {
      buffer = []
      return
    }

    sections[currentSection] = buffer.join('\n').trim()
    buffer = []
  }

  for (const line of lines) {
    const match = line.match(/^##\s+(.+?)\s*$/)

    if (match) {
      flush()
      currentSection = SECTION_MAP[normalizeHeader(match[1])] ?? null
      continue
    }

    if (currentSection) {
      buffer.push(line)
    }
  }

  flush()

  return sections
}
