import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { gcd } from '../../lib/utils/math'

export const GcdTool: React.FC = () => {
  const [val, setVal] = useState(5)
  const [result, setResult] = useState<string | null>(null)

  const handleCompute = () => {
    const g = gcd(val, 26)
    const isValid = g === 1
    setResult(
      `gcd(${val}, 26) = ${g}  → ${isValid ? '✅ Valid for Affine' : '❌ Invalid (must be 1)'}`
    )
  }

  return (
    <div className="bg-gray-50 rounded p-4 border border-gray-200">
      <div className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
        <i className="fas fa-sync text-primary-400"></i> GCD
      </div>
      <div className="text-sm text-gray-500 mb-2">
        <code>gcd(a, 26)</code> must be 1 for Affine
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <input
          type="number"
          id="gcdInput"
          value={val}
          onChange={e => setVal(parseInt(e.target.value, 10) || 0)}
          min={1}
          max={25}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <Button variant="primary" size="sm" id="gcdBtn" onClick={handleCompute}>
          Compute
        </Button>
      </div>
      <div
        className="bg-white border border-gray-200 rounded p-1.5 text-sm font-mono mt-1 min-h-[28px] overflow-y-auto"
        id="gcdResult"
      >
        {result ? (
          result
        ) : (
          <span className="text-gray-400 font-sans italic">—</span>
        )}
      </div>
    </div>
  )
}
