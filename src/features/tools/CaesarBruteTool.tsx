import React, { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { ShiftCipher } from '../../lib/ciphers/shift'

export const CaesarBruteTool: React.FC = () => {
  const [text, setText] = useState('KHOOR')
  const [result, setResult] = useState<string | null>(null)

  const handleBruteForce = () => {
    if (!text.trim()) {
      setResult('Enter cipher text.')
      return
    }
    let lines = ''
    for (let k = 1; k < 26; k++) {
      const res = ShiftCipher.decrypt(text, { k })
      lines += `Shift ${String(k).padStart(2, ' ')}: ${res.result}\n`
    }
    setResult(lines)
  }

  return (
    <div className="bg-gray-50 rounded p-4 border border-gray-200 md:col-span-2">
      <div className="font-semibold text-gray-800 flex items-center gap-2 mb-1">
        <i className="fas fa-list text-primary-400"></i> Caesar Brute Force
      </div>
      <div className="text-sm text-gray-500 mb-2">Show all 25 shifts of a Caesar cipher text</div>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <input
          type="text"
          id="bruteText"
          placeholder="Cipher text…"
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 min-w-[100px] px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <Button variant="primary" size="sm" id="bruteBtn" onClick={handleBruteForce}>
          Show All
        </Button>
      </div>
      <div
        className="bg-white border border-gray-200 rounded p-1.5 text-sm font-mono mt-1 min-h-[28px] max-h-[150px] overflow-y-auto whitespace-pre-wrap text-gray-800"
        id="bruteResult"
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
