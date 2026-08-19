import type { Cipher, CipherResult, Step } from '../types'
import { cleanText } from '../utils/string'

export const PermutationCipher: Cipher = {
  id: 'permutation',
  name: 'Permutation',
  encrypt(text: string, key: any): CipherResult {
    const perm = typeof key === 'string' ? key : key?.perm ?? '2,4,1,3'
    return runPermutation(text, perm, false)
  },
  decrypt(text: string, key: any): CipherResult {
    const perm = typeof key === 'string' ? key : key?.perm ?? '2,4,1,3'
    return runPermutation(text, perm, true)
  },
}

function runPermutation(text: string, perm: string, decrypt: boolean): CipherResult {
  const s = cleanText(text)
  const steps: Step[] = []
  const mode = decrypt ? 'Decrypt' : 'Encrypt'

  const p = perm
    .split(',')
    .map(Number)
    .filter(n => !isNaN(n) && n > 0)

  if (p.length === 0) {
    steps.push({ type: 'error', label: 'Error', detail: 'Invalid permutation.' })
    return { result: 'ERROR: invalid permutation', steps }
  }

  const len = p.length
  const sorted = [...p].sort((a, b) => a - b)
  if (sorted[sorted.length - 1] !== len || new Set(sorted).size !== len) {
    steps.push({ type: 'error', label: 'Error', detail: 'Permutation must be 1..n unique.' })
    return { result: 'ERROR: permutation must be 1..n unique', steps }
  }

  const pad = (len - (s.length % len)) % len
  const padded = s + 'X'.repeat(pad)
  steps.push({ type: 'info', label: 'Input', detail: `"${text}" → cleaned: "${s}"` })
  steps.push({ type: 'info', label: 'Key', detail: `Permutation: [${p.join(', ')}] (${mode})` })
  steps.push({
    type: 'info',
    label: 'Padding',
    detail: `Padded to length ${padded.length} (added ${pad} X's)`,
  })

  const order = decrypt ? p : p.map((_, i) => i + 1)
  const blocks: any[] = []
  let result = ''

  for (let i = 0; i < padded.length; i += len) {
    const block = padded.slice(i, i + len).split('')
    const out = new Array(len)
    for (let j = 0; j < len; j++) {
      const pos = decrypt ? order[j] - 1 : order.indexOf(j + 1)
      out[j] = block[pos] || 'X'
    }
    const outStr = out.join('')
    blocks.push({
      original: block.join(''),
      reordered: outStr,
      mapping: decrypt
        ? `positions ${order.join(',')} → ${outStr}`
        : `[${block.join(',')}] → [${outStr}]`,
    })
    result += outStr
  }

  steps.push({ type: 'perm-blocks', label: 'Block reordering', blocks })
  steps.push({ type: 'result', label: 'Result', detail: result })

  return { result, steps }
}
