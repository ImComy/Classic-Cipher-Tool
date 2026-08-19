import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setVigenereKey } from '../../../store/slices/labSlice'
import { Button } from '../../../components/ui/Button'
import { crackVigenere } from '../../../lib/utils/vigenereAttack'
import { parseKeyWithNumbers } from '../../../lib/utils/string'

export const VigenereLabTool: React.FC = () => {
  const dispatch = useAppDispatch()
  const { ciphertext, vigenereKey } = useAppSelector(state => state.lab)

  const handleAutosolve = () => {
    const key = crackVigenere(ciphertext)
    dispatch(setVigenereKey(key))
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Keyword
          </label>
          <input
            type="text"
            value={vigenereKey}
            onChange={e => {
              const val = parseKeyWithNumbers(e.target.value.toUpperCase()).replace(/[^A-Z]/g, '')
              dispatch(setVigenereKey(val))
            }}
            placeholder="KEY"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white font-mono focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs text-gray-500 mb-2">
          Attempts to guess the key length using Kasiski/IC, then runs frequency analysis.
        </p>
        <Button variant="outline" size="sm" onClick={handleAutosolve} className="w-full">
          <i className="fas fa-wand-magic-sparkles mr-2 text-purple-500"></i> Autosolve Key
        </Button>
      </div>
    </div>
  )
}
