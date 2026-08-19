import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { gcd } from '../../lib/utils/math'

export const GcdTool: React.FC = () => {
  const [a, setA] = useState(5)
  const [m, setM] = useState(26)
  const [result, setResult] = useState<{
    gcd: number
    message: string
    isCoprime: boolean
  } | null>(null)

  const handleCompute = () => {
    const g = gcd(a, m)
    const isCoprime = g === 1
    setResult({
      gcd: g,
      isCoprime,
      message: `gcd(${a}, ${m}) = ${g} — ${isCoprime ? '✅ Coprime' : '❌ Not coprime'}`
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          <i className="fas fa-sync text-primary-500"></i>
          GCD Calculator
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Compute the greatest common divisor of two numbers
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* Input row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-600">gcd(</span>
            <input
              type="number"
              value={a}
              onChange={e => setA(parseInt(e.target.value, 10) || 0)}
              className="w-14 px-2 py-1.5 text-sm font-mono text-center border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
              placeholder="a"
            />
            <span className="text-xs font-medium text-gray-600">,</span>
            <input
              type="number"
              value={m}
              onChange={e => setM(parseInt(e.target.value, 10) || 0)}
              className="w-14 px-2 py-1.5 text-sm font-mono text-center border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
              placeholder="m"
            />
            <span className="text-xs font-medium text-gray-600">)</span>
          </div>
          <Button variant="primary" size="sm" onClick={handleCompute}>
            <i className="fas fa-calculator mr-1.5"></i> Compute
          </Button>
        </div>

        {/* Result */}
        {result !== null && (
          <div className={`
            rounded-lg p-3 border transition-all duration-200
            ${result.isCoprime
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
            }
          `}>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {result.isCoprime
                  ? <i className="fas fa-check-circle text-green-600"></i>
                  : <i className="fas fa-times-circle text-red-600"></i>
                }
              </div>
              <div>
                <div className={`font-mono text-sm ${result.isCoprime ? 'text-green-800' : 'text-red-800'}`}>
                  {result.message}
                </div>
                <div className="text-xs mt-1 opacity-75">
                  {result.isCoprime
                    ? `✓ ${a} and ${m} share no common factors`
                    : `✗ ${a} and ${m} share factor ${result.gcd}`
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {result === null && (
          <div className="text-xs text-gray-400 italic bg-gray-50 rounded-lg p-3 text-center border border-dashed border-gray-200">
            Enter two numbers and click "Compute" to find their GCD
          </div>
        )}
      </div>
    </div>
  )
}