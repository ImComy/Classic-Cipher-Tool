import React from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import {
  addSession,
  deleteSession,
  setActiveSession,
  setSessions,
  updateActiveSessionData,
} from '../store/slices/sessionSlice'
import { restoreCipherState } from '../store/slices/cipherSlice'
import { Button } from './ui/Button'
import { SessionList } from '../features/sessions/SessionList'
import { exportSessions, importSessions } from '../features/sessions/SessionActions'
import { useToast } from '../hooks/useToast'
import type { Session } from '../lib/types'
import { formatSessionName } from '../lib/utils/string'

export const SessionManager: React.FC = () => {
  const dispatch = useAppDispatch()
  const { sessions, activeSessionId } = useAppSelector(state => state.session)
  const { selectedCipher, operation, inputText, keyData } = useAppSelector(
    state => state.cipher
  )
  const { toast } = useToast()

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
        // Create a default session if all deleted
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

  const handleExport = () => {
    exportSessions(sessions, toast)
  }

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
    <div className="flex items-center gap-1.5 flex-wrap">
      <SessionList />
      <Button
        variant="primary"
        size="sm"
        id="sessionNewBtn"
        title="New Session"
        onClick={handleNew}
      >
        <i className="fas fa-plus mr-1"></i> <span className="hidden sm:inline">New</span>
      </Button>
      <Button
        variant="emerald"
        size="sm"
        id="sessionSaveBtn"
        title="Save Session"
        onClick={handleSave}
      >
        <i className="fas fa-save mr-1"></i> <span className="hidden sm:inline">Save</span>
      </Button>
      <Button
        variant="danger"
        size="sm"
        id="sessionDeleteBtn"
        title="Delete Session"
        onClick={handleDelete}
      >
        <i className="fas fa-trash"></i>
      </Button>
      <Button
        variant="blue"
        size="sm"
        id="sessionExportBtn"
        title="Export Sessions"
        onClick={handleExport}
      >
        <i className="fas fa-file-export mr-1"></i>{' '}
        <span className="hidden sm:inline">Export</span>
      </Button>
      <Button
        variant="purple"
        size="sm"
        id="sessionImportBtn"
        title="Import Sessions"
        onClick={handleImport}
      >
        <i className="fas fa-file-import mr-1"></i>{' '}
        <span className="hidden sm:inline">Import</span>
      </Button>
    </div>
  )
}
