import React from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import {
  setInputText,
  swapInputOutput,
  clearWorkspace,
} from '../../store/slices/cipherSlice'
import { setStatus, setWorkspace, openModal } from '../../store/slices/uiSlice'
import { updateActiveSessionData } from '../../store/slices/sessionSlice'
import { setCiphertext } from '../../store/slices/labSlice'
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

  const handleSendToLab = () => {
    if (outputText && !outputText.startsWith('ERROR')) {
      dispatch(setCiphertext(outputText))
      dispatch(setWorkspace('lab'))
      toast('Sent output to Crypto Lab.')
    } else if (inputText) {
      dispatch(setCiphertext(inputText))
      dispatch(setWorkspace('lab'))
      toast('Sent input to Crypto Lab.')
    } else {
      toast('Nothing to send.')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with session rename and action buttons */}
      <div className="px-5 py-4 bg-gradient-to-r from-primary-50/80 to-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
            <i className="fas fa-terminal"></i>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Cipher Workspace</h2>
            <button
              type="button"
              onClick={handleRename}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
            >
              <span>{activeSession?.name || '(untitled)'}</span>
              <i className="fas fa-pen text-[10px] opacity-60"></i>
            </button>
          </div>
        </div>

        {/* Action buttons group */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="xs"
            onClick={() => dispatch(openModal('tipsModal'))}
            className="text-gray-600 hover:text-amber-600"
          >
            <i className="fas fa-lightbulb mr-1.5 text-amber-500"></i>
            Tips
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => dispatch(openModal('toolsModal'))}
            className="text-gray-600 hover:text-primary-600"
          >
            <i className="fas fa-tools mr-1.5 text-primary-500"></i>
            Tools
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Cipher & Operation Selectors */}
        <CipherSelector />

        {/* Input Text - first */}
        <div>
          <label htmlFor="inputText" className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Input Text
          </label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={e => dispatch(setInputText(e.target.value))}
            placeholder="Type or paste text to encrypt / decrypt…"
            className="w-full min-h-[100px] px-4 py-3 text-sm font-mono border border-gray-200 rounded-lg bg-gray-50/50 text-gray-800 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none transition resize-y placeholder:text-gray-400"
          />
        </div>

        {/* Key Input - second */}
        <KeyInputArea />

        {/* Action Buttons - third */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Button variant="outline" size="sm" onClick={handleSwap}>
              <i className="fas fa-arrow-right-arrow-left mr-1.5"></i> Swap
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <i className="fas fa-eraser mr-1.5"></i> Clear
            </Button>
            <Button variant="primary" size="sm" onClick={handleSendToLab}>
              <i className="fas fa-flask mr-1.5"></i> Send The Output to Lab
            </Button>
          </div>
        </div>

        {/* Output - fourth */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            Output
          </label>
          <OutputBox />
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-gray-500 border-t border-gray-100">
          <span className="flex items-center gap-1.5">
            <i className="far fa-clock text-gray-400"></i>
            Last run: <span className="font-medium text-gray-700">{lastRunTime || '—'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="fas fa-key text-gray-400"></i>
            Key: <span className="font-medium text-gray-700 font-mono">{keyUsed || '—'}</span>
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <i className="fas fa-info-circle text-gray-400"></i>
            <span className="font-medium text-gray-700">{statusMessage || 'Ready'}</span>
          </span>
        </div>
      </div>
    </div>
  )
}