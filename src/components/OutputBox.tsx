import React from 'react'
import { useAppSelector } from '../store'

export const OutputBox: React.FC = () => {
  const outputText = useAppSelector(state => state.cipher.outputText)

  const isError = typeof outputText === 'string' && outputText.startsWith('ERROR')

  return (
    <div className="w-full">
      <label className="text-sm font-semibold text-gray-500 block mb-0.5">
        Result <span className="font-normal text-xs text-gray-400">(output)</span>
      </label>
      <div
        id="outputBox"
        className="bg-gray-50 border border-gray-200 rounded p-3 min-h-[160px] max-h-[300px] overflow-y-auto font-mono text-sm whitespace-pre-wrap break-all text-gray-800"
      >
        {isError ? (
          <span className="text-red-600 font-sans font-medium">{outputText}</span>
        ) : outputText ? (
          outputText
        ) : (
          <span className="text-gray-400 font-sans italic">Run an operation to see result</span>
        )}
      </div>
    </div>
  )
}
