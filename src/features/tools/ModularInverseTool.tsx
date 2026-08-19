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
    <div className="bg-gray-50 rounded p-4 border border-gray-200 md:col-span-2">
      <div className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
        <i className="fas fa-divide text-primary-400"></i> Modular Inverse — Extended Euclidean
        Table
      </div>
      <div className="text-sm text-gray-500 mb-2">
        Find <code>a⁻¹ mod 26</code> with step-by-step table
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <input
          type="number"
          id="modInvInput"
          value={inputVal}
          onChange={e => setInputVal(parseInt(e.target.value, 10) || 0)}
          min={1}
          max={25}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <span className="text-sm text-gray-600">mod 26</span>
        <Button
          variant="primary"
          size="sm"
          id="modInvBtn"
          onClick={() => handleCompute(inputVal)}
        >
          Compute
        </Button>
        <Button
          variant="secondary"
          size="sm"
          id="modInvExampleBtn"
          onClick={() => handleCompute(5)}
        >
          Example 5
        </Button>
        <Button
          variant="secondary"
          size="sm"
          id="modInvExample2Btn"
          onClick={() => handleCompute(3)}
        >
          Example 3
        </Button>
      </div>

      <div
        id="modInvResult"
        className="bg-white border border-gray-200 rounded p-2 mt-1 min-h-[40px] overflow-x-auto"
      >
        {result.inverse === -1 ? (
          <div className="inv-no-inverse">
            <i className="fas fa-times-circle mr-1.5"></i>
            No inverse exists for {computedVal} mod 26 (gcd({computedVal},26) ={' '}
            {gcd(computedVal, 26)} ≠ 1)
          </div>
        ) : (
          <>
            <div className="inv-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Step</th>
                    <th>q</th>
                    <th>r₁</th>
                    <th>r₂</th>
                    <th>r</th>
                    <th>t₁</th>
                    <th>t₂</th>
                    <th>t</th>
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((s, idx) => {
                    const isFinal = s.r2 === 0 && idx > 0
                    return (
                      <tr key={idx} className={isFinal ? 'final-row' : ''}>
                        <td className="step-col">{s.step}</td>
                        <td>{s.q !== null ? s.q : '—'}</td>
                        <td>{s.r1}</td>
                        <td>{s.r2}</td>
                        <td>{s.r !== null ? s.r : '—'}</td>
                        <td>{s.t1}</td>
                        <td>{s.t2}</td>
                        <td>{s.t !== null ? s.t : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="inv-result-box mt-2">
              <i className="fas fa-check-circle mr-1.5 text-emerald-600"></i>
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
  )
}
