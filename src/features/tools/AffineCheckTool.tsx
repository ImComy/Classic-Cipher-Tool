import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { gcd, modInv } from '../../lib/utils/math'

export const AffineCheckTool: React.FC = () => {
  const [a, setA] = useState(5)
  const [b, setB] = useState(3)
  const [result, setResult] = useState<{
    message: string
    isValid: boolean
    aInverse: number | null
    gcd: number
  } | null>(null)

  const handleCheck = () => {
    const g = gcd(a, 26)
    const valid = g === 1
    const inv = valid ? modInv(a) : null

    let message = `gcd(${a}, 26) = ${g}`
    if (valid) {
      message += ` → a⁻¹ = ${inv}`
    } else {
      message += ` → Not invertible`
    }

    setResult({
      message,
      isValid: valid,
      aInverse: inv,
      gcd: g
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          <i className="fas fa-check-circle text-primary-500"></i>
          Affine Key Check
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Validate <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono">(a, b)</code> for Affine cipher
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* Input row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-600">a =</label>
            <input
              type="number"
              value={a}
              onChange={e => setA(parseInt(e.target.value, 10) || 0)}
              className="w-14 px-2 py-1.5 text-sm font-mono text-center border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
              placeholder="any"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-medium text-gray-600">b =</label>
            <input
              type="number"
              value={b}
              onChange={e => setB(parseInt(e.target.value, 10) || 0)}
              className="w-14 px-2 py-1.5 text-sm font-mono text-center border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
              placeholder="any"
            />
          </div>
          <Button variant="primary" size="sm" onClick={handleCheck}>
            <i className="fas fa-check mr-1.5"></i> Check
          </Button>
        </div>

        {/* Result */}
        {result !== null && (
          <div className={`
            rounded-lg p-3 border transition-all duration-200
            ${result.isValid
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
            }
          `}>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {result.isValid
                  ? <i className="fas fa-check-circle text-green-600"></i>
                  : <i className="fas fa-times-circle text-red-600"></i>
                }
              </div>
              <div>
                <div className={`font-mono text-sm ${result.isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </div>
                <div className="text-xs mt-1 opacity-75">
                  {result.isValid
                    ? `✓ Valid Affine key — ${a}·x + ${b} mod 26 is invertible`
                    : `✗ Invalid — gcd(${a}, 26) = ${result.gcd} ≠ 1, decryption impossible`
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {result === null && (
          <div className="text-xs text-gray-400 italic bg-gray-50 rounded-lg p-3 text-center border border-dashed border-gray-200">
            Enter values and click "Check" to validate the key
          </div>
        )}
      </div>
    </div>
  )
}