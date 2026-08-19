import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setKeyData } from '../../../store/slices/cipherSlice'
import { Button } from '../../../components/ui/Button'
import { gcd, modInv } from '../../../lib/utils/math'
import { useToast } from '../../../hooks/useToast'

export const AffineKeyInput: React.FC = () => {
  const dispatch = useAppDispatch()
  const keyData = useAppSelector(state => state.cipher.keyData)
  const { toast } = useToast()

  const a = keyData.a ?? 5
  const b = keyData.b ?? 3

  const isRangeValid = !isNaN(a) && !isNaN(b) && a >= 1 && a <= 25 && b >= 0 && b <= 25
  const g = isRangeValid ? gcd(a, 26) : 0
  const isCoprime = g === 1
  const invA = isCoprime ? modInv(a) : -1

  const handleAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    dispatch(setKeyData({ a: isNaN(val) ? 0 : val }))
  }

  const handleBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    dispatch(setKeyData({ b: isNaN(val) ? 0 : val }))
  }

  const handleRandom = () => {
    const coprimes = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]
    const randomA = coprimes[Math.floor(Math.random() * coprimes.length)]
    const randomB = Math.floor(Math.random() * 26)
    dispatch(setKeyData({ a: randomA, b: randomB }))
    toast('Random affine key generated.')
  }

  return (
    <div className="w-full flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-semibold text-gray-600">a:</label>
        <input
          type="number"
          value={a}
          onChange={handleAChange}
          min={1}
          max={25}
          className="w-[60px] px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <label className="text-sm font-semibold text-gray-600">b:</label>
        <input
          type="number"
          value={b}
          onChange={handleBChange}
          min={0}
          max={25}
          className="w-[60px] px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        {!isRangeValid ? (
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✗</span> a:1–25, b:0–25
          </span>
        ) : !isCoprime ? (
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✗</span> gcd({a},26)={g} ≠ 1
          </span>
        ) : (
          <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✓</span> gcd=1, a⁻¹={invA}
          </span>
        )}
        <Button variant="accent" size="xs" onClick={handleRandom}>
          <i className="fas fa-dice mr-1"></i> Random
        </Button>
      </div>
      <div className="flex-1 min-w-[100px] text-right sm:text-left">
        <span className="font-normal text-xs text-gray-400">E(x) = (a·x + b) mod 26</span>
      </div>
    </div>
  )
}
