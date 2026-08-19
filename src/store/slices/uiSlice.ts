import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  statusMessage: string
  lastRunTime: string | null
  toastMessage: string | null
  toastVisible: boolean
  activeModal: string | null
  activeWorkspace: 'desk' | 'lab'
  sessionSidebarOpen: boolean
}

const initialState: UIState = {
  statusMessage: 'Ready',
  lastRunTime: null,
  toastMessage: null,
  toastVisible: false,
  activeModal: null,
  activeWorkspace: 'desk',
  sessionSidebarOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<string>) => {
      state.statusMessage = action.payload
    },
    setLastRun: (state, action: PayloadAction<string>) => {
      state.lastRunTime = action.payload
    },
    showToast: (state, action: PayloadAction<string>) => {
      state.toastMessage = action.payload
      state.toastVisible = true
    },
    hideToast: state => {
      state.toastVisible = false
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload
    },
    closeModal: state => {
      state.activeModal = null
    },
    setWorkspace: (state, action: PayloadAction<'desk' | 'lab'>) => {
      state.activeWorkspace = action.payload
    },
    setSessionSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sessionSidebarOpen = action.payload
    },
  },
})

export const { setStatus, setLastRun, showToast, hideToast, openModal, closeModal, setWorkspace, setSessionSidebarOpen } =
  uiSlice.actions

export default uiSlice.reducer