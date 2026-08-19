import type { Cipher, CipherResult, Step, Mapping } from '../types'
import { mod } from '../utils/math'
import { cleanText } from '../utils/string'

export const ShiftCipher: Cipher = {
  id: 'shift',
  name: 'Shift (Caesar)',
  encrypt(text: string, key: any): CipherResult {
    const k = typeof key === 'number' ? key : key?.k ?? 0
    return runShift(text, k, false)
  },
  decrypt(text: string, key: any): CipherResult {
    const k = typeof key === 'number' ? key : key?.k ?? 0
    return runShift(text, k, true)
  },
}

function runShift(text: string, k: number, decrypt: boolean): CipherResult {
  const s = cleanText(text)
  const steps: Step[] = []
  const mode = decrypt ? 'Decrypt' : 'Encrypt'
  const shift = decrypt ? -k : k

  steps.push({ type: 'info', label: 'Input', detail: `"${text}" → cleaned: "${s}"` })
  steps.push({ type: 'info', label: 'Key', detail: `Shift k = ${k} (${mode})` })
  steps.push({
    type: 'info',
    label: 'Formula',
    detail: `E(x) = (x + ${k}) mod 26` + (decrypt ? `  |  D(y) = (y - ${k}) mod 26` : ''),
  })

  const mappings: Mapping[] = []
  let result = ''
  for (const c of s) {
    const idx = c.charCodeAt(0) - 65
    const newIdx = mod(idx + shift)
    const newChar = String.fromCharCode(newIdx + 65)
    mappings.push({
      char: c,
      idx,
      newIdx,
      newChar,
      formula: `${c}(${idx}) ${shift >= 0 ? '+' : ''}${shift} = ${newChar}(${newIdx})`,
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
