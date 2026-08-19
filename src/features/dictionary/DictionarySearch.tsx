import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'

const BUILTIN_WORDS = [
  'test',
  'cipher',
  'code',
  'encrypt',
  'decrypt',
  'key',
  'shift',
  'affine',
  'vigenere',
  'hill',
  'permutation',
  'autokey',
  'security',
  'cryptography',
  'algorithm',
  'modular',
  'inverse',
  'matrix',
]

interface DictEntry {
  word: string
  definitions: string[]
}

export const DictionarySearch: React.FC = () => {
  const [query, setQuery] = useState('')
  const [regexMode, setRegexMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<DictEntry[] | null>(null)
  const [fallbackMatches, setFallbackMatches] = useState<string[] | null>(null)
  const [patternMatches, setPatternMatches] = useState<string[] | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSearch = async () => {
    const trimmed = query.trim()
    if (!trimmed) {
      setEntries(null)
      setFallbackMatches(null)
      setPatternMatches(null)
      setErrorMsg('Type a word to search.')
      return
    }

    if (regexMode) {
      let pattern: RegExp
      try {
        pattern = new RegExp(trimmed, 'i')
      } catch {
        setEntries(null)
        setFallbackMatches(null)
        setPatternMatches(null)
        setErrorMsg('That pattern is not quite valid. Check the symbols and try again.')
        return
      }

      const matches = BUILTIN_WORDS.filter(word => pattern.test(word))
      setEntries(null)
      setFallbackMatches(null)
      setPatternMatches(matches.length > 0 ? matches : null)
      setErrorMsg(matches.length > 0 ? null : `No built-in words match "${trimmed}".`)
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setEntries(null)
    setFallbackMatches(null)
    setPatternMatches(null)

    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmed)}`
      )
      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        const results: DictEntry[] = []
        for (const entry of data) {
          const word = entry.word || trimmed
          const meanings = entry.meanings || []
          const defs: string[] = []
          for (const m of meanings) {
            const part = m.partOfSpeech || ''
            const def = m.definitions && m.definitions[0] ? m.definitions[0].definition : ''
            if (def) defs.push(`${part}: ${def}`)
          }
          results.push({ word, definitions: defs.length > 0 ? defs : ['(no definition)'] })
        }
        setEntries(results)
      } else {
        setErrorMsg(`No results for "${trimmed}".`)
      }
    } catch {
      // Fallback
      const matches = BUILTIN_WORDS.filter(w => w.includes(trimmed.toLowerCase()))
      if (matches.length > 0) {
        setFallbackMatches(matches)
      } else {
        setErrorMsg(`No matches in built-in dictionary. API unavailable.`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setRegexMode(false)
    setEntries(null)
    setFallbackMatches(null)
    setPatternMatches(null)
    setErrorMsg(null)
  }

  return (
    <div className="w-full">
      <p className="text-gray-600 text-sm mb-2">Look up words to help with decryption.</p>
      <div className="flex flex-wrap gap-2 mb-2">
        <input
          type="text"
          id="dictSearch"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSearch()
          }}
          placeholder={regexMode ? 'Try ^c.*r$ or [aeiou]' : 'Type a word…'}
          className="flex-1 min-w-30 px-3 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <Button
          variant="primary"
          size="sm"
          id="dictSearchBtn"
          onClick={handleSearch}
          disabled={loading}
        >
          <i className="fas fa-search mr-2"></i> {loading ? 'Searching...' : 'Search'}
        </Button>
        <Button variant="outline" size="sm" id="dictClearBtn" onClick={handleClear}>
          <i className="fas fa-undo mr-2"></i> Clear
        </Button>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 mb-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={regexMode}
          onChange={e => {
            setRegexMode(e.target.checked)
            setEntries(null)
            setFallbackMatches(null)
            setPatternMatches(null)
            setErrorMsg(null)
          }}
          className="accent-primary-600"
        />
        <span>Pattern search</span>
        <span className="text-gray-400">(beginner-friendly regex)</span>
      </label>
      {regexMode && (
        <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded p-2 mb-2">
          <strong className="text-gray-700">Simple pattern guide:</strong>{' '}
          <code>^</code> starts with, <code>$</code> ends with, <code>.</code> means any one letter,{' '}
          <code>.*</code> means any number of letters. For example, <code>^c.*r$</code> finds words
          starting with C and ending with R. Pattern search checks the built-in dictionary.
        </div>
      )}

      <div className="max-h-75 overflow-y-auto mt-2 space-y-1.5" id="dictResults">
        {entries &&
          entries.map((item, idx) => (
            <div key={idx} className="dict-word">
              <span className="word">{item.word}</span>
              <span className="freq">{item.definitions.slice(0, 2).join('; ')}</span>
            </div>
          ))}

        {fallbackMatches && (
          <div>
            <div className="text-xs text-amber-600 mb-1">
              API offline. Showing built-in dictionary matches:
            </div>
            {fallbackMatches.slice(0, 40).map((w, idx) => (
              <div key={idx} className="dict-word mb-1">
                <span className="word">{w}</span>
                <span className="freq">{w.length} letters</span>
              </div>
            ))}
            {fallbackMatches.length > 40 && (
              <div className="text-gray-400 text-sm">
                … and {fallbackMatches.length - 40} more
              </div>
            )}
          </div>
        )}

        {patternMatches && (
          <div>
            <div className="text-xs text-emerald-600 mb-1">
              Pattern matches from the built-in dictionary:
            </div>
            {patternMatches.slice(0, 40).map((word, idx) => (
              <div key={idx} className="dict-word mb-1">
                <span className="word">{word}</span>
                <span className="freq">{word.length} letters</span>
              </div>
            ))}
          </div>
        )}

        {errorMsg && <div className="text-gray-400 text-sm">{errorMsg}</div>}

        {!entries && !fallbackMatches && !patternMatches && !errorMsg && (
          <div className="text-gray-400 text-sm">
            {regexMode ? 'Try a pattern and hit Search.' : 'Type a word and hit Search.'}
          </div>
        )}
      </div>
    </div>
  )
}
