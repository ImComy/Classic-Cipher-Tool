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
    <div className="w-full flex items-center justify-between gap-3 flex-wrap">
      <div className="flex-1 min-w-[180px]">
        <label className="text-sm font-semibold text-gray-600 block mb-0.5">Keyword:</label>
        <input
          type="text"
          value={rawKey}
          onChange={handleChange}
          placeholder="SECRET or 8 5 25"
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <div className="text-xs text-gray-400 mt-0.5">
          Numbers → letters: <code>8 5 25</code> → <code>IFZ</code>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {isValid ? (
          <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✓</span> → <span className="font-mono text-xs">{display}</span>
          </span>
        ) : (
          <span className="bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-medium">
            <span className="mr-0.5">✗</span> enter a keyword
          </span>
        )}
        <Button variant="accent" size="xs" onClick={handleRandom}>
          <i className="fas fa-dice mr-1"></i> Random
        </Button>
      </div>
      <div className="flex-1 min-w-[100px] text-right sm:text-left">
        <span className="font-normal text-xs text-gray-400">key extends with plaintext</span>
      </div>
    </div>
  )
}
