import React from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import {
  setInputText,
  swapInputOutput,
  clearWorkspace,
} from '../../store/slices/cipherSlice'
import { setStatus } from '../../store/slices/uiSlice'
import { updateActiveSessionData } from '../../store/slices/sessionSlice'
import { CipherSelector } from './CipherSelector'
import { KeyInputArea } from '../../components/KeyInputArea'
import { OutputBox } from '../../components/OutputBox'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../hooks/useToast'

export const CipherRunner: React.FC = () => {
  const dispatch = useAppDispatch()
  const { inputText, outputText, keyUsed } = useAppSelector(state => state.cipher)
  const { statusMessage, lastRunTime } = useAppSelector(state => state.ui)
  const { sessions, activeSessionId } = useAppSelector(state => state.session)
  const { toast } = useToast()

  const activeSession = sessions.find(s => s.id === activeSessionId)

  const handleSwap = () => {
    if (outputText && !outputText.includes('empty') && !outputText.startsWith('ERROR')) {
      dispatch(swapInputOutput())
      toast('Swapped input/output.')
    } else {
      toast('No valid output to swap.')
    }
  }

  const handleClear = () => {
    dispatch(clearWorkspace())
    dispatch(setStatus('Cleared'))
    toast('Workspace cleared.')
  }

  const handleRename = () => {
    if (!activeSession) {
      toast('No active session.')
      return
    }

    const name = prompt('Session name:', activeSession.name)
    if (name !== null) {
      const trimmedName = name.trim()
      if (trimmedName) {
        dispatch(updateActiveSessionData({ name: trimmedName }))
        toast('Session renamed.')
      }
    }
  }

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 md:p-6">
      {/* Workspace Header */}
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-3 flex-wrap">
        <i className="fas fa-terminal text-primary-400"></i>
        Cipher Workspace
        <button
          type="button"
          id="sessionNameDisplay"
          title="Rename session"
          onClick={handleRename}
          className="font-normal text-xs text-gray-400 ml-2 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded px-1"
        >
          {activeSession?.name || '(untitled)'}
        </button>
      </div>

      {/* Cipher Selector */}
      <CipherSelector />

      {/* Dynamic Key Input Area */}
      <KeyInputArea />

      {/* Action Row */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Button variant="outline" size="sm" id="swapBtn" onClick={handleSwap}>
          <i className="fas fa-arrow-right-arrow-left mr-2"></i> Swap
        </Button>
        <Button variant="outline" size="sm" id="clearBtn" onClick={handleClear}>
          <i className="fas fa-eraser mr-2"></i> Clear
        </Button>
        <span className="text-xs text-gray-400 ml-auto self-center hidden sm:inline">
          <i className="fas fa-info-circle mr-1"></i> Numbers in keys → letters (0=A, 1=B, …)
        </span>
      </div>

      {/* Input / Output Textareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="inputText"
            className="text-sm font-semibold text-gray-500 block mb-0.5"
          >
            Input <span className="font-normal text-xs text-gray-400">(type or paste)</span>
          </label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={e => dispatch(setInputText(e.target.value))}
            placeholder="Enter text to encrypt or decrypt…"
            className="w-full min-h-[160px] px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-800 font-mono focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-y"
          />
        </div>
        <OutputBox />
      </div>

      {/* Status Bar */}
      <div className="flex flex-wrap gap-3 md:gap-6 mt-3 pt-2 text-sm text-gray-500 border-t border-gray-100">
        <span>
          <i className="far fa-clock mr-1.5 text-gray-400"></i> Last run:{' '}
          <span id="lastRun" className="font-medium text-gray-700">
            {lastRunTime || '—'}
          </span>
        </span>
        <span>
          <i className="fas fa-key mr-1.5 text-gray-400"></i> Key:{' '}
          <span id="keyUsed" className="font-medium text-gray-700">
            {keyUsed || '—'}
          </span>
        </span>
        <span>
          <i className="fas fa-info-circle mr-1.5 text-gray-400"></i>{' '}
          <span id="statusMsg" className="font-medium text-gray-700">
            {statusMessage || 'Ready'}
          </span>
        </span>
      </div>
    </div>
  )
}
