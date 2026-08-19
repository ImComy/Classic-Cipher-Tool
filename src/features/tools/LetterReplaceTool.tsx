import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'

export const LetterReplaceTool: React.FC = () => {
  const [text, setText] = useState('HELLO')
  const [fromChar, setFromChar] = useState('')
  const [toChar, setToChar] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const handleReplace = () => {
    const f = fromChar.toUpperCase().slice(0, 1)
    const t = toChar.toUpperCase().slice(0, 1)
    if (!f || !t) {
      setResult('Specify From and To.')
      return
    }
    const escaped = f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    setResult(text.replace(new RegExp(escaped, 'g'), t))
  }

  return (
    <div className="bg-gray-50 rounded p-4 border border-gray-200">
      <div className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
        <i className="fas fa-exchange-alt text-primary-400"></i> Letter Replace
      </div>
      <div className="text-sm text-gray-500 mb-2">Replace one letter with another</div>
      <div className="flex flex-wrap items-center gap-1.5 mb-1">
        <input
          type="text"
          id="repText"
          placeholder="Text"
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 min-w-[60px] px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <input
          type="text"
          id="repFrom"
          placeholder="From"
          maxLength={1}
          value={fromChar}
          onChange={e => setFromChar(e.target.value.toUpperCase())}
          className="w-12 px-1 py-1 text-sm border border-gray-300 rounded bg-white text-center text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <input
          type="text"
          id="repTo"
          placeholder="To"
          maxLength={1}
          value={toChar}
          onChange={e => setToChar(e.target.value.toUpperCase())}
          className="w-12 px-1 py-1 text-sm border border-gray-300 rounded bg-white text-center text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <Button variant="primary" size="sm" id="repBtn" onClick={handleReplace}>
          Replace
        </Button>
      </div>
      <div
        className="bg-white border border-gray-200 rounded p-1.5 text-sm font-mono mt-1 min-h-[28px] overflow-y-auto"
        id="repResult"
      >
        {result !== null ? (
          result
        ) : (
          <span className="text-gray-400 font-sans italic">—</span>
        )}
      </div>
    </div>
  )
}
