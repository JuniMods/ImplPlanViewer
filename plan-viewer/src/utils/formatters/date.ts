const ISO_DATE_PREFIX_REGEX = /^(\d{4}-\d{2}-\d{2})/

const isValidDate = (value: Date): boolean => !Number.isNaN(value.getTime())

export const formatDate = (value: string | Date | null | undefined): string => {
  if (value == null) {
    return ''
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value.toISOString().slice(0, 10) : ''
  }

  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return ''
  }

  const prefixMatch = trimmed.match(ISO_DATE_PREFIX_REGEX)
  if (prefixMatch && trimmed.length <= 10) {
    return prefixMatch[1]
  }

  const parsed = new Date(trimmed)
  return isValidDate(parsed) ? parsed.toISOString().slice(0, 10) : ''
}
