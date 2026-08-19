import React, { useMemo, useRef, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { setCaesarShift } from '../../../store/slices/labSlice'
import { ShiftCipher } from '../../../lib/ciphers/shift'
import { cleanText } from '../../../lib/utils/string'
import { Button } from '../../../components/ui/Button'

export const CaesarLabTool: React.FC = () => {
  const dispatch = useAppDispatch()
  const { ciphertext, caesarShift } = useAppSelector(state => state.lab)
  const activeRef = useRef<HTMLDivElement>(null)

  const previewSnippets = useMemo(() => {
    const s = cleanText(ciphertext).substring(0, 60) // Show up to 60 chars preview
    if (!s) return []

    const results = []
    for (let k = 1; k < 26; k++) {
      results.push({
        shift: k,
        text: ShiftCipher.decrypt(s, { k }).result,
      })
    }
    return results
  }, [ciphertext])

  // Scroll to active shift when it changes
  useEffect(() => {
    if (caesarShift !== null && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [caesarShift])

  const handleClear = () => {
    dispatch(setCaesarShift(null))
  }

  if (!previewSnippets.length) {
    return (
      <div className="p-6 text-center text-sm text-gray-400 bg-gray-50 rounded-md border border-dashed border-gray-200">
        <i className="fas fa-search text-gray-300 text-2xl block mb-2"></i>
        Enter ciphertext to see brute-force options.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[300px]">
      {/* Header with controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50/80 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>All 25 Shifts</span>
          {caesarShift !== null && (
            <span className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
              Active: +{caesarShift}
            </span>
          )}
        </div>
        {caesarShift !== null && (
          <Button variant="outline" size="xs" onClick={handleClear}>
            <i className="fas fa-times mr-1"></i> Clear
          </Button>
        )}
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {previewSnippets.map(({ shift, text }) => {
          const isActive = caesarShift === shift

          return (
            <div
              key={shift}
              ref={isActive ? activeRef : undefined}
              className={`
                group flex items-center gap-3 px-3 py-2 rounded-md border transition-all duration-150 cursor-pointer
                ${isActive
                  ? 'border-primary-400 bg-primary-50 shadow-sm ring-1 ring-primary-400'
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                }
              `}
              onClick={() => dispatch(setCaesarShift(shift))}
            >
              {/* Shift badge */}
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm
                ${isActive
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }
              `}>
                +{shift}
              </div>

              {/* Decrypted text */}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-gray-800 truncate">
                  {text || ' '}
                </div>
              </div>

              {/* Active indicator / action hint */}
              <div className="flex-shrink-0">
                {isActive ? (
                  <i className="fas fa-check-circle text-primary-500"></i>
                ) : (
                  <i className="fas fa-chevron-right text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer hint */}
      <div className="shrink-0 px-3 py-1.5 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 text-center">
        Click any shift to apply it. Active shift is highlighted.
      </div>
    </div>
  )
}