import { store } from '../../store'
import {
  addSession,
  deleteSession,
  setActiveSession,
  setSessions,
  updateActiveSessionData,
  updateSession,
} from '../../store/slices/sessionSlice'
import { restoreCipherState } from '../../store/slices/cipherSlice'
import type { Session } from '../../lib/types'
import { formatSessionName } from '../../lib/utils/string'

export const SessionStore = {
  getSessions(): Session[] {
    return store.getState().session.sessions
  },

  getActiveSession(): Session | undefined {
    const { sessions, activeSessionId } = store.getState().session
    return sessions.find(s => s.id === activeSessionId)
  },

  createNewSession(): Session {
    const timestamp = Date.now()
    const id = 'session_' + timestamp + '_' + Math.random().toString(36).slice(2, 6)
    const newSession: Session = {
      id,
      name: formatSessionName(timestamp),
      text: 'HELLO WORLD',
      cipher: 'shift',
      op: 'encrypt',
      keyData: { k: 3 },
      timestamp: Date.now(),
    }
    store.dispatch(addSession(newSession))
    store.dispatch(
      restoreCipherState({
        cipher: newSession.cipher,
        op: newSession.op,
        text: newSession.text,
        keyData: newSession.keyData,
      })
    )
    return newSession
  },

  deleteActiveSession(): void {
    const { activeSessionId } = store.getState().session
    if (activeSessionId) {
      store.dispatch(deleteSession(activeSessionId))
      const nextActive = SessionStore.getActiveSession()
      if (nextActive) {
        store.dispatch(
          restoreCipherState({
            cipher: nextActive.cipher,
            op: nextActive.op,
            text: nextActive.text,
            keyData: nextActive.keyData,
          })
        )
      } else {
        SessionStore.createNewSession()
      }
    }
  },

  updateActive(data: Partial<Omit<Session, 'id'>>): void {
    store.dispatch(updateActiveSessionData(data))
  },

  update(session: Session): void {
    store.dispatch(updateSession(session))
  },

  setAll(sessions: Session[]): void {
    store.dispatch(setSessions(sessions))
  },

  selectSession(id: string): void {
    const session = store.getState().session.sessions.find(s => s.id === id)
    if (session) {
      store.dispatch(setActiveSession(id))
      store.dispatch(
        restoreCipherState({
          cipher: session.cipher,
          op: session.op,
          text: session.text,
          keyData: session.keyData,
        })
      )
    }
  },
}
