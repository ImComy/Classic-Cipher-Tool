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

  // Status determination
  let statusColor = 'gray'
  let statusIcon = '⏳'
  let statusText = 'checking...'

  if (parts.length === 0) {
    statusColor = 'red'
    statusIcon = '✗'
    statusText = 'enter numbers'
  } else if (!isValid) {
    statusColor = 'red'
    statusIcon = '✗'
    statusText = 'must be 1..n unique'
  } else {
    statusColor = 'green'
    statusIcon = '✓'
    statusText = `[${parts.join(', ')}]`
  }

  const statusClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-gray-50 text-gray-500 border-gray-200',
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        {/* Input */}
        <div className="flex-1 min-w-[180px] w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Permutation (1..n)
          </label>
          <input
            type="text"
            value={perm}
            onChange={handleChange}
            placeholder="2,4,1,3"
            className="w-full px-3 py-1.5 text-sm font-mono border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
          />
        </div>

        {/* Status Badge & Random Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`
            inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
            ${statusClasses[statusColor as keyof typeof statusClasses]}
          `}>
            <span>{statusIcon}</span>
            <span>{statusText}</span>
          </div>
          <Button variant="accent" size="xs" onClick={handleRandom}>
            <i className="fas fa-dice mr-1.5"></i> Random
          </Button>
        </div>
      </div>

      {/* Info Display */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 bg-gray-50/80 rounded-lg px-3 py-1.5 border border-gray-100">
        <i className="fas fa-arrows-rotate text-gray-300"></i>
        <span className="font-mono">
          Reorders positions according to
          {isValid ? (
            <span className="font-bold text-primary-600 ml-1">
              [{parts.join(', ')}]
            </span>
          ) : (
            <span className="text-red-400 ml-1">[invalid]</span>
          )}
        </span>
        {isValid && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">
              Length: <span className="font-mono font-medium text-gray-700">{n}</span>
            </span>
          </>
        )}
      </div>
    </div>
  )
}