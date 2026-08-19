import type { Cipher, CipherResult, Step, Mapping } from '../types'
import { mod } from '../utils/math'
import { cleanText, parseKeyWithNumbers } from '../utils/string'

export const VigenereCipher: Cipher = {
  id: 'vigenere',
  name: 'Vigenère',
  encrypt(text: string, key: any): CipherResult {
    const keyStr = typeof key === 'string' ? key : key?.key ?? 'KEY'
    return runVigenere(text, keyStr, false)
  },
  decrypt(text: string, key: any): CipherResult {
    const keyStr = typeof key === 'string' ? key : key?.key ?? 'KEY'
    return runVigenere(text, keyStr, true)
  },
}

function runVigenere(text: string, key: string, decrypt: boolean): CipherResult {
  const s = cleanText(text)
  const steps: Step[] = []
  const mode = decrypt ? 'Decrypt' : 'Encrypt'
  const parsed = parseKeyWithNumbers(key)
  const k = cleanText(parsed)

  if (!k) {
    steps.push({ type: 'error', label: 'Error', detail: 'Key cannot be empty.' })
    return { result: 'ERROR: key required', steps }
  }

  const keyNums = k.split('').map(c => c.charCodeAt(0) - 65)
  steps.push({ type: 'info', label: 'Input', detail: `"${text}" → cleaned: "${s}"` })
  steps.push({
    type: 'info',
    label: 'Key',
    detail: `"${key}" → parsed: "${k}" (${keyNums.join(',')}) (${mode})`,
  })

  const formula = decrypt ? 'Pᵢ = (Cᵢ - Kᵢ) mod 26' : 'Cᵢ = (Pᵢ + Kᵢ) mod 26'
  steps.push({ type: 'info', label: 'Formula', detail: formula })

  const mappings: Mapping[] = []
  let result = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    const x = c.charCodeAt(0) - 65
    const shift = keyNums[i % keyNums.length]
    const y = decrypt ? mod(x - shift) : mod(x + shift)
    const newChar = String.fromCharCode(y + 65)
    const op = decrypt ? '-' : '+'
    const ki = keyNums[i % keyNums.length]
    const keyChar = k[i % k.length]

    mappings.push({
      char: c,
      newChar,
      formula: `${c}(${x}) ${op} ${ki}(${keyChar}) = ${y} → ${newChar}`,
    })
    result += newChar
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
