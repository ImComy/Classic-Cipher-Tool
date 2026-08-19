import React from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import { setActiveSession, updateActiveSessionData } from '../../store/slices/sessionSlice'
import { restoreCipherState } from '../../store/slices/cipherSlice'
import { useToast } from '../../hooks/useToast'

export const SessionList: React.FC<{ className?: string }> = ({ className = '' }) => {
  const dispatch = useAppDispatch()
  const { sessions, activeSessionId } = useAppSelector(state => state.session)
  const { selectedCipher, operation, inputText, keyData } = useAppSelector(
    state => state.cipher
  )
  const { toast } = useToast()

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    if (!id) return

    // Save current active session state before switching
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

    const target = sessions.find(s => s.id === id)
    if (target) {
      dispatch(setActiveSession(id))
      dispatch(
        restoreCipherState({
          cipher: target.cipher,
          op: target.op,
          text: target.text,
          keyData: target.keyData,
        })
      )
      toast(`Loaded: ${target.name || 'untitled'}`)
    }
  }

  return (
    <select
      id="sessionSelect"
      className={`w-auto min-w-[100px] md:min-w-[120px] px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none ${className}`}
      value={activeSessionId || ''}
      onChange={handleSelect}
    >
      <option value="">— Sessions —</option>
      {sessions.map(s => (
        <option key={s.id} value={s.id}>
          {s.name || 'Untitled'}
        </option>
      ))}
    </select>
  )
}
