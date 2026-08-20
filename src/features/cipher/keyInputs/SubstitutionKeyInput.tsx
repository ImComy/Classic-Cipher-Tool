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

  // Sync with Redux on mount and when keyData changes
  useEffect(() => {
    setKeyString(keyData.map || '')
  }, [keyData.map])

  // Get the mapping for a specific position
  const getMappedChar = (index: number): string => {
    if (index < keyString.length) {
      const mapped = keyString[index]
      // If it's the same as the plaintext letter, treat as identity
      return mapped === alphabetArray[index] ? '.' : mapped
    }
    return '.'
  }

  const isMapped = (index: number): boolean => {
    const c = getMappedChar(index)
    return c !== '.'
  }

  const updatePosition = (index: number, char: string) => {
    let newKey = keyString
    // If the char is the same as the plaintext, we could keep it, but we'll remove it to treat as identity
    // However, to keep the key simple, we'll allow it; the cipher will map it to itself anyway.
    // We'll just set the character at that position.
    if (index >= newKey.length) {
      // Pad with spaces (or nothing) to reach index
      const pad = ' '.repeat(index - newKey.length)
      newKey = newKey + pad + char
    } else {
      // Replace character at index
      newKey = newKey.slice(0, index) + char + newKey.slice(index + 1)
    }
    // Remove any spaces (they are placeholders)
    const cleaned = newKey.replace(/ /g, '')
    setKeyString(cleaned)
    dispatch(setKeyData({ map: cleaned }))
  }

  const handleGridChange = (index: number, val: string) => {
    let char = val.toUpperCase().replace(/[^A-Z]/g, '')
    if (char.length > 1) char = char.slice(-1)
    if (char.length === 0) {
      // If cleared, remove the mapping at this position
      const newKey = keyString.slice(0, index) + keyString.slice(index + 1)
      setKeyString(newKey)
      dispatch(setKeyData({ map: newKey }))
      return
    }
    updatePosition(index, char)
  }

  const handleGridKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key
    if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault()
      // Remove mapping at this position
      const newKey = keyString.slice(0, index) + keyString.slice(index + 1)
      setKeyString(newKey)
      dispatch(setKeyData({ map: newKey }))
      return
    }
    if (key.length === 1 && key >= 'a' && key <= 'z') {
      e.preventDefault()
      updatePosition(index, key.toUpperCase())
      return
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z]/g, '')
    setKeyString(raw)
    dispatch(setKeyData({ map: raw }))
  }

  const handleRandom = () => {
    const shuffled = shuffleArray(ALPHABET.split('')).join('')
    setKeyString(shuffled)
    dispatch(setKeyData({ map: shuffled }))
    toast('Random substitution key generated.')
  }

  const handleClear = () => {
    setKeyString('')
    dispatch(setKeyData({ map: '' }))
  }

  // Count how many positions have a mapping (non-identity)
  const mappedCount = keyString.split('').filter((c, i) => c !== alphabetArray[i]).length

  return (
    <div className="w-full p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Key:{' '}
            <span className="font-bold text-primary-600">
              {mappedCount}/26 mapped
            </span>
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
          <Button variant="outline" size="xs" onClick={handleClear}>
            <i className="fas fa-eraser mr-1.5"></i> Clear
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {!isTextMode && (
        <>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-2 sm:gap-2.5">
            {alphabetArray.map((letter, idx) => {
              const mapped = isMapped(idx)
              const display = getMappedChar(idx) === '.' ? '' : getMappedChar(idx)

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
                    className={`fas fa-arrow-down text-[10px] my-0.5 ${mapped ? 'text-primary-500' : 'text-gray-300'}`}
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
                        : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-400'
                      }
                    `}
                    maxLength={1}
                    value={display}
                    onChange={e => handleGridChange(idx, e.target.value)}
                    onKeyDown={e => handleGridKeyDown(idx, e)}
                    onFocus={e => e.currentTarget.select()}
                    onClick={e => e.currentTarget.select()}
                    placeholder="·"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  {mapped && (
                    <button
                      className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-gray-200 text-gray-600 hover:bg-red-200 hover:text-red-700 flex items-center justify-center text-[8px] shadow-sm transition-colors"
                      onClick={() => {
                        const newKey = keyString.slice(0, idx) + keyString.slice(idx + 1)
                        setKeyString(newKey)
                        dispatch(setKeyData({ map: newKey }))
                      }}
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
            Click a cell and type a letter to set a mapping. Press Backspace or click × to clear.
          </p>
        </>
      )}

      {/* Text View – just a plain text input */}
      {isTextMode && (
        <div className="space-y-3">
          <input
            type="text"
            value={keyString}
            onChange={handleTextChange}
            placeholder="Type substitution key (e.g., QWERTYUIOPASDFGHJKLZXCVBNM)"
            className="w-full px-4 py-2.5 text-lg font-mono border border-gray-300 rounded-md bg-white text-gray-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-300 focus:outline-none transition-colors"
            spellCheck={false}
            autoComplete="off"
          />
          <div className="text-xs text-gray-400">
            <span className="font-medium">How it works:</span> The first letter maps to A, second to B, etc. Letters you don't specify map to themselves.
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
                {alphabetArray.map((_c, i) => {
                  const display = getMappedChar(i)
                  return (
                    <span
                      key={`cipher-${i}`}
                      className={`w-7 text-center text-sm font-mono font-bold ${display !== '.' ? 'text-primary-600' : 'text-gray-300'}`}
                    >
                      {display !== '.' ? display : '·'}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}