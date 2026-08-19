import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setKeyData } from '../../../store/slices/cipherSlice'
import { Button } from '../../../components/ui/Button'
import { ALPHABET, parseKeyWithNumbers } from '../../../lib/utils/string'
import { useToast } from '../../../hooks/useToast'

export const AutokeyKeyInput: React.FC = () => {
  const dispatch = useAppDispatch()
  const keyData = useAppSelector(state => state.cipher.keyData)
  const { toast } = useToast()

  const rawKey = keyData.key ?? 'SECRET'
  const parsed = parseKeyWithNumbers(rawKey)
  const clean = parsed.replace(/[^A-Z]/g, '')
  const isValid = clean.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setKeyData({ key: e.target.value }))
  }

  const handleRandom = () => {
    const len = 6 + Math.floor(Math.random() * 5)
    let str = ''
    for (let i = 0; i < len; i++) {
      str += ALPHABET[Math.floor(Math.random() * 26)]
    }
    dispatch(setKeyData({ key: str }))
    toast('Random Autokey keyword generated.')
  }

  const display = clean.length > 12 ? clean.substring(0, 10) + '…' : clean

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        {/* Input */}
        <div className="flex-1 min-w-[180px] w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Keyword
          </label>
          <input
            type="text"
            value={rawKey}
            onChange={handleChange}
            placeholder="SECRET or 8 5 25"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
          />
          <div className="text-xs text-gray-400 mt-1">
            Numbers → letters: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">8 5 25</code> → <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">IFZ</code>
          </div>
        </div>

        {/* Status Badge & Random Button */}
        <div className="flex items-center gap-2 shrink-0">
          {isValid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
              <span>✓</span>
              <span className="font-mono">{display}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
              <span>✗</span>
              <span>enter a keyword</span>
            </span>
          )}
          <Button variant="accent" size="xs" onClick={handleRandom}>
            <i className="fas fa-dice mr-1.5"></i> Random
          </Button>
        </div>
      </div>

      {/* Info Display */}
      <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50/80 rounded-lg px-3 py-1.5 border border-gray-100">
        <i className="fas fa-info-circle text-gray-300"></i>
        <span className="font-mono">
          Key extends with <span className="font-bold text-primary-600">plaintext</span>
        </span>
        <span className="text-gray-300">|</span>
        <span className="text-gray-400">
          {isValid ? (
            <>Parsed: <span className="font-mono font-medium text-gray-700">{clean}</span></>
          ) : (
            'Waiting for valid key...'
          )}
        </span>
      </div>
    </div>
  )
}