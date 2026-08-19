import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setKeyData } from '../../../store/slices/cipherSlice'
import { Button } from '../../../components/ui/Button'
import { ALPHABET, parseKeyWithNumbers, shuffleArray } from '../../../lib/utils/string'
import { useToast } from '../../../hooks/useToast'

export const SubstitutionKeyInput: React.FC = () => {
  const dispatch = useAppDispatch()
  const keyData = useAppSelector(state => state.cipher.keyData)
  const { toast } = useToast()
  const [isTextMode, setIsTextMode] = useState(false)

  const mapRaw = keyData.map || 'QWERTYUIOPASDFGHJKLZXCVBNM'
  const mapParsed = parseKeyWithNumbers(mapRaw)
  const mapClean = mapParsed.toUpperCase().replace(/[^A-Z]/g, '')
  const padded = (mapClean + ALPHABET).slice(0, 26)

  const uniqueCount = new Set(mapClean).size
  const isValid = mapClean.length === 26 && uniqueCount === 26

  const handleCharChange = (index: number, val: string) => {
    let char = val.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (/^[0-9]$/.test(char)) {
      const num = parseInt(char, 10)
      if (num >= 0 && num <= 9) char = String.fromCharCode(num + 65)
    }
    if (char.length > 1) char = char.slice(-1)

    const chars = padded.split('')
    chars[index] = char || ALPHABET[index]
    const newMap = chars.join('')
    dispatch(setKeyData({ map: newMap }))
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setKeyData({ map: e.target.value }))
  }

  const handleRandom = () => {
    const shuffled = shuffleArray(ALPHABET.split('')).join('')
    dispatch(setKeyData({ map: shuffled }))
    toast('Random substitution key generated.')
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
        <label className="text-sm font-semibold text-gray-600">Substitution Key</label>
        <div className="flex items-center gap-2">
          {isValid ? (
            <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium">
              <span className="mr-0.5">✓</span> valid ({mapClean.substring(0, 8)}…)
            </span>
          ) : (
            <span className="bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 text-xs font-medium">
              <span className="mr-0.5">⏳</span> {mapClean.length}/26 unique {uniqueCount}/26
            </span>
          )}
          <Button variant="accent" size="xs" onClick={handleRandom}>
            <i className="fas fa-dice mr-1"></i> Random
          </Button>
          <Button variant="secondary" size="xs" onClick={() => setIsTextMode(!isTextMode)}>
            <i className="fas fa-arrow-right-arrow-left mr-1"></i>{' '}
            {isTextMode ? 'Switch to Grid' : 'Switch to Text'}
          </Button>
        </div>
      </div>

      {!isTextMode ? (
        <div className="substitution-grid mb-1">
          {ALPHABET.split('').map((letter, idx) => {
            const toChar = padded[idx] || letter
            return (
              <div key={letter} className="map-cell">
                <span className="from-char">{letter}</span>
                <span className="arrow">→</span>
                <input
                  type="text"
                  className="to-char"
                  value={toChar}
                  maxLength={1}
                  data-index={idx}
                  onChange={e => handleCharChange(idx, e.target.value)}
                  onBlur={e => {
                    if (!e.target.value) handleCharChange(idx, letter)
                  }}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={mapRaw}
            onChange={handleTextChange}
            placeholder="26 unique letters or numbers (0-25)"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
          />
          <div className="text-xs text-gray-400 mt-0.5">
            Numbers are converted to letters: 0→A, 8→I, 25→Z
          </div>
        </div>
      )}
    </div>
  )
}
