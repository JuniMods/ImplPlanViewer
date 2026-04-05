export interface TruncateTextOptions {
  maxChars?: number
  maxLines?: number
  ellipsis?: string
}

const DEFAULT_ELLIPSIS = '…'

const appendEllipsis = (value: string, ellipsis: string): string =>
  `${value.replace(/\s+$/u, '')}${ellipsis}`

export const truncateText = (
  value: string | null | undefined,
  options: TruncateTextOptions = {},
): string => {
  if (value == null) {
    return ''
  }

  const source = value.trim()
  if (source.length === 0) {
    return ''
  }

  const ellipsis = options.ellipsis ?? DEFAULT_ELLIPSIS
  const maxLines = options.maxLines
  const maxChars = options.maxChars

  let output = source
  let wasLineTruncated = false

  if (typeof maxLines === 'number' && Number.isFinite(maxLines)) {
    if (maxLines <= 0) {
      return ''
    }

    const lines = output.split(/\r?\n/u)
    if (lines.length > maxLines) {
      output = lines.slice(0, maxLines).join('\n')
      wasLineTruncated = true
    }
  }

  if (typeof maxChars === 'number' && Number.isFinite(maxChars)) {
    if (maxChars <= 0) {
      return ''
    }

    if (output.length > maxChars) {
      const truncatedLength = Math.max(0, maxChars - ellipsis.length)
      return appendEllipsis(output.slice(0, truncatedLength), ellipsis)
    }
  }

  return wasLineTruncated ? appendEllipsis(output, ellipsis) : output
}
