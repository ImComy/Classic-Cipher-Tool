import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { loadSessionsFromDB, saveSessionsToDB } from '../../lib/db/indexedDB'
import type { Session } from '../../lib/types'
import { formatSessionName } from '../../lib/utils/string'

interface SessionState {
  sessions: Session[]
  activeSessionId: string | null
  loading: boolean
}

const initialState: SessionState = {
  sessions: [],
  activeSessionId: null,
  loading: true,
}

export const loadSessions = createAsyncThunk('session/loadSessions', async () => {
  const data = await loadSessionsFromDB()
  if (data && data.length > 0) {
    return data
  }
  const defaultSession: Session = {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    name: formatSessionName(),
    text: 'HELLO WORLD',
    cipher: 'shift',
    op: 'encrypt',
    keyData: { k: 3 },
    timestamp: Date.now(),
  }
  await saveSessionsToDB([defaultSession])
  return [defaultSession]
})

export const saveSessions = createAsyncThunk('session/saveSessions', async (sessions: Session[]) => {
  await saveSessionsToDB(sessions)
  return sessions
})

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setActiveSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload
      localStorage.setItem('cryptotool_active', action.payload)
    },
    setSessions: (state, action: PayloadAction<Session[]>) => {
      state.sessions = action.payload
      if (!action.payload.some(s => s.id === state.activeSessionId)) {
        state.activeSessionId = action.payload.length > 0 ? action.payload[0].id : null
      }
    },
    addSession: (state, action: PayloadAction<Session>) => {
      state.sessions.unshift(action.payload)
      state.activeSessionId = action.payload.id
      localStorage.setItem('cryptotool_active', action.payload.id)
    },
    updateSession: (state, action: PayloadAction<Session>) => {
      const idx = state.sessions.findIndex(s => s.id === action.payload.id)
      if (idx !== -1) {
        state.sessions[idx] = action.payload
      }
    },
    updateActiveSessionData: (state, action: PayloadAction<Partial<Omit<Session, 'id'>>>) => {
      if (!state.activeSessionId) return
      const idx = state.sessions.findIndex(s => s.id === state.activeSessionId)
      if (idx !== -1) {
        state.sessions[idx] = {
          ...state.sessions[idx],
          ...action.payload,
          timestamp: Date.now(),
        }
      }
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(s => s.id !== action.payload)
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = state.sessions.length > 0 ? state.sessions[0].id : null
        if (state.activeSessionId) {
          localStorage.setItem('cryptotool_active', state.activeSessionId)
        } else {
          localStorage.removeItem('cryptotool_active')
        }
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadSessions.pending, state => {
        state.loading = true
      })
      .addCase(loadSessions.fulfilled, (state, action) => {
        state.sessions = action.payload
        state.loading = false
        const savedActive = localStorage.getItem('cryptotool_active')
        if (savedActive && state.sessions.some(s => s.id === savedActive)) {
          state.activeSessionId = savedActive
        } else if (state.sessions.length > 0) {
          state.activeSessionId = state.sessions[0].id
          localStorage.setItem('cryptotool_active', state.sessions[0].id)
        }
      })
      .addCase(loadSessions.rejected, state => {
        state.loading = false
      })
  },
})

export const {
  setActiveSession,
  setSessions,
  addSession,
  updateSession,
  updateActiveSessionData,
  deleteSession,
} = sessionSlice.actions

export default sessionSlice.reducer