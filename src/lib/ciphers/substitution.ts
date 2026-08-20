import type { Cipher, CipherResult, Step, Mapping } from '../types'
import { cleanText, parseKeyWithNumbers, ALPHABET } from '../utils/string'

export const SubstitutionCipher: Cipher = {
  id: 'substitution',
  name: 'Substitution',
  encrypt(text: string, key: any): CipherResult {
    const mapStr = typeof key === 'string' ? key : key?.map ?? ''
    return runSubstitution(text, mapStr, false)
  },
  decrypt(text: string, key: any): CipherResult {
    const mapStr = typeof key === 'string' ? key : key?.map ?? ''
    return runSubstitution(text, mapStr, true)
  },
}

function runSubstitution(text: string, keyMap: string, decrypt: boolean): CipherResult {
  const s = cleanText(text)
  const steps: Step[] = []

  // Extract only letters A-Z from the key, keep '.' as identity marker
  const rawKey = parseKeyWithNumbers(keyMap).toUpperCase().replace(/[^A-Z.]/g, '')
  const keyLetters = rawKey.split('')

  // Build forward mapping:
  // - if a position is defined and not '.', use that letter
  // - if it's '.' or missing, map to the plaintext letter itself (identity)
  const fwd: Record<string, string> = {}
  for (let i = 0; i < 26; i++) {
    const plain = ALPHABET[i]
    let mapped = (i < keyLetters.length) ? keyLetters[i] : plain
    if (mapped === '.') mapped = plain  // identity placeholder
    fwd[plain] = mapped
  }

  // Build reverse mapping: ciphertext -> plaintext
  // For identity mappings, we include them explicitly so decryption works correctly.
  const rev: Record<string, string> = {}
  for (const plain of ALPHABET) {
    const cipher = fwd[plain]
    // If two plaintext letters map to the same cipher, keep the first mapping.
    if (!rev[cipher]) {
      rev[cipher] = plain
    }
  }

  const use = decrypt ? rev : fwd
  const mode = decrypt ? 'Decrypt' : 'Encrypt'

  steps.push({ type: 'info', label: 'Input', detail: `"${text}" → cleaned: "${s}"` })
  steps.push({ type: 'info', label: 'Key', detail: `Substitution mapping (${mode})` })

  // Show non‑identity mappings only
  const mappingsDisplay = ALPHABET.split('')
    .map(c => {
      const mapped = fwd[c]
      return (mapped !== c) ? `${c}→${mapped}` : null
    })
    .filter(Boolean)
    .join('  ')
  steps.push({ type: 'info', label: 'Mapping', detail: mappingsDisplay || 'all identity' })

  const mappings: Mapping[] = []
  let result = ''
  for (const c of s) {
    const mapped = use[c] || c   // fallback to original if not found (shouldn't happen)
    mappings.push({ char: c, newChar: mapped, formula: `${c} → ${mapped}` })
    result += mapped
  }

  steps.push({
    type: 'mappings',
    label: 'Character mapping',
    mappings,
    detail: mappings.map(m => m.formula).join('  |  '),
  })
  steps.push({ type: 'result', label: 'Result', detail: result })

  return { result, steps }
}