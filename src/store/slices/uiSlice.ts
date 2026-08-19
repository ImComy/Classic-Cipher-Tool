import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  statusMessage: string
  lastRunTime: string | null
  toastMessage: string | null
  toastVisible: boolean
  activeModal: string | null
}

const initialState: UIState = {
  statusMessage: 'Ready',
  lastRunTime: null,
  toastMessage: null,
  toastVisible: false,
  activeModal: null,
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
  },
})

export const { setStatus, setLastRun, showToast, hideToast, openModal, closeModal } =
  uiSlice.actions

export default uiSlice.reducer