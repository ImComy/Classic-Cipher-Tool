import type { Middleware } from '@reduxjs/toolkit'
import { saveSessionsToDB } from '../../lib/db/indexedDB'

let saveTimer: ReturnType<typeof setTimeout> | null = null

export const persistenceMiddleware: Middleware = store => next => action => {
  const result = next(action)
  const actionType = (action as { type?: string })?.type || ''

  if (
    actionType.startsWith('session/') &&
    !actionType.startsWith('session/loadSessions') &&
    !actionType.startsWith('session/saveSessions')
  ) {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      const state = store.getState() as any
      if (state.session?.sessions) {
        saveSessionsToDB(state.session.sessions)
      }
    }, 300)
  }

  return result
}
