import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setKeyData } from '../../../store/slices/cipherSlice'
import { Button } from '../../../components/ui/Button'
import { gcd, modInv } from '../../../lib/utils/math'
import { useToast } from '../../../hooks/useToast'

const VALID_A_VALUES = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]

export const AffineKeyInput: React.FC = () => {
  const dispatch = useAppDispatch()
  const keyData = useAppSelector(state => state.cipher.keyData)
  const { toast } = useToast()

  const a = keyData.a ?? 5
  const b = keyData.b ?? 3

  const [aInputValue, setAInputValue] = useState<string>(String(a))
  const [bInputValue, setBInputValue] = useState<string>(String(b))
  const [aError, setAError] = useState<string | null>(null)
  const [bError, setBError] = useState<string | null>(null)
  const [aSliderValue, setASliderValue] = useState<number>(
    VALID_A_VALUES.indexOf(a) >= 0 ? VALID_A_VALUES.indexOf(a) : 0
  )
  const [bSliderValue, setBSliderValue] = useState<number>(b)

  useEffect(() => {
    setAInputValue(String(a))
    setBInputValue(String(b))
    setASliderValue(VALID_A_VALUES.indexOf(a) >= 0 ? VALID_A_VALUES.indexOf(a) : 0)
    setBSliderValue(b)
  }, [a, b])

  const isAValid = gcd(a, 26) === 1
  const aInverse = isAValid ? modInv(a) : null

  const handleAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10)
    setASliderValue(idx)
    dispatch(setKeyData({ a: VALID_A_VALUES[idx] }))
  }

  const handleBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    setBSliderValue(val)
    dispatch(setKeyData({ b: val }))
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
    dispatch(setKeyData({ a: num }))
  }

  const handleBInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBInputValue(value)
    if (value === '') { setBError('Value required'); return }
    const num = parseInt(value, 10)
    if (isNaN(num)) { setBError('Must be a number'); return }
    if (num < 0 || num > 25) { setBError('Must be between 0-25'); return }
    setBError(null)
    dispatch(setKeyData({ b: num }))
  }

  const handleAInputBlur = () => {
    if (aError) { setAInputValue(String(a)); setAError(null) }
  }

  const handleBInputBlur = () => {
    if (bError) { setBInputValue(String(b)); setBError(null) }
  }

  const handleRandom = () => {
    const coprimes = VALID_A_VALUES
    const randomA = coprimes[Math.floor(Math.random() * coprimes.length)]
    const randomB = Math.floor(Math.random() * 26)
    dispatch(setKeyData({ a: randomA, b: randomB }))
    toast('Random affine key generated.')
  }

  const presets = [
    { a: 5, b: 3, label: '5,3' },
    { a: 3, b: 7, label: '3,7' },
    { a: 7, b: 2, label: '7,2' },
    { a: 9, b: 5, label: '9,5' },
    { a: 11, b: 8, label: '11,8' },
  ]

  return (
    <div className="w-full p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">
            a = <span className="font-mono font-bold text-primary-600">{a}</span>
            , b = <span className="font-mono font-bold text-primary-600">{b}</span>
          </span>
          <span className={`
            inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${isAValid
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
            }
          `}>
            {isAValid ? '✓ Valid' : '✗ Invalid (gcd ≠ 1)'}
          </span>
        </div>
        <Button variant="accent" size="xs" onClick={handleRandom}>
          <i className="fas fa-dice mr-1.5"></i> Random
        </Button>
      </div>

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
              const isActive = val === a
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
          <p className="text-xs text-red-500 mt-1">⚠️ gcd({a}, 26) = {gcd(a, 26)} — not invertible</p>
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
              const isActive = val === b
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

      {/* Formula */}
      <div className={`
        rounded-md p-3 text-sm font-mono text-center border
        ${isAValid ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-red-50 border-red-200 text-red-800 opacity-60'}
      `}>
        <div className="font-medium">
          D(y) = {isAValid && aInverse !== null ? aInverse : '?'} · (y − {b}) mod 26
        </div>
        <div className="text-xs mt-0.5 opacity-70">
          where a = {a}
          {isAValid && aInverse !== null ? `, a⁻¹ = ${aInverse}` : ' ⚠️ Invalid key (a must be coprime with 26)'}
        </div>
      </div>

      <div className="text-[10px] text-gray-400 text-center">
        Adjust sliders or type values directly. Valid a values are coprime with 26.
      </div>
    </div>
  )
}