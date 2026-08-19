export const MOD = 26

export function mod(n: number): number {
  return ((n % MOD) + MOD) % MOD
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

export function modInv(a: number, m: number = MOD): number {
  a = mod(a)
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x
  }
  return -1
}

export interface EuclideanStep {
  step: number
  q: number | null
  r1: number
  r2: number
  r: number | null
  t1: number
  t2: number
  t: number | null
}

export function modInvWithSteps(a: number, m: number = MOD): { inverse: number; steps: EuclideanStep[] } {
  a = ((a % m) + m) % m
  if (a === 0) return { inverse: -1, steps: [] }
  let r1 = m,
    r2 = a,
    t1 = 0,
    t2 = 1
  const steps: EuclideanStep[] = []
  steps.push({ step: 0, q: null, r1, r2, r: null, t1, t2, t: null })
  let i = 1
  while (r2 !== 0) {
    const q = Math.floor(r1 / r2)
    const r = r1 - q * r2
    const t = t1 - q * t2
    steps.push({ step: i, q, r1, r2, r, t1, t2, t })
    r1 = r2
    r2 = r
    t1 = t2
    t2 = t
    i++
  }
  steps.push({ step: i, q: null, r1, r2, r: null, t1, t2, t: null })
  const inv = ((t1 % m) + m) % m
  return { inverse: inv, steps }
}

export function cloneMatrix(m: number[][]): number[][] {
  return m.map(row => [...row])
}

export function getMinor(mat: number[][], row: number, col: number): number[][] {
  return mat.filter((_, i) => i !== row).map(r => r.filter((_, j) => j !== col))
}

export function detMatrix(mat: number[][]): number {
  const n = mat.length
  if (n === 1) return mod(mat[0][0])
  if (n === 2) return mod(mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0])
  let det = 0
  for (let c = 0; c < n; c++) {
    const minor = getMinor(mat, 0, c)
    const sign = c % 2 === 0 ? 1 : -1
    det += sign * mat[0][c] * detMatrix(minor)
  }
  return mod(det)
}

export function cofactorMatrix(mat: number[][]): number[][] {
  const n = mat.length
  const cof = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = getMinor(mat, i, j)
      const sign = (i + j) % 2 === 0 ? 1 : -1
      cof[i][j] = mod(sign * detMatrix(minor))
    }
  }
  return cof
}

export function adjugateMatrix(mat: number[][]): number[][] {
  const cof = cofactorMatrix(mat)
  const n = mat.length
  const adj = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      adj[i][j] = cof[j][i]
    }
  }
  return adj
}

export function inverseMatrix(mat: number[][]): number[][] | null {
  const det = detMatrix(mat)
  if (det === -1 || gcd(det, 26) !== 1) return null
  const invDet = modInv(det)
  if (invDet === -1) return null
  const adj = adjugateMatrix(mat)
  const n = mat.length
  const inv = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      inv[i][j] = mod(adj[i][j] * invDet)
    }
  }
  return inv
}

/** Returns the determinant along with human-readable expansion steps. */
export function detWithSteps(mat: number[][]): { det: number; lines: string[] } {
  const n = mat.length
  const lines: string[] = []

  if (n === 1) {
    const d = mod(mat[0][0])
    lines.push(`det = ${mat[0][0]} ≡ ${d} mod 26`)
    return { det: d, lines }
  }

  if (n === 2) {
    const a = mat[0][0], b = mat[0][1]
    const c = mat[1][0], d = mat[1][1]
    const raw = a * d - b * c
    const result = mod(raw)
    lines.push(`det(K) = (${a}·${d}) − (${b}·${c})`)
    lines.push(`       = ${a * d} − ${b * c}`)
    lines.push(`       = ${raw} ≡ ${result} mod 26`)
    return { det: result, lines }
  }

  // General: cofactor expansion along row 0
  const terms: string[] = []
  let total = 0
  for (let col = 0; col < n; col++) {
    const sign = col % 2 === 0 ? 1 : -1
    const signStr = sign === 1 ? '+' : '−'
    const minor = getMinor(mat, 0, col)
    const minorDet = detMatrix(minor)
    const contribution = sign * mat[0][col] * minorDet
    total += contribution
    const minorRows = minor.map(row => `[${row.join(',')}]`).join('')
    terms.push(`  ${signStr} ${mat[0][col]}·M₀${col} (minor=${minorRows}, det=${minorDet}, term=${contribution})`)
  }
  lines.push(`Cofactor expansion along row 1:`)
  lines.push(...terms)
  const result = mod(total)
  lines.push(`Sum = ${total} ≡ ${result} mod 26`)
  return { det: result, lines }
}

/** Returns the adjugate matrix along with per-cell cofactor detail strings. */
export function adjWithSteps(mat: number[][]): { adj: number[][]; lines: string[] } {
  const n = mat.length
  const lines: string[] = []
  const cof = Array.from({ length: n }, () => Array(n).fill(0))

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = getMinor(mat, i, j)
      const sign = (i + j) % 2 === 0 ? 1 : -1
      const signStr = sign === 1 ? '+' : '−'
      const minorDet = detMatrix(minor)
      const cofVal = mod(sign * minorDet)
      cof[i][j] = cofVal
      const minorRows = minor.map(row => `[${row.join(',')}]`).join('')
      lines.push(`C(${i+1},${j+1}) = ${signStr}det(${minorRows}) = ${signStr}${minorDet} ≡ ${cofVal} mod 26`)
    }
  }

  // Transpose cofactor matrix to get adjugate
  const adj = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      adj[i][j] = cof[j][i]
    }
  }

  lines.push(`Adj(K) = Cᵀ (transpose of cofactor matrix)`)
  return { adj, lines }
}

export function renderMatrixHTML(mat: number[][]): string {
  const n = mat.length
  let html = `<div class="step-matrix-wrap"><div class="step-matrix" style="grid-template-columns: repeat(${n}, auto); gap: 0.1rem;">`
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const val = mod(mat[r][c])
      html += `<span class="cell">${val}</span>`
    }
  }
  html += '</div></div>'
  return html
}