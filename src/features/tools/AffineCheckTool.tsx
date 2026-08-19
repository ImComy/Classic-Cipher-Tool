import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { gcd, modInv } from '../../lib/utils/math'

export const AffineCheckTool: React.FC = () => {
  const [a, setA] = useState(5)
  const [b, setB] = useState(3)
  const [result, setResult] = useState<string | null>(null)

  const handleCheck = () => {
    const g = gcd(a, 26)
    const valid = g === 1
    const inv = valid ? modInv(a) : -1
    let msg = `a=${a}, b=${b}  |  gcd(a,26)=${g}  → ${valid ? '✅ VALID' : '❌ INVALID'}`
    if (valid) msg += `  |  a⁻¹ = ${inv}`
    setResult(msg)
  }

  return (
    <div className="bg-gray-50 rounded p-4 border border-gray-200">
      <div className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
        <i className="fas fa-check-circle text-primary-400"></i> Affine Key Check
      </div>
      <div className="text-sm text-gray-500 mb-2">
        Validate <code>(a, b)</code> for Affine cipher
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <input
          type="number"
          id="affineA"
          value={a}
          onChange={e => setA(parseInt(e.target.value, 10) || 0)}
          min={1}
          max={25}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          placeholder="a"
        />
        <input
          type="number"
          id="affineB"
          value={b}
          onChange={e => setB(parseInt(e.target.value, 10) || 0)}
          min={0}
          max={25}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          placeholder="b"
        />
        <Button variant="primary" size="sm" id="affineCheckBtn" onClick={handleCheck}>
          Check
        </Button>
      </div>
      <div
        className="bg-white border border-gray-200 rounded p-1.5 text-sm font-mono mt-1 min-h-[28px] overflow-y-auto"
        id="affineCheckResult"
      >
        {result !== null ? (
          result
        ) : (
          <span className="text-gray-400 font-sans italic">—</span>
        )}
      </div>
    </div>
  )
}
