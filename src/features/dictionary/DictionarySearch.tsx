import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'

interface DictEntry {
  word: string
  definitions: string[]
}

export const DictionarySearch: React.FC = () => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<DictEntry[] | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Normal exact lookup using Free Dictionary API
  const fetchExactDefinition = async (word: string): Promise<DictEntry[] | null> => {
    try {
      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
      )
      if (!res.ok) return null
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) return null

      const results: DictEntry[] = []
      for (const entry of data) {
        const w = entry.word || word
        const meanings = entry.meanings || []
        const defs: string[] = []
        for (const m of meanings) {
          const part = m.partOfSpeech || ''
          const def = m.definitions && m.definitions[0] ? m.definitions[0].definition : ''
          if (def) defs.push(`${part}: ${def}`)
        }
        results.push({ word: w, definitions: defs.length > 0 ? defs : ['(no definition)'] })
      }
      return results
    } catch {
      return null
    }
  }

  // Pattern search using Datamuse API (wildcards: * = any chars, ? = one char)
  const fetchPatternMatches = async (pattern: string): Promise<DictEntry[] | null> => {
    try {
      // Clean pattern – only letters, *, ?
      const clean = pattern.replace(/[^a-zA-Z*?]/g, '')
      if (!clean) return null

      const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(clean)}&md=d`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Datamuse API error')
      const data = await res.json()

      if (!Array.isArray(data) || data.length === 0) return null

      const results: DictEntry[] = []
      for (const item of data) {
        const word = item.word || ''
        const defs = item.defs || []
        const cleanedDefs = defs.map((d: string) => {
          const parts = d.split('\t')
          if (parts.length === 2) {
            return `${parts[0]}: ${parts[1]}`
          }
          return d
        })
        results.push({
          word,
          definitions: cleanedDefs.length > 0 ? cleanedDefs : ['(no definition)']
        })
      }
      return results
    } catch {
      return null
    }
  }

  const handleSearch = async () => {
    const trimmed = query.trim()
    if (!trimmed) {
      setEntries(null)
      setErrorMsg('Type a word or pattern to search.')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setEntries(null)

    // Auto-detect: if the query contains * or ?, treat as pattern
    const isPattern = /[*?]/.test(trimmed)

    let results: DictEntry[] | null = null

    if (isPattern) {
      results = await fetchPatternMatches(trimmed)
      if (!results || results.length === 0) {
        setErrorMsg(`No words match pattern "${trimmed}".`)
      } else {
        setEntries(results)
      }
    } else {
      results = await fetchExactDefinition(trimmed)
      if (!results) {
        setErrorMsg(`No results for "${trimmed}".`)
      } else {
        setEntries(results)
      }
    }

    setLoading(false)
  }

  const handleClear = () => {
    setQuery('')
    setEntries(null)
    setErrorMsg(null)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="font-semibold text-gray-800 flex items-center gap-2">
          <i className="fas fa-book text-primary-500"></i>
          Dictionary Lookup
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Exact words use the Free Dictionary API; patterns with <code className="bg-gray-200 px-1 rounded">*</code> or <code className="bg-gray-200 px-1 rounded">?</code> use Datamuse wildcard search.
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
              placeholder="Type a word or pattern (e.g., t??k, crypto*)"
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

        {/* Wildcard Help (tooltip) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <strong>💡 Wildcard help:</strong>{' '}
          <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">*</code> matches any number of letters,{' '}
          <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">?</code> matches exactly one letter.
          <span className="block mt-1 text-blue-600">
            Example: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">t??k</code> finds 4‑letter words starting with T and ending with K.
          </span>
          <span className="block mt-1 text-blue-600">
            Example: <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[10px]">crypto*</code> finds words starting with "crypto".
          </span>
        </div>

        {/* Results */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 min-h-[80px] p-3">
          {entries && entries.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {entries.length} result{entries.length > 1 ? 's' : ''}
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

          {errorMsg && (
            <div className="text-sm text-gray-500 italic text-center py-4">
              <i className="fas fa-info-circle mr-1.5 text-gray-400"></i>
              {errorMsg}
            </div>
          )}

          {!entries && !errorMsg && (
            <div className="text-xs text-gray-400 italic text-center py-4">
              Type a word or pattern (e.g., <code className="bg-gray-100 px-1 rounded">t??k</code>) and hit Search.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}