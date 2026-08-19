import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import {
  addSession,
  deleteSession,
  setActiveSession,
  setSessions,
  updateActiveSessionData,
} from '../store/slices/sessionSlice'
import { restoreCipherState } from '../store/slices/cipherSlice'
import { setSessionSidebarOpen } from '../store/slices/uiSlice'
import { Button } from './ui/Button'
import { SessionList } from '../features/sessions/SessionList'
import { exportSessions, importSessions } from '../features/sessions/SessionActions'
import { useToast } from '../hooks/useToast'
import type { Session } from '../lib/types'
import { formatSessionName } from '../lib/utils/string'

export const SessionSidebar: React.FC = () => {
  const dispatch = useAppDispatch()
  const { sessionSidebarOpen } = useAppSelector(state => state.ui)
  const { sessions, activeSessionId } = useAppSelector(state => state.session)
  const { selectedCipher, operation, inputText, keyData } = useAppSelector(
    state => state.cipher
  )
  const { toast } = useToast()

  const handleClose = () => {
    dispatch(setSessionSidebarOpen(false))
  }

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sessionSidebarOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [sessionSidebarOpen])

  const handleNew = () => {
    if (activeSessionId) {
      dispatch(
        updateActiveSessionData({
          cipher: selectedCipher,
          op: operation,
          text: inputText,
          keyData,
        })
      )
    }

    const timestamp = Date.now()
    const id = 'session_' + timestamp + '_' + Math.random().toString(36).slice(2, 6)
    const newSession: Session = {
      id,
      name: formatSessionName(timestamp),
      text: 'HELLO WORLD',
      cipher: 'shift',
      op: 'encrypt',
      keyData: { k: 3 },
      timestamp,
    }
    dispatch(addSession(newSession))
    dispatch(
      restoreCipherState({
        cipher: newSession.cipher,
        op: newSession.op,
        text: newSession.text,
        keyData: newSession.keyData,
      })
    )
    toast(`Created session "${newSession.name}".`)
  }

  const handleSave = () => {
    if (!activeSessionId) {
      toast('No active session to save.')
      return
    }
    dispatch(
      updateActiveSessionData({
        cipher: selectedCipher,
        op: operation,
        text: inputText,
        keyData,
      })
    )
    toast('Session saved.')
  }

  const handleDelete = () => {
    if (!activeSessionId) {
      toast('No active session.')
      return
    }
    if (window.confirm('Delete the current session?')) {
      const deletedId = activeSessionId
      const remaining = sessions.filter(s => s.id !== deletedId)
      dispatch(deleteSession(deletedId))

      if (remaining.length > 0) {
        const next = remaining[0]
        dispatch(
          restoreCipherState({
            cipher: next.cipher,
            op: next.op,
            text: next.text,
            keyData: next.keyData,
          })
        )
      } else {
        const id = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
        const fresh: Session = {
          id,
          name: formatSessionName(),
          text: 'HELLO WORLD',
          cipher: 'shift',
          op: 'encrypt',
          keyData: { k: 3 },
          timestamp: Date.now(),
        }
        dispatch(addSession(fresh))
        dispatch(
          restoreCipherState({
            cipher: fresh.cipher,
            op: fresh.op,
            text: fresh.text,
            keyData: fresh.keyData,
          })
        )
      }
      toast('Session deleted.')
    }
  }

  const handleExport = () => exportSessions(sessions, toast)
  const handleImport = () => {
    importSessions(importedSessions => {
      dispatch(setSessions(importedSessions))
      if (importedSessions.length > 0) {
        const first = importedSessions[0]
        dispatch(setActiveSession(first.id))
        dispatch(
          restoreCipherState({
            cipher: first.cipher,
            op: first.op,
            text: first.text,
            keyData: first.keyData,
          })
        )
      }
    }, toast)
  }

  return (
    <>
      {/* Overlay */}
      {sessionSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-200 cursor-pointer"
          onClick={handleClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sessionSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header with gradient */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary-50/80 to-white border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                <i className="fas fa-folder text-sm"></i>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Sessions</h2>
                <p className="text-xs text-gray-400">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Session List */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Active Session
            </label>
            <div className="bg-gray-50/80 rounded-lg border border-gray-200 p-1">
              <SessionList />
            </div>
          </div>

          {/* Session Controls */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Manage
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="primary" onClick={handleNew} className="w-full justify-center">
                <i className="fas fa-plus mr-1.5"></i> New
              </Button>
              <Button variant="emerald" onClick={handleSave} className="w-full justify-center">
                <i className="fas fa-save mr-1.5"></i> Save
              </Button>
              <Button variant="danger" onClick={handleDelete} className="w-full justify-center col-span-2">
                <i className="fas fa-trash mr-1.5"></i> Delete Current
              </Button>
            </div>
          </div>

          {/* Data Management */}
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Data Management
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="blue" onClick={handleExport} className="w-full justify-center">
                <i className="fas fa-file-export mr-1.5"></i> Export
              </Button>
              <Button variant="purple" onClick={handleImport} className="w-full justify-center">
                <i className="fas fa-file-import mr-1.5"></i> Import
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}