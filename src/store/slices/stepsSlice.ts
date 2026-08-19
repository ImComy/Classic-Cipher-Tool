import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Step } from '../../lib/types'

interface StepsState {
  steps: Step[]
  isOpen: boolean
  cipherName: string
  operationName: string
  finalResult: string
}

const initialState: StepsState = {
  steps: [],
  isOpen: false,
  cipherName: 'Shift',
  operationName: 'Encrypt',
  finalResult: '',
}

const stepsSlice = createSlice({
  name: 'steps',
  initialState,
  reducers: {
    setSteps: (state, action: PayloadAction<Step[]>) => {
      state.steps = action.payload
    },
    setStepsData: (
      state,
      action: PayloadAction<{
        steps: Step[]
        cipherName?: string
        operationName?: string
        finalResult?: string
      }>
    ) => {
      state.steps = action.payload.steps
      if (action.payload.cipherName) state.cipherName = action.payload.cipherName
      if (action.payload.operationName) state.operationName = action.payload.operationName
      if (action.payload.finalResult !== undefined) state.finalResult = action.payload.finalResult
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
    clearSteps: state => {
      state.steps = []
      state.finalResult = ''
    },
  },
})

export const { setSteps, setStepsData, setModalOpen, clearSteps } = stepsSlice.actions
export default stepsSlice.reducer