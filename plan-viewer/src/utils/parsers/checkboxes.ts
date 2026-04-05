export interface ParsedCheckbox {
  text: string
  completed: boolean
}

export interface ParsedCheckboxSummary {
  items: ParsedCheckbox[]
  total: number
  completed: number
  unchecked: number
  completionPercentage: number
}

const CHECKBOX_PATTERN = /^\s*[-*]\s*\[([^\]]*)\]\s*(.*?)\s*$/

export const parseCheckboxes = (content: string): ParsedCheckboxSummary => {
  const items = content
    .split(/\r?\n/)
    .map((line) => line.match(CHECKBOX_PATTERN))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => {
      const marker = match[1].trim().toLowerCase()

      return {
        text: match[2].trim(),
        completed: marker === 'x',
      }
    })

  const total = items.length
  const completed = items.filter((item) => item.completed).length
  const unchecked = total - completed

  return {
    items,
    total,
    completed,
    unchecked,
    completionPercentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  }
}
