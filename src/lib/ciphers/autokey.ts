import type { Cipher, CipherResult, Step, Mapping } from '../types'
import { mod } from '../utils/math'
import { cleanText, parseKeyWithNumbers } from '../utils/string'

export const AutokeyCipher: Cipher = {
  id: 'autokey',
  name: 'Autokey',
  encrypt(text: string, key: any): CipherResult {
    const keyStr = typeof key === 'string' ? key : key?.key ?? 'SECRET'
    return runAutokey(text, keyStr, false)
  },
  decrypt(text: string, key: any): CipherResult {
    const keyStr = typeof key === 'string' ? key : key?.key ?? 'SECRET'
    return runAutokey(text, keyStr, true)
  },
}

function runAutokey(text: string, key: string, decrypt: boolean): CipherResult {
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
  const plainNums = s.split('').map(c => c.charCodeAt(0) - 65)

  steps.push({ type: 'info', label: 'Input', detail: `"${text}" → cleaned: "${s}"` })
  steps.push({
    type: 'info',
    label: 'Key',
    detail: `"${key}" → parsed: "${k}" (${keyNums.join(',')}) (${mode})`,
  })
  steps.push({
    type: 'info',
    label: 'Mode',
    detail: `Autokey ${mode} — key extends with ${decrypt ? 'ciphertext' : 'plaintext'}`,
  })

  const mappings: Mapping[] = []
  let result = ''
  const fullKey = [...keyNums]

  if (decrypt) {
    for (let i = 0; i < plainNums.length; i++) {
      const shift = fullKey[i] !== undefined ? fullKey[i] : plainNums[i - keyNums.length]
      const p = mod(plainNums[i] - shift)
      const newChar = String.fromCharCode(p + 65)
      const keyChar = String.fromCharCode(shift + 65)
      mappings.push({
        char: s[i],
        newChar,
        formula: `${s[i]}(${plainNums[i]}) - ${shift}(${keyChar}) = ${p} → ${newChar}`,
      })
      result += newChar
      if (i >= keyNums.length) fullKey.push(p)
    }
  } else {
    for (let i = 0; i < plainNums.length; i++) {
      const shift = fullKey[i] !== undefined ? fullKey[i] : plainNums[i - keyNums.length]
      const c = mod(plainNums[i] + shift)
      const newChar = String.fromCharCode(c + 65)
      const keyChar = String.fromCharCode(shift + 65)
      mappings.push({
        char: s[i],
        newChar,
        formula: `${s[i]}(${plainNums[i]}) + ${shift}(${keyChar}) = ${c} → ${newChar}`,
      })
      result += newChar
      if (i >= keyNums.length) fullKey.push(plainNums[i])
    }
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
