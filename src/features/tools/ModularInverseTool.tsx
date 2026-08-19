import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { modInvWithSteps, gcd } from '../../lib/utils/math'

export const ModularInverseTool: React.FC = () => {
  const [inputVal, setInputVal] = useState(5)
  const [result, setResult] = useState(() => modInvWithSteps(5, 26))
  const [computedVal, setComputedVal] = useState(5)

  const handleCompute = (val: number) => {
    setInputVal(val)
    setComputedVal(val)
    setResult(modInvWithSteps(val, 26))
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          <i className="fas fa-divide text-primary-500"></i>
          Modular Inverse — Extended Euclidean Table
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Find <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] font-mono">a⁻¹ mod 26</code> with step-by-step table
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-gray-600">a =</span>
            <input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(parseInt(e.target.value, 10) || 0)}
              min={1}
              max={25}
              className="w-16 px-2 py-1.5 text-sm font-mono text-center border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
            />
            <span className="text-xs font-medium text-gray-600">mod 26</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => handleCompute(inputVal)} className="w-full sm:w-auto">
            <i className="fas fa-calculator mr-1.5"></i> Compute
          </Button>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-2 overflow-hidden">
          {result.inverse === -1 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              <i className="fas fa-times-circle mr-1.5"></i>
              No inverse exists for {computedVal} mod 26 (gcd({computedVal},26) ={' '}
              {gcd(computedVal, 26)} ≠ 1)
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap">Step</th>
                      <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap">q</th>
                      <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap">r₁</th>
                      <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap">r₂</th>
                      <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap">r</th>
                      <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap">t₁</th>
                      <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap">t₂</th>
                      <th className="border border-gray-300 px-2 py-1.5 text-left font-semibold text-gray-600 whitespace-nowrap">t</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.steps.map((s, idx) => {
                      const isFinal = s.r2 === 0 && idx > 0
                      return (
                        <tr key={idx} className={isFinal ? 'bg-green-50 font-medium' : 'odd:bg-white even:bg-gray-50'}>
                          <td className="border border-gray-300 px-2 py-1.5 font-mono whitespace-nowrap">{s.step}</td>
                          <td className="border border-gray-300 px-2 py-1.5 font-mono whitespace-nowrap">{s.q !== null ? s.q : '—'}</td>
                          <td className="border border-gray-300 px-2 py-1.5 font-mono whitespace-nowrap">{s.r1}</td>
                          <td className="border border-gray-300 px-2 py-1.5 font-mono whitespace-nowrap">{s.r2}</td>
                          <td className="border border-gray-300 px-2 py-1.5 font-mono whitespace-nowrap">{s.r !== null ? s.r : '—'}</td>
                          <td className="border border-gray-300 px-2 py-1.5 font-mono whitespace-nowrap">{s.t1}</td>
                          <td className="border border-gray-300 px-2 py-1.5 font-mono whitespace-nowrap">{s.t2}</td>
                          <td className="border border-gray-300 px-2 py-1.5 font-mono whitespace-nowrap">{s.t !== null ? s.t : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                <i className="fas fa-check-circle mr-1.5 text-green-600"></i>
                <strong>
                  {computedVal}⁻¹ mod 26 = {result.inverse}
                </strong>
                &nbsp; (check: {computedVal} × {result.inverse} = {computedVal * result.inverse} ≡{' '}
                {(computedVal * result.inverse) % 26} mod 26)
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}