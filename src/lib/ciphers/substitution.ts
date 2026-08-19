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
  const parsed = parseKeyWithNumbers(keyMap)
  const clean = parsed.toUpperCase().replace(/[^A-Z]/g, '')

  if (clean.length !== 26 || new Set(clean).size !== 26) {
    steps.push({ type: 'error', label: 'Error', detail: 'Key must be 26 unique letters.' })
    return { result: 'ERROR: invalid key (must be 26 unique letters)', steps }
  }

  const fwd: Record<string, string> = {}
  const rev: Record<string, string> = {}
  for (let i = 0; i < 26; i++) {
    fwd[ALPHABET[i]] = clean[i]
    rev[clean[i]] = ALPHABET[i]
  }

  const use = decrypt ? rev : fwd
  const mode = decrypt ? 'Decrypt' : 'Encrypt'

  steps.push({ type: 'info', label: 'Input', detail: `"${text}" → cleaned: "${s}"` })
  steps.push({ type: 'info', label: 'Key', detail: `Substitution mapping (${mode})` })
  const mapDisplay = ALPHABET.split('').map((c, i) => `${c}→${clean[i]}`).join('  ')
  steps.push({ type: 'info', label: 'Mapping', detail: mapDisplay })

  const mappings: Mapping[] = []
  let result = ''
  for (const c of s) {
    const mapped = use[c] || c
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
