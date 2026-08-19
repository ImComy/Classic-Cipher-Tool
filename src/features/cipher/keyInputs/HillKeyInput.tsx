import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setKeyData } from '../../../store/slices/cipherSlice'
import { Button } from '../../../components/ui/Button'
import { detMatrix, gcd } from '../../../lib/utils/math'
import { useToast } from '../../../hooks/useToast'

export const HillKeyInput: React.FC = () => {
  const dispatch = useAppDispatch()
  const keyData = useAppSelector(state => state.cipher.keyData)
  const { toast } = useToast()

  const defaultMatrix = [
    [3, 2],
    [1, 4],
  ]
  const matrix: number[][] = keyData.matrix || defaultMatrix
  const n = keyData.n || matrix.length || 2

  const det = detMatrix(matrix)
  const isCoprime = det !== -1 && gcd(det, 26) === 1

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newN = parseInt(e.target.value, 10)
    if (isNaN(newN) || newN < 2) newN = 2
    if (newN > 10) newN = 10

    const newMatrix: number[][] = Array.from({ length: newN }, (_, r) =>
      Array.from({ length: newN }, (_, c) => {
        return matrix[r] && matrix[r][c] !== undefined ? matrix[r][c] : r === c ? 1 : 0
      })
    )

    dispatch(setKeyData({ n: newN, matrix: newMatrix }))
  }

  const handleCellChange = (r: number, c: number, valStr: string) => {
    const val = parseInt(valStr, 10)
    const newMatrix = matrix.map((row, rowIdx) =>
      row.map((cell, colIdx) => (rowIdx === r && colIdx === c ? (isNaN(val) ? 0 : val) : cell))
    )
    dispatch(setKeyData({ matrix: newMatrix }))
  }

  const handleRandom = () => {
    let randMat: number[][] = []
    let randDet = 0
    let attempts = 0

    do {
      randMat = Array.from({ length: n }, () =>
        Array.from({ length: n }, () => Math.floor(Math.random() * 26))
      )
      randDet = detMatrix(randMat)
      attempts++
    } while ((randDet === -1 || gcd(randDet, 26) !== 1) && attempts < 300)

    if (randDet !== -1 && gcd(randDet, 26) === 1) {
      dispatch(setKeyData({ matrix: randMat }))
      toast('Random invertible Hill matrix generated.')
    } else {
      toast('Failed to generate invertible matrix, please try again.')
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <label className="text-sm font-semibold text-gray-600">Matrix dimension (n×n):</label>
        <input
          type="number"
          value={n}
          onChange={handleDimensionChange}
          min={2}
          max={10}
          className="w-[60px] px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <span className="text-sm text-gray-600">
          × <span>{n}</span>
        </span>
        {isCoprime ? (
          <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✓</span> det={det}, invertible
          </span>
        ) : (
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✗</span> det={det} not coprime to 26
          </span>
        )}
        <Button variant="accent" size="xs" onClick={handleRandom}>
          <i className="fas fa-dice mr-1"></i> Random
        </Button>
        <span className="text-xs text-gray-400 ml-2">(det must be coprime to 26)</span>
      </div>

      <div className="matrix-wrapper">
        <div
          className="matrix-grid"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(36px, 1fr))` }}
        >
          {Array.from({ length: n }, (_, r) =>
            Array.from({ length: n }, (_, c) => {
              const val = matrix[r] && matrix[r][c] !== undefined ? matrix[r][c] : 0
              return (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  value={val}
                  min={0}
                  max={25}
                  onChange={e => handleCellChange(r, c, e.target.value)}
                  className="border border-gray-300 rounded px-1 py-0.5 text-sm text-center bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
