import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setKeyData } from '../../../store/slices/cipherSlice'
import { Button } from '../../../components/ui/Button'
import { ALPHABET, shuffleArray } from '../../../lib/utils/string'
import { useToast } from '../../../hooks/useToast'

export const SubstitutionKeyInput: React.FC = () => {
  const dispatch = useAppDispatch()
  const keyData = useAppSelector(state => state.cipher.keyData)
  const { toast } = useToast()
  const [isTextMode, setIsTextMode] = useState(false)
  const alphabetArray = ALPHABET.split('')
  const [keyString, setKeyString] = useState<string>('')

  useEffect(() => {
    const raw = keyData.map ?? ''
    let fixed = raw.padEnd(26, '.')
    if (fixed.length > 26) fixed = fixed.slice(0, 26)
    // Keep only letters A-Z or '.', and convert identity letters to '.'
    fixed = fixed
      .split('')
      .map((c, i) => {
        if (c >= 'A' && c <= 'Z') {
          // If the letter is the same as the plaintext, treat as identity
          return c === alphabetArray[i] ? '.' : c
        }
        return '.'
      })
      .join('')
    setKeyString(fixed)
  }, [keyData.map, alphabetArray])

  const mappedCount = keyString.split('').filter((c, i) => c !== '.' && c !== alphabetArray[i]).length
  const isComplete = mappedCount === 26
  const statusText = isComplete ? 'Complete ✓' : `Partial (${mappedCount}/26 mapped)`
  const statusColor = isComplete ? 'green' : 'yellow'

  const updatePosition = (index: number, char: string) => {
    // If char is '.', explicitly set identity
    if (char === '.') {
      const newKey = keyString.slice(0, index) + '.' + keyString.slice(index + 1)
      setKeyString(newKey)
      dispatch(setKeyData({ map: newKey }))
      return
    }

    // Otherwise, only allow A-Z
    let newChar = char.toUpperCase()
    if (!/^[A-Z]$/.test(newChar)) return

    // If the typed letter equals the plaintext, treat as identity
    if (newChar === alphabetArray[index]) {
      newChar = '.'
    }

    const newKey = keyString.slice(0, index) + newChar + keyString.slice(index + 1)
    setKeyString(newKey)
    dispatch(setKeyData({ map: newKey }))
  }

  const handleGridChange = (index: number, val: string) => {
    let char = val.toUpperCase().replace(/[^A-Z]/g, '')
    if (char.length > 1) char = char.slice(-1)
    updatePosition(index, char)
  }

  const handleGridKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key
    if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault()
      updatePosition(index, '.')
      return
    }
    if (key.length === 1 && key >= 'a' && key <= 'z') {
      e.preventDefault()
      updatePosition(index, key.toUpperCase())
      return
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.toUpperCase()
    raw = raw.replace(/[^A-Z.]/g, '')
    let fixed = raw.padEnd(26, '.')
    if (fixed.length > 26) fixed = fixed.slice(0, 26)
    // Convert identity letters to '.'
    const cleaned = fixed.split('').map((c, i) => (c === alphabetArray[i] ? '.' : c)).join('')
    setKeyString(cleaned)
    dispatch(setKeyData({ map: cleaned }))
  }

  const handleRandom = () => {
    const shuffled = shuffleArray(ALPHABET.split('')).join('')
    setKeyString(shuffled)
    dispatch(setKeyData({ map: shuffled }))
    toast('Random substitution key generated.')
  }

  const isMapped = (index: number) => {
    const c = keyString[index] || '.'
    return c !== '.' && c !== alphabetArray[index]
  }

  const displayChar = (index: number) => {
    const c = keyString[index] || '.'
    return c === '.' ? alphabetArray[index] : c
  }

  const missingLetters = alphabetArray.filter((_, i) => {
    const c = keyString[i] || '.'
    return c === '.' || c === alphabetArray[i]
  })

  return (
    <div className="w-full p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Key:{' '}
            <span className={`font-bold text-${statusColor}-600`}>{statusText}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md overflow-hidden border border-gray-200 bg-gray-50 p-0.5">
            <button
              className={`
                px-2.5 py-1 text-xs font-medium rounded transition-colors
                ${!isTextMode ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}
              `}
              onClick={() => setIsTextMode(false)}
            >
              <i className="fas fa-th mr-1"></i> Grid
            </button>
            <button
              className={`
                px-2.5 py-1 text-xs font-medium rounded transition-colors
                ${isTextMode ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}
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
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-2 sm:gap-2.5">
            {alphabetArray.map((letter, idx) => {
              const mapped = isMapped(idx)
              const display = displayChar(idx)

              return (
                <div
                  key={letter}
                  className={`
                    relative flex flex-col items-center justify-center
                    p-2 rounded-md border
                    transition-all duration-200
                    min-h-[68px]
                    ${mapped
                      ? 'border-primary-300 bg-primary-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-xs font-bold text-gray-500 uppercase">{letter}</span>
                  <i
                    className={`fas fa-arrow-down text-[10px] my-0.5 ${mapped ? 'text-primary-500' : 'text-gray-300'
                      }`}
                  />
                  <input
                    type="text"
                    className={`
                      w-full min-w-[30px] px-1 py-0.5
                      text-center text-sm font-mono font-bold uppercase
                      border rounded transition-colors duration-150
                      outline-none focus:ring-2 focus:ring-primary-300
                      ${mapped
                        ? 'border-primary-400 bg-white text-primary-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400'
                      }
                    `}
                    maxLength={1}
                    value={display}
                    onChange={e => handleGridChange(idx, e.target.value)}
                    onKeyDown={e => handleGridKeyDown(idx, e)}
                    onFocus={e => e.currentTarget.select()}
                    onClick={e => e.currentTarget.select()}
                    placeholder="?"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {mapped && (
                    <button
                      className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-gray-200 text-gray-600 hover:bg-red-200 hover:text-red-700 flex items-center justify-center text-[8px] shadow-sm transition-colors"
                      onClick={() => updatePosition(idx, '.')}
                      title="Clear this mapping"
                    >
                      <i className="fas fa-times" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">
            Click a cell and type any letter – it instantly replaces the current mapping.
            Press Backspace or click the × to clear the mapping (reset to identity).
          </p>
        </>
      )}

      {/* Text View */}
      {isTextMode && (
        <div className="space-y-4">
          <input
            type="text"
            value={keyString}
            onChange={handleTextChange}
            placeholder="Type 26 characters: letters or '.' for identity"
            className="w-full px-3 py-2.5 text-center text-lg font-mono font-bold tracking-widest border border-gray-300 rounded-md bg-white text-gray-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-300 focus:outline-none transition-colors"
            spellCheck={false}
            autoComplete="off"
          />
          <div className="text-xs text-gray-400 text-center">
            Use a dot (<span className="font-mono">.</span>) for identity.
          </div>

          <div className="bg-gray-50 rounded-md border border-gray-200 p-3 overflow-x-auto">
            <div className="flex flex-col items-center gap-1.5 min-w-max">
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-semibold text-gray-400 mr-2 w-12 text-right">Plain</span>
                {alphabetArray.map((c, i) => (
                  <span key={`plain-${i}`} className="w-7 text-center text-xs font-mono text-gray-500">
                    {c}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-semibold text-gray-400 mr-2 w-12 text-right">Cipher</span>
                {alphabetArray.map((c, i) => {
                  const mapped = isMapped(i)
                  const display = displayChar(i)
                  return (
                    <span
                      key={`cipher-${i}`}
                      className={`w-7 text-center text-sm font-mono font-bold ${mapped ? 'text-primary-600' : 'text-gray-300'
                        }`}
                    >
                      {mapped ? display : '·'}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

          {missingLetters.length > 0 && (
            <div className="text-xs text-gray-500 text-center bg-yellow-50 border border-yellow-200 rounded-md p-2">
              <span className="font-medium">Identity mappings:</span> {missingLetters.join(', ')}
              <span className="ml-1">(these letters map to themselves)</span>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            The top row is the plaintext alphabet; the bottom row shows the cipher mapping.
            A <span className="text-gray-300">·</span> means identity (no change).
          </p>
        </div>
      )}
    </div>
  )
}