import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setKeyData } from '../../../store/slices/cipherSlice'
import { Button } from '../../../components/ui/Button'
import { shuffleArray } from '../../../lib/utils/string'
import { useToast } from '../../../hooks/useToast'

export const PermutationKeyInput: React.FC = () => {
  const dispatch = useAppDispatch()
  const keyData = useAppSelector(state => state.cipher.keyData)
  const { toast } = useToast()

  const perm = keyData.perm ?? '2,4,1,3'
  const parts = perm
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n))

  const sorted = [...parts].sort((a, b) => a - b)
  const n = parts.length
  const isValid = n > 0 && sorted.every((v, i) => v === i + 1) && new Set(parts).size === n

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setKeyData({ perm: e.target.value }))
  }

  const handleRandom = () => {
    const len = 4 + Math.floor(Math.random() * 2)
    const arr = Array.from({ length: len }, (_, i) => i + 1)
    const shuffled = shuffleArray(arr)
    dispatch(setKeyData({ perm: shuffled.join(',') }))
    toast('Random permutation key generated.')
  }

  return (
    <div className="w-full flex items-center justify-between gap-3 flex-wrap">
      <div className="flex-1 min-w-[180px]">
        <label className="text-sm font-semibold text-gray-600 block mb-0.5">
          Permutation (1..n):
        </label>
        <input
          type="text"
          value={perm}
          onChange={handleChange}
          placeholder="2,4,1,3"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        {parts.length === 0 ? (
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✗</span> enter numbers
          </span>
        ) : isValid ? (
          <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✓</span> valid permutation ({n})
          </span>
        ) : (
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✗</span> must be 1..n unique
          </span>
        )}
        <Button variant="accent" size="xs" onClick={handleRandom}>
          <i className="fas fa-dice mr-1"></i> Random
        </Button>
      </div>
      <div className="flex-1 min-w-[100px] text-right sm:text-left">
        <span className="font-normal text-xs text-gray-400">comma-separated, e.g. 2,4,1,3</span>
      </div>
    </div>
  )
}
