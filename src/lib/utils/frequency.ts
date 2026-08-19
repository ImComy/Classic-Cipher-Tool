import { cleanText } from './string'

export const ENGLISH_FREQ: Record<string, number> = {
  A: 8.17,
  B: 1.49,
  C: 2.78,
  D: 4.25,
  E: 12.7,
  F: 2.23,
  G: 2.02,
  H: 6.09,
  I: 6.97,
  J: 0.15,
  K: 0.77,
  L: 4.03,
  M: 2.41,
  N: 6.75,
  O: 7.51,
  P: 1.93,
  Q: 0.1,
  R: 5.99,
  S: 6.33,
  T: 9.06,
  U: 2.76,
  V: 0.98,
  W: 2.36,
  X: 0.15,
  Y: 1.97,
  Z: 0.07,
}

export interface FrequencyAnalysisResult {
  counts: Record<string, number>
  total: number
  unique: number
  mostCommon: string
  ic: number
  percentages: Record<string, number>
  kasiski: KasiskiAnalysisResult
}

export interface KasiskiScore {
  length: number
  score: number
  matches: number
  kasiskiScore: number
  averageIC: number
}

export interface KasiskiAnalysisResult {
  scores: KasiskiScore[]
  recommendedLength: number | null
  repeatedSequences: number
}

function computeKasiski(text: string): KasiskiAnalysisResult {
  const maxKeyLength = Math.max(1, Math.floor(text.length / 2))
  const sequences = new Map<string, { length: number; positions: number[] }>()
  for (let sequenceLength = 3; sequenceLength <= 5; sequenceLength++) {
    for (let index = 0; index <= text.length - sequenceLength; index++) {
      const sequence = text.slice(index, index + sequenceLength)
      const sequenceKey = `${sequenceLength}:${sequence}`
      const group = sequences.get(sequenceKey) || { length: sequenceLength, positions: [] }
      group.positions.push(index)
      sequences.set(sequenceKey, group)
    }
  }

  const scores = Array.from({ length: maxKeyLength }, (_, index) => ({
    length: index + 1,
    score: 0,
    matches: 0,
    kasiskiScore: 0,
    averageIC: 0,
  }))
  let repeatedSequences = 0

  for (const group of sequences.values()) {
    const { length: sequenceLength, positions } = group
    if (positions.length < 2) continue
    repeatedSequences++
    for (let first = 0; first < positions.length - 1; first++) {
      for (let second = first + 1; second < positions.length; second++) {
        const distance = positions[second] - positions[first]
        for (const candidate of scores) {
          if (distance % candidate.length === 0) {
            candidate.kasiskiScore += sequenceLength - 2
            candidate.matches++
          }
        }
      }
    }
  }

  for (const candidate of scores) {
    const columns: Record<string, number>[] = Array.from(
      { length: candidate.length },
      () => ({})
    )
    for (let index = 0; index < text.length; index++) {
      const column = columns[index % candidate.length]
      const character = text[index]
      column[character] = (column[character] || 0) + 1
    }

    const columnIC = columns.map(column => {
      const columnTotal = Object.values(column).reduce((sum, count) => sum + count, 0)
      const coincidenceCount = Object.values(column).reduce(
        (sum, count) => sum + count * (count - 1),
        0
      )
      return columnTotal > 1 ? coincidenceCount / (columnTotal * (columnTotal - 1)) : 0
    })
    candidate.averageIC = columnIC.reduce((sum, value) => sum + value, 0) / columnIC.length
  }

  const maxKasiskiScore = Math.max(...scores.map(candidate => candidate.kasiskiScore), 1)
  for (const candidate of scores) {
    const kasiskiEvidence = candidate.kasiskiScore / maxKasiskiScore
    const columnSize = text.length / candidate.length
    const reliability = Math.min(1, Math.max(0, (columnSize - 2) / 8))
    const icDistance = Math.abs(candidate.averageIC - 0.066)
    const icEvidence = Math.exp(-icDistance / 0.018) * reliability
    candidate.score = kasiskiEvidence * 0.45 + icEvidence * 0.55
  }

  const strongest = scores.reduce<KasiskiScore | null>(
    (best, candidate) => (candidate.score > (best?.score || -1) ? candidate : best),
    null
  )

  const recommended = strongest
    ? scores
        .filter(candidate => candidate.score >= strongest.score * 0.9)
        .sort((left, right) => left.length - right.length)[0]
    : null

  return {
    scores,
    recommendedLength: recommended?.length || null,
    repeatedSequences,
  }
}

export function computeFrequency(text: string): FrequencyAnalysisResult {
  const cleaned = cleanText(text)
  const total = cleaned.length
  const counts: Record<string, number> = {}

  for (const c of cleaned) {
    counts[c] = (counts[c] || 0) + 1
  }

  const unique = Object.keys(counts).length
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const mostCommon = sorted.length > 0 ? sorted[0][0] : '—'

  let sum = 0
  for (const c in counts) {
    const n = counts[c]
    sum += n * (n - 1)
  }

  const ic = total > 1 ? sum / (total * (total - 1)) : 0

  const percentages: Record<string, number> = {}
  for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    percentages[c] = total > 0 ? ((counts[c] || 0) / total) * 100 : 0
  }

  return {
    counts,
    total,
    unique,
    mostCommon,
    ic,
    percentages,
    kasiski: computeKasiski(cleaned),
  }
}