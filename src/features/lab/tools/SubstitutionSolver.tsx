import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setSubMapping, clearSubMapping, setSubstitutionMapping } from '../../../store/slices/labSlice'
import { Button } from '../../../components/ui/Button'
import { useToast } from '../../../hooks/useToast'

// English letter frequency order (most common to least)
const ENGLISH_FREQ_ORDER = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'.split('')

export const SubstitutionSolver: React.FC = () => {
  const dispatch = useAppDispatch()
  const { subMapping, ciphertext } = useAppSelector(state => state.lab)
  const { toast } = useToast()

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const [viewMode, setViewMode] = useState<'grid' | 'text'>('grid')

  const handleClear = () => {
    dispatch(clearSubMapping())
  }

  const mappedCount = alphabet.filter(c => subMapping[c] && subMapping[c].length > 0).length

  // Build the full key string from the mapping
  const getKeyString = () => {
    return alphabet.map(c => subMapping[c] || '').join('')
  }

  const handleKeyStringChange = (value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 26)
    const padded = clean.padEnd(26, '')
    alphabet.forEach((c, i) => {
      const mappedChar = padded[i] || ''
      dispatch(setSubMapping({ char: c, mappedTo: mappedChar }))
    })
  }

  const handlePasteExample = () => {
    const example = 'QWERTYUIOPASDFGHJKLZXCVBNM'
    handleKeyStringChange(example)
  }

  // Auto‑map ciphertext letters by frequency to English letter frequencies
  const handleAutoMap = () => {
    const text = ciphertext
    if (!text.trim()) {
      toast('No ciphertext to analyse. Please enter some text first.')
      return
    }

    // Count frequency of each letter (A–Z)
    const freq: Record<string, number> = {}
    for (const ch of text) {
      if (/[A-Za-z]/.test(ch)) {
        const upper = ch.toUpperCase()
        freq[upper] = (freq[upper] || 0) + 1
      }
    }

    // Sort letters by frequency descending
    const sortedLetters = Object.keys(freq).sort((a, b) => freq[b] - freq[a])

    // Build new mapping: most frequent cipher letter → most common English letter
    const newMapping: Record<string, string> = {}
    const limit = Math.min(sortedLetters.length, ENGLISH_FREQ_ORDER.length)
    for (let i = 0; i < limit; i++) {
      newMapping[sortedLetters[i]] = ENGLISH_FREQ_ORDER[i]
    }

    // Replace entire mapping with the new one
    dispatch(setSubstitutionMapping(newMapping))
    toast(`Auto‑mapped ${limit} letters by frequency.`)
  }

  // Grid keydown handler: replace on letter, clear on backspace/delete
  const handleGridKeyDown = (
    c: string,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const key = e.key
    if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault()
      dispatch(setSubMapping({ char: c, mappedTo: '' }))
      return
    }
    if (key.length === 1 && key >= 'a' && key <= 'z') {
      e.preventDefault()
      dispatch(setSubMapping({ char: c, mappedTo: key.toUpperCase() }))
      return
    }
    // Allow other keys (arrows, tab, etc.)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header with stats, mode toggle, and actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Mappings: <span className="font-bold text-primary-600">{mappedCount}</span> / 26
          </span>
          <span className="text-xs text-gray-400">
            {mappedCount === 26 ? '✅ Complete' : `⏳ ${26 - mappedCount} remaining`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-md overflow-hidden border border-gray-200 bg-gray-50 p-0.5">
            <button
              className={`
                px-2.5 py-1 text-xs font-medium rounded transition-colors
                ${viewMode === 'grid'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
              onClick={() => setViewMode('grid')}
            >
              <i className="fas fa-th mr-1"></i> Grid
            </button>
            <button
              className={`
                px-2.5 py-1 text-xs font-medium rounded transition-colors
                ${viewMode === 'text'
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
              onClick={() => setViewMode('text')}
            >
              <i className="fas fa-font mr-1"></i> Text
            </button>
          </div>

          {/* Auto-map button */}
          <Button
            variant="outline"
            size="xs"
            onClick={handleAutoMap}
            className="text-indigo-600 hover:bg-indigo-50 border-indigo-200"
          >
            <i className="fas fa-magic mr-1.5"></i> Auto-map
          </Button>

          {/* Clear button */}
          <Button
            variant="outline"
            size="xs"
            onClick={handleClear}
            className="text-red-600 hover:bg-red-50"
          >
            <i className="fas fa-eraser mr-1.5"></i> Clear
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          <div className="
            grid 
            grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 
            gap-2 sm:gap-2.5
          ">
            {alphabet.map(c => {
              const mapped = subMapping[c] || ''
              const isMapped = mapped.length > 0

              return (
                <div
                  key={c}
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
                  {/* Ciphertext letter */}
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    {c}
                  </span>

                  {/* Arrow indicator */}
                  <i className={`
                    fas fa-arrow-down text-[10px] my-0.5
                    ${isMapped ? 'text-primary-500' : 'text-gray-300'}
                  `}></i>

                  {/* Plaintext input */}
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
                    value={mapped}
                    onChange={e => {
                      const val = e.target.value.toUpperCase()
                      if ((val >= 'A' && val <= 'Z') || val === '') {
                        dispatch(setSubMapping({ char: c, mappedTo: val }))
                      }
                    }}
                    onKeyDown={e => handleGridKeyDown(c, e)}
                    onFocus={e => e.currentTarget.select()}
                    onClick={e => e.currentTarget.select()}
                    placeholder="?"
                    spellCheck={false}
                    autoComplete="off"
                  />

                  {/* Clear single mapping button */}
                  {isMapped && (
                    <button
                      className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-gray-200 text-gray-600 hover:bg-red-200 hover:text-red-700 flex items-center justify-center text-[8px] shadow-sm transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch(setSubMapping({ char: c, mappedTo: '' }))
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
Use Auto-Mapping to automatically map frequent characters to the most common letters in the English language
          </p>
        </>
      )}

      {/* Text View */}
      {viewMode === 'text' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="text"
                className="
                  w-full px-3 py-2.5
                  text-center text-lg font-mono font-bold uppercase tracking-widest
                  border border-gray-300 rounded-md
                  bg-white text-gray-800
                  focus:border-primary-400 focus:ring-2 focus:ring-primary-300 focus:outline-none
                  transition-colors
                "
                value={getKeyString()}
                onChange={e => handleKeyStringChange(e.target.value)}
                placeholder="Type or paste 26 letters (e.g., QWERTYUIOPASDFGHJKLZXCVBNM)"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={handlePasteExample}
              className="shrink-0"
            >
              <i className="fas fa-dice mr-1.5"></i> Example
            </Button>
          </div>

          {/* Show mapping preview */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs bg-gray-50 rounded-md p-2 border border-gray-200">
            <span className="font-semibold text-gray-600 mr-1">Plain:</span>
            {alphabet.map((c, i) => {
              const mapped = subMapping[c] || ''
              return (
                <span
                  key={i}
                  className={`
                    inline-block w-6 text-center font-mono font-bold
                    ${mapped ? 'text-primary-600' : 'text-gray-300'}
                  `}
                >
                  {mapped || '·'}
                </span>
              )
            })}
            <span className="text-gray-300 mx-1">|</span>
            <span className="font-semibold text-gray-600 mr-1">Cipher:</span>
            {alphabet.map((c, i) => (
              <span key={i} className="inline-block w-6 text-center font-mono text-xs text-gray-500">
                {c}
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-1">
            Type or paste a 26‑letter substitution key. Empty positions show as <span className="text-gray-300">·</span>.
          </p>
        </div>
      )}
    </div>
  )
}