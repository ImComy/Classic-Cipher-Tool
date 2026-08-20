import React, { useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import {
  setCiphertext,
  resetLabState,
  setActiveLabTool,
  setToolsCollapsed,
  toggleToolCollapse,
} from '../../store/slices/labSlice'
import { setInputText } from '../../store/slices/cipherSlice'
import { setWorkspace, openModal } from '../../store/slices/uiSlice'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../hooks/useToast'
import { useLivePreview } from './useLivePreview'
import { SubstitutionSolver } from './tools/SubstitutionSolver'
import { CaesarLabTool } from './tools/CaesarLabTool'
import { AffineLabTool } from './tools/AffineLabTool'
import { cleanText } from '../../lib/utils/string'

export const LabWorkspace: React.FC = () => {
  const dispatch = useAppDispatch()
  const { ciphertext, livePreview, toolsCollapsed, collapsedTools, activeLabTool } = useAppSelector(
    (state) => state.lab
  )
  const { outputText } = useAppSelector((state) => state.cipher)
  const { toast } = useToast()

  const [highlightChanges, setHighlightChanges] = useState(true)

  useLivePreview()

  // Compute cleaned ciphertext (letters only, uppercase) – this is what the decryption uses
  const cleanedCiphertext = useMemo(() => cleanText(ciphertext), [ciphertext])

  const handlePasteFromDesk = () => {
    if (outputText && !outputText.startsWith('ERROR')) {
      dispatch(setCiphertext(outputText))
      toast('Copied from Desk output.')
    } else {
      toast('No valid output in Cipher Desk to copy.')
    }
  }

  const handleApplyToDesk = () => {
    if (livePreview) {
      dispatch(setInputText(livePreview))
      dispatch(setWorkspace('desk'))
      toast('Applied to Cipher Desk input.')
    }
  }

  const tools = [
    { id: 'substitution', name: 'Substitution Solver', component: SubstitutionSolver, icon: 'fa-font' },
    { id: 'caesar', name: 'Caesar Brute Force', component: CaesarLabTool, icon: 'fa-list-ol' },
    { id: 'affine', name: 'Affine Cracker', component: AffineLabTool, icon: 'fa-sliders' },
  ] as const

  const handleToolClick = (toolId: typeof tools[number]['id']) => {
    if (toolsCollapsed) {
      dispatch(setToolsCollapsed(false))
    }
    if (activeLabTool !== toolId) {
      dispatch(setActiveLabTool(toolId))
      if (collapsedTools.includes(toolId)) {
        dispatch(toggleToolCollapse(toolId))
      }
    }
  }

  const toggleTools = () => {
    dispatch(setToolsCollapsed(!toolsCollapsed))
  }

  // Build highlighted preview – compare char by char with the cleaned ciphertext
  const renderPreview = () => {
    if (!livePreview) {
      return <span className="text-indigo-300 italic">Preview will appear here...</span>
    }

    if (!highlightChanges) {
      return <span>{livePreview}</span>
    }

    // Both livePreview and cleanedCiphertext are the same length (letters only)
    const previewChars = livePreview.split('')
    const sourceChars = cleanedCiphertext.split('')

    // In case lengths differ (shouldn't happen), fallback to simple display
    if (previewChars.length !== sourceChars.length) {
      return <span>{livePreview}</span>
    }

    return previewChars.map((char, i) => {
      const sourceChar = sourceChars[i] || ' '
      const isDifferent = char !== sourceChar
      const isLetter = /[a-zA-Z]/.test(char)

      // Only highlight letters that differ and are letters
      if (isDifferent && isLetter) {
        return (
          <span
            key={i}
            className="bg-yellow-200/60 dark:bg-yellow-300/30 rounded px-0.5 py-0.5"
          >
            {char}
          </span>
        )
      }
      return <span key={i}>{char}</span>
    })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 flex-1 h-full max-w-7xl mx-auto w-full px-4 py-4">
      {/* MAIN CONTENT: Source + Preview */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Ciphertext Source */}
        <div className="lab-panel flex flex-col min-h-[180px] lg:min-h-[220px] bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 shrink-0">
            <div className="font-semibold text-gray-700 flex items-center gap-2">
              <i className="fas fa-lock text-slate-400"></i>
              <span className="text-sm">Ciphertext Source</span>
            </div>
            <Button variant="outline" size="xs" onClick={handlePasteFromDesk}>
              <i className="fas fa-paste mr-1"></i> Paste from Desk
            </Button>
          </div>
          <textarea
            value={ciphertext}
            onChange={(e) => dispatch(setCiphertext(e.target.value))}
            placeholder="Paste or type unknown ciphertext here..."
            className="w-full flex-1 p-4 bg-transparent border-none outline-none resize-none font-mono text-sm text-gray-800 placeholder:text-gray-300"
          />
        </div>

        {/* Mobile Tools - Improved section header */}
        <div className="lg:hidden flex flex-col w-full">
          <button
            onClick={toggleTools}
            className="flex items-center justify-between w-full px-4 py-3 bg-primary-50 hover:bg-primary-100 rounded-t-xl border border-primary-200 transition-colors shadow-sm"
          >
            <div className="font-semibold text-primary-800 flex items-center gap-2">
              <i className="fas fa-toolbox text-primary-500"></i>
              <span>Analysis Tools</span>
              <span className="text-xs font-normal text-primary-400 ml-2">
                {toolsCollapsed ? 'closed' : 'open'}
              </span>
            </div>
            <i className={`fas fa-chevron-${toolsCollapsed ? 'down' : 'up'} text-xs text-primary-400 transition-transform`}></i>
          </button>

          {!toolsCollapsed && (
            <div className="border border-t-0 border-primary-200 rounded-b-xl bg-white/90 p-3 space-y-2 max-h-[350px] overflow-y-auto">
              {tools.map((tool) => {
                const isActive = activeLabTool === tool.id
                const isCollapsed = collapsedTools.includes(tool.id)

                return (
                  <div
                    key={tool.id}
                    className={`
                      rounded-xl border transition-all duration-200 overflow-hidden shadow-sm
                      ${isActive
                        ? 'border-primary-400 ring-2 ring-primary-400/20 bg-primary-50/50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <button
                      className={`
                        w-full flex items-center justify-between px-4 py-3 text-left transition-colors
                        ${isActive ? 'bg-primary-50/80' : 'hover:bg-gray-50'}
                      `}
                      onClick={() => {
                        if (!isActive) {
                          handleToolClick(tool.id)
                        } else {
                          dispatch(toggleToolCollapse(tool.id))
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-7 h-7 flex items-center justify-center rounded-lg
                            ${isActive ? 'bg-primary-200 text-primary-700' : 'bg-gray-100 text-gray-500'}
                          `}
                        >
                          <i className={`fas ${tool.icon} text-xs`}></i>
                        </div>
                        <span className={`font-medium text-sm ${isActive ? 'text-primary-900' : 'text-gray-700'}`}>
                          {tool.name}
                        </span>
                      </div>
                      <i
                        className={`
                          fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200
                          ${!isCollapsed && isActive ? 'rotate-180' : ''}
                        `}
                      ></i>
                    </button>
                    <div
                      className={`
                        transition-all duration-300 ease-in-out overflow-hidden
                        ${isActive && !isCollapsed ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
                      `}
                    >
                      <div className="border-t border-gray-100 bg-gray-50/30">
                        <tool.component />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Mobile Investigation Tools - clearly separated */}
              <div className="pt-3 mt-2 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-2">
                  Investigation Tools
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(openModal('analysisModal'))}
                    className="flex-1 min-w-[80px] justify-center border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <i className="fas fa-chart-bar mr-1.5"></i> Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(openModal('dictionaryModal'))}
                    className="flex-1 min-w-[80px] justify-center border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <i className="fas fa-book mr-1.5"></i> Dictionary
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch(openModal('toolsModal'))}
                    className="flex-1 min-w-[80px] justify-center border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <i className="fas fa-tools mr-1.5"></i> Tools
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className="lab-panel flex flex-col min-h-[180px] lg:min-h-[220px] bg-white rounded-xl shadow-sm border border-indigo-200">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-indigo-100 shrink-0 bg-indigo-50/30">
            <div className="font-semibold text-indigo-900 flex items-center gap-2">
              <i className="fas fa-eye text-indigo-400"></i>
              <span className="text-sm">Trial Decryption</span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Highlight toggle */}
              <Button
                variant={highlightChanges ? 'primary' : 'outline'}
                size="xs"
                onClick={() => setHighlightChanges(!highlightChanges)}
                className={`transition-colors ${highlightChanges ? 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <i className={`fas fa-highlighter mr-1 ${highlightChanges ? 'text-indigo-500' : ''}`}></i>
                {highlightChanges ? 'Hide' : 'Show'} Changes
              </Button>
              <Button variant="outline" size="xs" onClick={() => dispatch(resetLabState())}>
                <i className="fas fa-rotate-left mr-1"></i> Reset
              </Button>
              <Button variant="primary" size="xs" onClick={handleApplyToDesk}>
                <i className="fas fa-share mr-1"></i> Send to Desk
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 bg-indigo-50/10 overflow-y-auto font-mono text-sm text-indigo-950 whitespace-pre-wrap break-all">
            {renderPreview()}
          </div>
        </div>
      </div>

      {/* DESKTOP TOOLS SIDEBAR - now hugs content */}
      <div className="hidden lg:flex lg:w-80 xl:w-96 flex-shrink-0 self-start">
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100 bg-primary-50/50">
            <div className="font-bold text-primary-800 flex items-center gap-2">
              <i className="fas fa-toolbox text-primary-500"></i>
              <span>Analysis Tools</span>
            </div>
            <span className="text-xs text-primary-400 font-medium">
              {tools.filter(t => !collapsedTools.includes(t.id) && activeLabTool === t.id).length > 0 ? 'Active' : 'Ready'}
            </span>
          </div>

          {/* Tools List - with smooth expand/collapse */}
          <div className="p-3 space-y-2 bg-gray-50/30">
            {tools.map((tool) => {
              const isActive = activeLabTool === tool.id
              const isCollapsed = collapsedTools.includes(tool.id)

              return (
                <div
                  key={tool.id}
                  className={`
                    rounded-xl border transition-all duration-200 overflow-hidden shadow-sm
                    ${isActive
                      ? 'border-primary-400 ring-2 ring-primary-400/20 bg-primary-50/50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <button
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-left transition-colors
                      ${isActive ? 'bg-primary-50/80' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => {
                      if (activeLabTool !== tool.id) {
                        dispatch(setActiveLabTool(tool.id))
                        if (collapsedTools.includes(tool.id)) {
                          dispatch(toggleToolCollapse(tool.id))
                        }
                      } else {
                        dispatch(toggleToolCollapse(tool.id))
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-7 h-7 flex items-center justify-center rounded-lg
                          ${isActive ? 'bg-primary-200 text-primary-700' : 'bg-gray-100 text-gray-500'}
                        `}
                      >
                        <i className={`fas ${tool.icon} text-xs`}></i>
                      </div>
                      <span className={`font-medium text-sm ${isActive ? 'text-primary-900' : 'text-gray-700'}`}>
                        {tool.name}
                      </span>
                    </div>
                    <i
                      className={`
                        fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200
                        ${!isCollapsed && isActive ? 'rotate-180' : ''}
                      `}
                    ></i>
                  </button>
                  <div
                    className={`
                      transition-all duration-300 ease-in-out overflow-hidden
                      ${isActive && !isCollapsed ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    <div className="border-t border-gray-100 bg-gray-50/30">
                      <tool.component />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sidebar Footer - Investigation Tools */}
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50/80">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-2.5">
              Investigation Tools
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(openModal('analysisModal'))}
                className="justify-center border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
              >
                <i className="fas fa-chart-bar mr-1.5"></i> Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(openModal('dictionaryModal'))}
                className="justify-center border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
              >
                <i className="fas fa-book mr-1.5"></i> Dict
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(openModal('toolsModal'))}
                className="justify-center border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
              >
                <i className="fas fa-tools mr-1.5"></i> Tools
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}