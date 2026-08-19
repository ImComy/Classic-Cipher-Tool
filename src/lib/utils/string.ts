export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function formatSessionName(timestamp = Date.now()): string {
  return new Date(timestamp).toLocaleString()
}

export function cleanText(text: string): string {
  if (!text) return ''
  return text.toUpperCase().replace(/[^A-Z]/g, '')
}

export function parseKeyWithNumbers(str: string): string {
  if (!str || typeof str !== 'string') return ''
  const upper = str.toUpperCase()
  if (/^[A-Z]+$/.test(upper)) return upper
  let result = ''
  let i = 0
  const len = upper.length
  while (i < len) {
    const ch = upper[i]
    if (ch >= '0' && ch <= '9') {
      if (i + 1 < len && upper[i + 1] >= '0' && upper[i + 1] <= '9') {
        const twoDigit = parseInt(upper.substring(i, i + 2), 10)
        if (twoDigit >= 0 && twoDigit <= 25) {
          result += String.fromCharCode(twoDigit + 65)
          i += 2
          continue
        }
      }
      const digit = parseInt(ch, 10)
      if (digit >= 0 && digit <= 25) result += String.fromCharCode(digit + 65)
      i++
    } else if (ch >= 'A' && ch <= 'Z') {
      result += ch
      i++
    } else {
      i++
    }
  }
  return result
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}