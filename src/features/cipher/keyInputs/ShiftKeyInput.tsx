import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setKeyData } from '../../../store/slices/cipherSlice'
import { Button } from '../../../components/ui/Button'
import { useToast } from '../../../hooks/useToast'

export const ShiftKeyInput: React.FC = () => {
  const dispatch = useAppDispatch()
  const keyData = useAppSelector(state => state.cipher.keyData)
  const { toast } = useToast()

  const k = keyData.k ?? 3
  const isValid = !isNaN(k) && k >= 0 && k <= 25

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    dispatch(setKeyData({ k: isNaN(val) ? 0 : val }))
  }

  const handleRandom = () => {
    const randomK = Math.floor(Math.random() * 25) + 1
    dispatch(setKeyData({ k: randomK }))
    toast('Random shift key generated.')
  }

  return (
    <div className="w-full flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm font-semibold text-gray-600">Shift (k):</label>
        <input
          type="number"
          id="keyShift"
          value={k}
          onChange={handleChange}
          min={0}
          max={25}
          className="w-[70px] px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <span className="text-xs text-gray-500">(0–25)</span>
        {isValid ? (
          <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✓</span> valid
          </span>
        ) : (
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✗</span> must be 0–25
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-normal text-xs text-gray-400">E(x) = (x + k) mod 26</span>
        <Button variant="accent" size="xs" onClick={handleRandom}>
          <i className="fas fa-dice mr-1"></i> Random
        </Button>
      </div>
    </div>
  )
}
