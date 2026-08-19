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

  const alphabetArray = ALPHABET.split('')

  return (
    <div className="w-full p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Key: {isValid ? (
              <span className="text-green-600 font-bold">Valid ✓</span>
            ) : (
              <span className="text-red-500 font-bold">
                {mapClean.length}/26 unique {uniqueCount}/26
              </span>
            )}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md overflow-hidden border border-gray-200 bg-gray-50 p-0.5">
            <button
              className={`
                px-2.5 py-1 text-xs font-medium rounded transition-colors
                ${!isTextMode
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
              onClick={() => setIsTextMode(false)}
            >
              <i className="fas fa-th mr-1"></i> Grid
            </button>
            <button
              className={`
                px-2.5 py-1 text-xs font-medium rounded transition-colors
                ${isTextMode
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
              onClick={() => setIsTextMode(true)}
            >
              <i className="fas fa-font mr-1"></i> Text
            </button>
          </div>

          <Button variant="accent" size="xs" onClick={handleRandom}>
            <i className="fas fa-dice mr-1.5"></i> Random
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {!isTextMode && (
        <>
          <div className="
            grid
            grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13
            gap-2 sm:gap-2.5
          ">
            {alphabetArray.map((letter, idx) => {
              const toChar = padded[idx] || letter
              const isMapped = toChar !== letter

              return (
                <div
                  key={letter}
                  className={`
                    relative flex flex-col items-center justify-center
                    p-2 rounded-md border
                    transition-all duration-200
                    min-h-[68px]
                    ${isMapped
                      ? 'border-primary-300 bg-primary-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    {letter}
                  </span>
                  <i className={`
                    fas fa-arrow-down text-[10px] my-0.5
                    ${isMapped ? 'text-primary-500' : 'text-gray-300'}
                  `}></i>
                  <input
                    type="text"
                    className={`
                      w-full min-w-[30px]
                      px-1 py-0.5
                      text-center text-sm font-mono font-bold uppercase
                      border rounded
                      transition-colors duration-150
                      outline-none focus:ring-2 focus:ring-primary-300
                      ${isMapped
                        ? 'border-primary-400 bg-white text-primary-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400'
                      }
                    `}
                    maxLength={1}
                    value={toChar}
                    onChange={e => handleCharChange(idx, e.target.value)}
                    onFocus={e => e.target.select()}
                    placeholder="?"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {isMapped && (
                    <button
                      className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-gray-200 text-gray-600 hover:bg-red-200 hover:text-red-700 flex items-center justify-center text-[8px] shadow-sm transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCharChange(idx, '')
                      }}
                      title="Clear this mapping"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">
            Click a field and type a letter (or 0–9) to map. Mapped cells are highlighted in blue.
          </p>
        </>
      )}

      {/* Text View – Side‑by‑side comparison */}
      {isTextMode && (
        <div className="space-y-4">
          <input
            type="text"
            value={mapRaw}
            onChange={handleTextChange}
            placeholder="26 unique letters or numbers (0-25)"
            className="w-full px-3 py-2.5 text-center text-lg font-mono font-bold uppercase tracking-widest border border-gray-300 rounded-md bg-white text-gray-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-300 focus:outline-none transition-colors"
            spellCheck={false}
            autoComplete="off"
          />
          <div className="text-xs text-gray-400 text-center">
            Numbers are converted to letters: 0→A, 8→I, 25→Z
          </div>

          {/* Comparison rows */}
          <div className="bg-gray-50 rounded-md border border-gray-200 p-3 overflow-x-auto">
            <div className="flex flex-col items-center gap-1.5 min-w-max">
              {/* Plaintext row */}
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-semibold text-gray-400 mr-2 w-12 text-right">Plain</span>
                {alphabetArray.map((c, i) => (
                  <span
                    key={`plain-${i}`}
                    className="w-7 text-center text-xs font-mono text-gray-500"
                  >
                    {c}
                  </span>
                ))}
              </div>
              {/* Cipher row */}
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-semibold text-gray-400 mr-2 w-12 text-right">Cipher</span>
                {alphabetArray.map((c, i) => {
                  const mapped = padded[i] || ''
                  const isMapped = mapped && mapped !== c
                  return (
                    <span
                      key={`cipher-${i}`}
                      className={`
                        w-7 text-center text-sm font-mono font-bold
                        ${isMapped ? 'text-primary-600' : 'text-gray-300'}
                      `}
                    >
                      {mapped || '·'}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            The top row shows the alphabet (plaintext), the bottom row shows the corresponding cipher letters.
          </p>
        </div>
      )}
    </div>
  )
}