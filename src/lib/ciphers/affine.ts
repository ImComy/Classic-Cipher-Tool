import type { Cipher, CipherResult, Step, Mapping } from '../types'
import { mod, gcd, modInvWithSteps } from '../utils/math'
import { cleanText } from '../utils/string'

export const AffineCipher: Cipher = {
  id: 'affine',
  name: 'Affine',
  encrypt(text: string, key: any): CipherResult {
    const a = parseInt(key?.a ?? 5, 10)
    const b = parseInt(key?.b ?? 3, 10)
    return runAffine(text, a, b, false)
  },
  decrypt(text: string, key: any): CipherResult {
    const a = parseInt(key?.a ?? 5, 10)
    const b = parseInt(key?.b ?? 3, 10)
    return runAffine(text, a, b, true)
  },
}

function runAffine(text: string, a: number, b: number, decrypt: boolean): CipherResult {
  const s = cleanText(text)
  const steps: Step[] = []
  const mode = decrypt ? 'Decrypt' : 'Encrypt'
  const g = gcd(a, 26)

  steps.push({ type: 'info', label: 'Input', detail: `"${text}" → cleaned: "${s}"` })
  steps.push({ type: 'info', label: 'Key', detail: `a = ${a},  b = ${b}` })

  // GCD check with breakdown
  steps.push({
    type: 'calc-detail',
    label: `GCD Check — gcd(${a}, 26)`,
    lines: buildGcdLines(a, 26, g),
  })

  if (g !== 1) {
    steps.push({ type: 'error', label: 'Invalid Key', detail: `gcd(${a}, 26) = ${g} ≠ 1 — a must be coprime to 26.` })
    return { result: 'ERROR: gcd(a,26) must be 1', steps }
  }

  // Extended Euclidean table for a⁻¹
  const invResult = modInvWithSteps(a)
  const invA = invResult.inverse
  if (invA === -1) {
    steps.push({ type: 'error', label: 'Error', detail: `No inverse for a=${a} mod 26.` })
    return { result: 'ERROR: no inverse', steps }
  }

  if (decrypt) {
    steps.push({
      type: 'table',
      label: `Modular Inverse: ${a}⁻¹ mod 26 — Extended Euclidean Algorithm`,
      tableData: invResult.steps,
      extra: `${a}⁻¹ mod 26 = ${invA}   (check: ${a} × ${invA} = ${a * invA} ≡ ${(a * invA) % 26} mod 26)`,
    })
  }

  const formula = decrypt
    ? `D(y) = ${invA} · (y − ${b}) mod 26`
    : `E(x) = ${a} · x + ${b} mod 26`
  steps.push({ type: 'info', label: `Formula (${mode})`, detail: formula })

  const mappings: Mapping[] = []
  let result = ''
  for (const c of s) {
    const x = c.charCodeAt(0) - 65
    const y = decrypt ? mod(invA * (x - b)) : mod(a * x + b)
    const newChar = String.fromCharCode(y + 65)
    const formulaStr = decrypt
      ? `${c}(${x}) → ${invA}·(${x} − ${b}) = ${invA * (x - b)} ≡ ${y} → ${newChar}`
      : `${c}(${x}) → ${a}·${x} + ${b} = ${a * x + b} ≡ ${y} → ${newChar}`
    mappings.push({ char: c, newChar, formula: formulaStr, idx: x, newIdx: y })
    result += newChar
  }

  steps.push({
    type: 'mappings',
    label: 'Character Mapping',
    mappings,
    detail: mappings.map(m => m.formula).join('  |  '),
  })
  steps.push({ type: 'result', label: 'Result', detail: result })

  return { result, steps }
}

/** Build Euclidean algorithm lines for gcd(a, b). */
function buildGcdLines(a: number, b: number, result: number): string[] {
  const lines: string[] = []
  let x = Math.abs(a), y = Math.abs(b)
  lines.push(`gcd(${a}, 26):`)
  while (y !== 0) {
    const q = Math.floor(x / y)
    const r = x % y
    lines.push(`  ${x} = ${q} · ${y} + ${r}`)
    x = y
    y = r
  }
  lines.push(`→ gcd = ${result}${result === 1 ? '  ✓ coprime to 26' : '  ✗ NOT coprime — key invalid'}`)
  return lines
}
