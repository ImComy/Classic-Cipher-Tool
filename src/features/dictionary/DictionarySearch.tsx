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

  const resultCount = entries?.length || fallbackMatches?.length || patternMatches?.length || 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          <i className="fas fa-book text-primary-500"></i>
          Dictionary Lookup
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Look up words to help with decryption and analysis
        </p>
      </div>

      <div className="p-4 space-y-3">
        {/* Search Input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearch()
              }}
              placeholder={regexMode ? 'Try ^c.*r$ or [aeiou]' : 'Type a word…'}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-search'} mr-1.5`}></i>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} className="flex-1 sm:flex-none">
              <i className="fas fa-undo mr-1.5"></i> Clear
            </Button>
          </div>
        </div>

        {/* Regex Toggle */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
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
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <span className="font-medium">Pattern search</span>
            <span className="text-xs text-gray-400">(regex)</span>
          </label>
          {regexMode && (
            <span className="text-xs text-gray-400">
              <i className="fas fa-info-circle mr-1"></i>
              built-in only
            </span>
          )}
        </div>

        {/* Regex Help */}
        {regexMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>Pattern guide:</strong>{' '}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">^</code> starts with,{' '}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">$</code> ends with,{' '}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">.</code> any single letter,{' '}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">.*</code> any letters.
            <span className="block mt-1 text-blue-600">
              Example: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">^c.*r$</code> finds words starting with C and ending with R
            </span>
          </div>
        )}

        {/* Results */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[80px] p-3">
          {entries && entries.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Results ({entries.length})
              </div>
              {entries.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="font-semibold text-gray-800 text-base">{item.word}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.definitions.slice(0, 2).map((def, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-gray-400">•</span>
                        <span>{def}</span>
                      </div>
                    ))}
                    {item.definitions.length > 2 && (
                      <div className="text-xs text-gray-400 mt-1">
                        + {item.definitions.length - 2} more definition
                        {item.definitions.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(fallbackMatches || patternMatches) && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {fallbackMatches ? 'Built-in matches' : 'Pattern matches'} ({resultCount})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(fallbackMatches || patternMatches || []).slice(0, 50).map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-sm font-mono bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    {word}
                  </span>
                ))}
                {(fallbackMatches || patternMatches || []).length > 50 && (
                  <span className="px-2.5 py-1 text-sm text-gray-400">
                    + {(fallbackMatches || patternMatches || []).length - 50} more
                  </span>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="text-sm text-gray-500 italic text-center py-4">
              <i className="fas fa-info-circle mr-1.5 text-gray-400"></i>
              {errorMsg}
            </div>
          )}

          {!entries && !fallbackMatches && !patternMatches && !errorMsg && (
            <div className="text-xs text-gray-400 italic text-center py-4">
              {regexMode ? 'Try a pattern and hit Search.' : 'Type a word and hit Search.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}