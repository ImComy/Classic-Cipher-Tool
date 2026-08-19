import { cleanText } from './string'

const ENGLISH_FREQ = [
  0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228, 0.02015, 0.06094, 0.06966, 0.00153, 0.00772,
  0.04025, 0.02406, 0.06749, 0.07507, 0.01929, 0.00095, 0.05987, 0.06327, 0.09056, 0.02758, 0.00978,
  0.02360, 0.00150, 0.01974, 0.00074,
]

function getIC(text: string): number {
  if (text.length <= 1) return 0
  const counts = new Array(26).fill(0)
  for (let i = 0; i < text.length; i++) {
    counts[text.charCodeAt(i) - 65]++
  }
  let sum = 0
  for (const c of counts) {
    sum += c * (c - 1)
  }
  return sum / (text.length * (text.length - 1))
}

export function crackVigenere(ciphertext: string, maxKeyLen = 20): string {
  const s = cleanText(ciphertext)
  if (s.length < 5) return 'KEY'

  // Step 1: Guess key length using average IC
  let bestKeyLen = 1
  let bestAvgIC = 0

  for (let len = 1; len <= Math.min(maxKeyLen, s.length / 2); len++) {
    let sumIC = 0
    for (let i = 0; i < len; i++) {
      let bucket = ''
      for (let j = i; j < s.length; j += len) {
        bucket += s[j]
      }
      sumIC += getIC(bucket)
    }
    const avgIC = sumIC / len
    
    if (avgIC > bestAvgIC) {
      bestAvgIC = avgIC
      bestKeyLen = len
    }

    // Stop early if we hit a strong English IC (around 0.066)
    if (avgIC > 0.06) {
      bestKeyLen = len
      break
    }
  }

  // Step 2: For each position in the key, find shift that maximizes dot product with English freq
  let key = ''
  for (let i = 0; i < bestKeyLen; i++) {
    let bucket = ''
    for (let j = i; j < s.length; j += bestKeyLen) {
      bucket += s[j]
    }

    let bestShift = 0
    let bestScore = -Infinity

    for (let shift = 0; shift < 26; shift++) {
      const counts = new Array(26).fill(0)
      for (let j = 0; j < bucket.length; j++) {
        const decryptedChar = (bucket.charCodeAt(j) - 65 - shift + 26) % 26
        counts[decryptedChar]++
      }

      let score = 0
      for (let j = 0; j < 26; j++) {
        score += (counts[j] / bucket.length) * ENGLISH_FREQ[j]
      }

      if (score > bestScore) {
        bestScore = score
        bestShift = shift
      }
    }
    key += String.fromCharCode(bestShift + 65)
  }

  return key
}
