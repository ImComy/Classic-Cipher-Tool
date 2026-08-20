import type { Cipher, CipherResult, Step } from '../types'
import {
  mod,
  gcd,
  modInvWithSteps,
  inverseMatrix,
  renderMatrixHTML,
  detWithSteps,
  adjWithSteps,
} from '../utils/math'
import { cleanText } from '../utils/string'

export const HillCipher: Cipher = {
  id: 'hill',
  name: 'Hill',
  encrypt(text: string, key: any): CipherResult {
    const matrix = key?.matrix || [
      [3, 2],
      [1, 4],
    ]
    return runHill(text, matrix, false)
  },
  decrypt(text: string, key: any): CipherResult {
    const matrix = key?.matrix || [
      [3, 2],
      [1, 4],
    ]
    return runHill(text, matrix, true)
  },
}

function runHill(text: string, matrix: number[][], decrypt: boolean): CipherResult {
  let s = cleanText(text)
  const steps: Step[] = []
  const mode = decrypt ? 'Decrypt' : 'Encrypt'
  const n = matrix.length

  if (s.length === 0) {
    steps.push({ type: 'error', label: 'Error', detail: 'Text cannot be empty.' })
    return { result: 'ERROR: text cannot be empty', steps }
  }

  if (s.length % n !== 0) {
    const padCount = n - (s.length % n)
    const padChar = 'X'
    s += padChar.repeat(padCount)
    steps.push({
      type: 'info',
      label: 'Padding Added',
      detail: `Input length was not a multiple of ${n}. Added ${padCount} '${padChar}'(s) to pad it.`,
    })
  }

  const m = matrix.map(row => row.map(v => mod(v)))
  steps.push({ type: 'info', label: 'Input', detail: `"${text}" → cleaned: "${s}" (length ${s.length})` })
  steps.push({ type: 'info', label: 'Matrix', detail: `K = ${n}×${n} matrix (${mode})` })

  // Show key matrix
  const matrixHtml = renderMatrixHTML(m)
  steps.push({ type: 'html', label: 'Key Matrix K', html: matrixHtml })

  // --- Determinant with step-by-step expansion ---
  const detResult = detWithSteps(m)
  const det = detResult.det
  steps.push({
    type: 'calc-detail',
    label: `Determinant — det(K)`,
    lines: detResult.lines,
  })

  const g = gcd(det, 26)
  steps.push({
    type: 'calc-detail',
    label: `GCD Check — gcd(det(K), 26) = gcd(${det}, 26)`,
    lines: buildGcdLines(det, 26, g),
  })

  let useMat: number[][]
  if (decrypt) {
    if (g !== 1) {
      steps.push({
        type: 'error',
        label: 'Error',
        detail: `Matrix not invertible mod 26 — gcd(${det}, 26) = ${g} ≠ 1.`,
      })
      return { result: 'ERROR: matrix not invertible mod 26', steps }
    }

    // EEA table for det⁻¹
    const invSteps = modInvWithSteps(det)
    if (invSteps.inverse !== -1) {
      steps.push({
        type: 'table',
        label: `Modular Inverse: det(K)⁻¹ mod 26 — Extended Euclidean Algorithm`,
        tableData: invSteps.steps,
        extra: `det(K)⁻¹ = ${invSteps.inverse}   (check: ${det} × ${invSteps.inverse} = ${det * invSteps.inverse} ≡ ${(det * invSteps.inverse) % 26} mod 26)`,
      })
    }

    // --- Adjugate with per-cell cofactor breakdown ---
    const adjResult = adjWithSteps(m)
    steps.push({
      type: 'calc-detail',
      label: `Cofactor Matrix — each cell Cᵢⱼ = (−1)^(i+j) · det(minor)`,
      lines: adjResult.lines,
    })

    const adjHtml = renderMatrixHTML(adjResult.adj)
    steps.push({ type: 'html', label: 'Adjugate Matrix Adj(K) = Cᵀ', html: adjHtml })

    const inv = inverseMatrix(m)
    if (!inv) {
      steps.push({ type: 'error', label: 'Error', detail: 'Failed to compute inverse.' })
      return { result: 'ERROR: no inverse', steps }
    }

    steps.push({
      type: 'info',
      label: 'Inverse Formula',
      detail: `K⁻¹ = det(K)⁻¹ · Adj(K) mod 26  =  ${invSteps.inverse} · Adj(K) mod 26`,
    })

    const invHtml = renderMatrixHTML(inv)
    steps.push({ type: 'html', label: 'Inverse Matrix K⁻¹', html: invHtml })
    useMat = inv
  } else {
    if (g !== 1) {
      steps.push({
        type: 'warn',
        label: 'Warning',
        detail: `det(K) = ${det} not coprime to 26 — encryption will work but decryption won't be possible.`,
      })
    }
    useMat = m
  }

  // Block-by-block multiplication
  const blocks: any[] = []
  let result = ''
  for (let i = 0; i < s.length; i += n) {
    const block = s.slice(i, i + n).split('').map(c => c.charCodeAt(0) - 65)
    const out = Array(n).fill(0)
    const calcLines: string[] = []

    for (let r = 0; r < n; r++) {
      let sum = 0
      const terms: string[] = []
      for (let c = 0; c < n; c++) {
        const val = useMat[r][c] * block[c]
        sum += val
        terms.push(`${useMat[r][c]}·${block[c]}`)
      }
      const modSum = mod(sum)
      out[r] = modSum
      calcLines.push(
        `row ${r + 1}: ${terms.join(' + ')} = ${sum} ≡ ${modSum} mod 26 → ${String.fromCharCode(modSum + 65)}`
      )
    }

    const outStr = out.map(v => String.fromCharCode(v + 65)).join('')
    blocks.push({
      block: block.join(','),
      chars: s.slice(i, i + n),
      outChars: outStr,
      calcLines,
    })
    result += outStr
  }

  steps.push({
    type: 'hill-blocks',
    label: `Block Multiplication — each ${n}-letter block × K${decrypt ? '⁻¹' : ''}`,
    blocks,
    detail: `Each ${n}-letter block multiplied by K${decrypt ? '⁻¹' : ''}`,
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
  lines.push(`→ gcd = ${result}${result === 1 ? '  ✓ invertible mod 26' : '  ✗ NOT invertible mod 26'}`)
  return lines
}
