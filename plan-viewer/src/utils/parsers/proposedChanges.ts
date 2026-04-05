import type { ProposedChange } from '../../types'

const CHANGE_HEADING_PATTERN = /^\s*###\s*(?:\d+\.\s*)?(.+?)\s*$/u
const CHANGE_FIELD_PATTERN = /^\s*[-*]\s*\*\*(what|why|how):\*\*\s*(.*)\s*$/i
const TRAILING_EMOJI_PATTERN = /^(.*?)(?:\s+((?:\p{Extended_Pictographic}|\uFE0F|\u200D)+))$/u

const parseHeading = (rawHeading: string): Pick<ProposedChange, 'heading' | 'emoji'> => {
  const normalizedHeading = rawHeading.trim()
  const headingWithEmoji = normalizedHeading.match(TRAILING_EMOJI_PATTERN)

  if (!headingWithEmoji) {
    return { heading: normalizedHeading }
  }

  const heading = headingWithEmoji[1].trim()
  const emoji = headingWithEmoji[2].trim()

  return heading.length > 0 ? { heading, emoji } : { heading: normalizedHeading }
}

const parseChangeBlock = (lines: string[]): Pick<ProposedChange, 'what' | 'why' | 'how'> => {
  const parsed: Pick<ProposedChange, 'what' | 'why' | 'how'> = {
    what: '',
    why: '',
    how: '',
  }

  let currentField: keyof Pick<ProposedChange, 'what' | 'why' | 'how'> | null = null
  let buffer: string[] = []

  const flush = (): void => {
    if (!currentField) {
      buffer = []
      return
    }

    parsed[currentField] = buffer.join('\n').trim()
    buffer = []
  }

  for (const line of lines) {
    const fieldMatch = line.match(CHANGE_FIELD_PATTERN)

    if (fieldMatch) {
      flush()
      currentField = fieldMatch[1].toLowerCase() as keyof Pick<ProposedChange, 'what' | 'why' | 'how'>
      buffer = [fieldMatch[2]]
      continue
    }

    if (currentField) {
      buffer.push(line)
    }
  }

  flush()

  return parsed
}

export const parseProposedChanges = (content: string): ProposedChange[] => {
  const lines = content.split(/\r?\n/)
  const headingMatches = lines
    .map((line, index) => {
      const match = line.match(CHANGE_HEADING_PATTERN)

      if (!match) {
        return null
      }

      return { index, rawHeading: match[1] }
    })
    .filter((entry): entry is { index: number; rawHeading: string } => entry !== null)

  return headingMatches.map((entry, index) => {
    const heading = parseHeading(entry.rawHeading)
    const nextHeading = headingMatches[index + 1]
    const blockLines = lines.slice(entry.index + 1, nextHeading?.index ?? lines.length)
    const block = parseChangeBlock(blockLines)

    return {
      ...heading,
      ...block,
    }
  })
}
