import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import {
  mod,
  detMatrix,
  gcd,
  adjugateMatrix,
  inverseMatrix,
  cofactorMatrix,
  modInv,
} from '../../lib/utils/math'

export const HillMatrixTool: React.FC = () => {
  const [size, setSize] = useState(3)
  const [matrix, setMatrix] = useState<number[][]>([
    [3, 2, 1],
    [1, 7, 2],
    [2, 3, 5],
  ])
  const [mode, setMode] = useState<'det' | 'adj' | 'inverse' | 'all'>('all')

  const handleSizeChange = (newSize: number) => {
    const s = Math.max(2, Math.min(10, newSize))
    setSize(s)
    const newMat: number[][] = Array.from({ length: s }, (_, r) =>
      Array.from({ length: s }, (_, c) => {
        return matrix[r] && matrix[r][c] !== undefined ? matrix[r][c] : r === c ? 1 : 0
      })
    )
    setMatrix(newMat)
  }

  const handleCellChange = (r: number, c: number, valStr: string) => {
    const val = parseInt(valStr, 10)
    const newMat = matrix.map((row, rowIdx) =>
      row.map((cell, colIdx) => (rowIdx === r && colIdx === c ? (isNaN(val) ? 0 : mod(val)) : cell))
    )
    setMatrix(newMat)
  }

  const handleRandom = () => {
    let candidate: number[][] = []
    let det = 0
    let attempts = 0
    do {
      candidate = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.floor(Math.random() * 26))
      )
      det = detMatrix(candidate)
      attempts++
    } while ((det === -1 || gcd(det, 26) !== 1) && attempts < 300)

    if (det !== -1 && gcd(det, 26) === 1) {
      setMatrix(candidate)
    } else {
      setMatrix(
        Array.from({ length: size }, (_, r) =>
          Array.from({ length: size }, (_, c) => (r === c ? 1 : 0))
        )
      )
    }
  }

  const renderMatrixDisplay = (mat: number[][], label: string) => {
    const n = mat.length
    return (
      <div className="mt-2">
        <div className="font-semibold text-gray-700 mb-1">{label}</div>
        <div className="hill-matrix-wrapper">
          <div
            className="hill-matrix-inner"
            style={{ gridTemplateColumns: `repeat(${n}, auto)`, gap: '0.2rem' }}
          >
            {mat.map((row, r) =>
              row.map((cell, c) => (
                <span
                  key={`${r}-${c}`}
                  className="px-2 py-0.5 text-center font-mono text-sm bg-white border border-gray-200 rounded"
                >
                  {mod(cell)}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  const det = detMatrix(matrix)
  const gcdVal = gcd(det, 26)
  const adj = adjugateMatrix(matrix)
  const inv = inverseMatrix(matrix)
  const cof = cofactorMatrix(matrix)
  const invDet = modInv(det)

  return (
    <div className="bg-gray-50 rounded p-4 border border-gray-200 md:col-span-2">
      <div className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
        <i className="fas fa-matrix text-primary-400"></i> Hill Matrix Utilities (mod 26)
      </div>
      <div className="text-sm text-gray-500 mb-2">
        Compute <code>det(K)</code>, <code>Adj(K)</code>, and <code>K⁻¹</code>.
      </div>

      <div className="w-full">
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <label className="text-sm font-semibold text-gray-600">Matrix dimension (n×n):</label>
          <input
            type="number"
            id="hillToolMatrixSize"
            value={size}
            onChange={e => handleSizeChange(parseInt(e.target.value, 10) || 2)}
            min={2}
            max={10}
            className="w-[60px] px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
          <span className="text-sm text-gray-600">
            × <span id="hillToolMatrixSizeDisplay">{size}</span>
          </span>
          <Button variant="accent" size="xs" onClick={handleRandom} id="hillMatrixRandomBtn">
            <i className="fas fa-dice mr-1"></i> Random
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Button
            variant="primary"
            size="sm"
            id="hillMatrixDetBtn"
            onClick={() => setMode('det')}
          >
            Det(K)
          </Button>
          <Button
            variant="amber"
            size="sm"
            id="hillMatrixAdjBtn"
            onClick={() => setMode('adj')}
          >
            Adj(K)
          </Button>
          <Button
            variant="emerald"
            size="sm"
            id="hillMatrixInverseBtn"
            onClick={() => setMode('inverse')}
          >
            K⁻¹
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMode('all')}
          >
            All Details
          </Button>
        </div>

        <div
          id="hillToolMatrixInputContainer"
          className="matrix-wrapper p-2 bg-white rounded border border-gray-300 inline-block mb-3"
        >
          <div
            id="hillToolMatrixGrid"
            className="matrix-grid"
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
            {matrix.map((row, r) =>
              row.map((cell, c) => (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  value={cell}
                  min={0}
                  max={25}
                  onChange={e => handleCellChange(r, c, e.target.value)}
                  className="border border-gray-300 rounded px-1 py-0.5 text-sm text-center bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div
        id="hillToolMatrixOutput"
        className="mt-3 bg-white border border-gray-200 rounded p-3 overflow-x-auto"
      >
        <div className="hill-result-grid">
          <div>{renderMatrixDisplay(matrix, 'Matrix K')}</div>
          <div>
            <div className="font-semibold text-gray-700">det(K) = {det}</div>
            <div className="text-sm text-gray-600 mt-1">gcd(det(K), 26) = {gcdVal}</div>
          </div>
        </div>

        {mode === 'adj' && renderMatrixDisplay(adj, 'Adjugate Matrix (Adj(K))')}

        {mode === 'inverse' && (
          <>
            {gcdVal !== 1 ? (
              <div className="inv-no-inverse mt-2">
                <i className="fas fa-times-circle mr-1.5"></i> Matrix is not invertible modulo 26
                (gcd(det(K),26) ≠ 1).
              </div>
            ) : (
              <>
                {renderMatrixDisplay(inv || [], 'Inverse Matrix (K⁻¹)')}
                <div className="text-sm text-gray-600 mt-2">
                  det(K)⁻¹ = {invDet}, so K⁻¹ = det(K)⁻¹ · Adj(K) mod 26.
                </div>
              </>
            )}
          </>
        )}

        {mode === 'all' && (
          <>
            {gcdVal !== 1 ? (
              <div className="inv-no-inverse mt-2">
                <i className="fas fa-times-circle mr-1.5"></i> Matrix is not invertible modulo 26
                (gcd(det,26) ≠ 1).
              </div>
            ) : (
              <>
                {renderMatrixDisplay(cof, 'Cofactor Matrix (C)')}
                {renderMatrixDisplay(adj, 'Adjugate Matrix (Adj(K))')}
                {renderMatrixDisplay(inv || [], 'Inverse Matrix (K⁻¹)')}
                <div className="text-sm text-gray-600 mt-2">
                  det(K)⁻¹ = {invDet}, so K⁻¹ = det(K)⁻¹ · Adj(K) mod 26.
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
