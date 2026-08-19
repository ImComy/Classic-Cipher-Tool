import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setAffineA, setAffineB } from '../../../store/slices/labSlice'
import { Button } from '../../../components/ui/Button'
import { modInv, gcd } from '../../../lib/utils/math'

// Include 0 as a valid (though non‑invertible) value for the slider
const VALID_A_VALUES = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]

export const AffineLabTool: React.FC = () => {
  const dispatch = useAppDispatch()
  const { affineA, affineB } = useAppSelector(state => state.lab)

  const [aInputValue, setAInputValue] = useState<string>(String(affineA))
  const [bInputValue, setBInputValue] = useState<string>(String(affineB))
  const [aError, setAError] = useState<string | null>(null)
  const [bError, setBError] = useState<string | null>(null)
  const [aSliderValue, setASliderValue] = useState<number>(
    VALID_A_VALUES.indexOf(affineA) >= 0 ? VALID_A_VALUES.indexOf(affineA) : 0
  )
  const [bSliderValue, setBSliderValue] = useState<number>(affineB)

  useEffect(() => {
    setAInputValue(String(affineA))
    setBInputValue(String(affineB))
    setAError(null)
    setBError(null)
    setASliderValue(VALID_A_VALUES.indexOf(affineA) >= 0 ? VALID_A_VALUES.indexOf(affineA) : 0)
    setBSliderValue(affineB)
  }, [affineA, affineB])

  // Reset to 0,0 as requested
  const handleReset = () => {
    dispatch(setAffineA(1))
    dispatch(setAffineB(0))
  }

  const handleAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10)
    setASliderValue(idx)
    dispatch(setAffineA(VALID_A_VALUES[idx]))
  }

  const handleBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    setBSliderValue(val)
    dispatch(setAffineB(val))
  }

  const handleAInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAInputValue(value)
    if (value === '') { setAError('Value required'); return }
    const num = parseInt(value, 10)
    if (isNaN(num)) { setAError('Must be a number'); return }
    if (num < 0 || num > 25) { setAError('Must be between 0-25'); return }
    if (!VALID_A_VALUES.includes(num)) {
      setAError(`Must be one of: ${VALID_A_VALUES.join(', ')}`)
      return
    }
    setAError(null)
    dispatch(setAffineA(num))
  }

  const handleBInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBInputValue(value)
    if (value === '') { setBError('Value required'); return }
    const num = parseInt(value, 10)
    if (isNaN(num)) { setBError('Must be a number'); return }
    if (num < 0 || num > 25) { setBError('Must be between 0-25'); return }
    setBError(null)
    dispatch(setAffineB(num))
  }

  const handleAInputBlur = () => {
    if (aError) { setAInputValue(String(affineA)); setAError(null) }
  }

  const handleBInputBlur = () => {
    if (bError) { setBInputValue(String(affineB)); setBError(null) }
  }

  const isAValid = gcd(affineA, 26) === 1
  const aInverse = isAValid ? modInv(affineA) : null

  const presets = [
    { a: 5, b: 3, label: '5,3' },
    { a: 3, b: 7, label: '3,7' },
    { a: 7, b: 2, label: '7,2' },
    { a: 9, b: 5, label: '9,5' },
    { a: 11, b: 8, label: '11,8' },
  ]

  return (
    <div className="flex flex-col h-[300px]">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50/80 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Affine Cracker</span>
          <span className="text-xs text-gray-400">
            a = <span className="font-mono font-bold text-primary-600">{affineA}</span>
            , b = <span className="font-mono font-bold text-primary-600">{affineB}</span>
          </span>
        </div>
        <Button variant="outline" size="xs" onClick={handleReset}>
          <i className="fas fa-undo mr-1"></i> Reset
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Multiplier (a) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-600 uppercase">Multiplier (a)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={aInputValue}
                onChange={handleAInputChange}
                onBlur={handleAInputBlur}
                className={`
                  w-12 px-1 py-0.5 text-sm font-mono font-bold text-center rounded border
                  transition-colors focus:outline-none focus:ring-2
                  ${aError
                    ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-300'
                    : 'border-gray-300 bg-white text-gray-800 focus:ring-primary-300 focus:border-primary-400'
                  }
                `}
                spellCheck={false}
                autoComplete="off"
              />
              {!aError && (isAValid ? <span className="text-xs text-green-600">✓</span> : <span className="text-xs text-red-500">⚠️</span>)}
            </div>
          </div>
          {aError && <p className="text-xs text-red-500 mb-1">{aError}</p>}

          <div className="relative">
            <input
              type="range"
              min="0"
              max={VALID_A_VALUES.length - 1}
              value={aSliderValue}
              onChange={handleAChange}
              className="w-full accent-primary-500"
            />
            <div className="relative mt-1 h-4">
              {VALID_A_VALUES.map((val, index) => {
                const position = (index / (VALID_A_VALUES.length - 1)) * 100
                const isActive = val === affineA
                return (
                  <span
                    key={val}
                    className={`
                      absolute transform -translate-x-1/2 text-[10px] font-mono transition-colors
                      ${isActive ? 'font-bold text-primary-600 scale-110' : 'text-gray-400'}
                    `}
                    style={{ left: `${position}%` }}
                  >
                    {val}
                  </span>
                )
              })}
            </div>
          </div>

          {!isAValid && (
            <p className="text-xs text-red-500 mt-1">⚠️ gcd({affineA}, 26) = {gcd(affineA, 26)} — not invertible</p>
          )}
          {isAValid && aInverse !== null && (
            <p className="text-xs text-green-600 mt-1">✓ a⁻¹ = {aInverse}</p>
          )}
        </div>

        {/* Shift (b) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-600 uppercase">Shift (b)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={bInputValue}
                onChange={handleBInputChange}
                onBlur={handleBInputBlur}
                className={`
                  w-12 px-1 py-0.5 text-sm font-mono font-bold text-center rounded border
                  transition-colors focus:outline-none focus:ring-2
                  ${bError
                    ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-300'
                    : 'border-gray-300 bg-white text-gray-800 focus:ring-primary-300 focus:border-primary-400'
                  }
                `}
                spellCheck={false}
                autoComplete="off"
              />
              {!bError && <span className="text-xs text-green-600">✓</span>}
            </div>
          </div>
          {bError && <p className="text-xs text-red-500 mb-1">{bError}</p>}

          <div className="relative">
            <input
              type="range"
              min="0"
              max="25"
              value={bSliderValue}
              onChange={handleBChange}
              className="w-full accent-primary-500"
            />
            <div className="relative mt-1 h-4">
              {[0, 5, 10, 15, 20, 25].map((val) => {
                const position = (val / 25) * 100
                const isActive = val === affineB
                return (
                  <span
                    key={val}
                    className={`
                      absolute transform -translate-x-1/2 text-[10px] font-mono transition-colors
                      ${isActive ? 'font-bold text-primary-600 scale-110' : 'text-gray-300'}
                    `}
                    style={{ left: `${position}%` }}
                  >
                    {val}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* Presets */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Presets:</span>
            {presets.map(({ a, b, label }) => (
              <button
                key={`${a}-${b}`}
                className={`
                  px-2 py-0.5 text-xs font-mono rounded border transition-colors
                  ${affineA === a && affineB === b
                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => { dispatch(setAffineA(a)); dispatch(setAffineB(b)) }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Formula */}
        <div className={`
          rounded-md p-3 text-sm font-mono text-center border
          ${isAValid ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-red-50 border-red-200 text-red-800 opacity-60'}
        `}>
          <div className="font-medium">
            D(y) = {isAValid && aInverse !== null ? aInverse : '?'} · (y − {affineB}) mod 26
          </div>
          <div className="text-xs mt-0.5 opacity-70">
            where a = {affineA}
            {isAValid && aInverse !== null ? `, a⁻¹ = ${aInverse}` : ' ⚠️ Invalid key (a must be coprime with 26)'}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-3 py-1.5 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 text-center">
        Adjust sliders or type values directly. Valid a values are coprime with 26.
      </div>
    </div>
  )
}