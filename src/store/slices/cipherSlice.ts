import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface CipherState {
  selectedCipher: string
  operation: 'encrypt' | 'decrypt'
  inputText: string
  outputText: string
  keyData: Record<string, any>
  keyUsed: string
}

const initialState: CipherState = {
  selectedCipher: 'shift',
  operation: 'encrypt',
  inputText: 'HELLO WORLD',
  outputText: '',
  keyData: { k: 3 },
  keyUsed: '—',
}

const cipherSlice = createSlice({
  name: 'cipher',
  initialState,
  reducers: {
    setCipher: (state, action: PayloadAction<string>) => {
      state.selectedCipher = action.payload
    },
    setOperation: (state, action: PayloadAction<'encrypt' | 'decrypt'>) => {
      state.operation = action.payload
    },
    setInputText: (state, action: PayloadAction<string>) => {
      state.inputText = action.payload
    },
    setOutputText: (state, action: PayloadAction<string>) => {
      state.outputText = action.payload
    },
    setKeyData: (state, action: PayloadAction<Record<string, any>>) => {
      state.keyData = { ...state.keyData, ...action.payload }
    },
    setAllKeyData: (state, action: PayloadAction<Record<string, any>>) => {
      state.keyData = action.payload
    },
    setKeyUsed: (state, action: PayloadAction<string>) => {
      state.keyUsed = action.payload
    },
    restoreCipherState: (
      state,
      action: PayloadAction<{
        cipher?: string
        op?: 'encrypt' | 'decrypt'
        text?: string
        keyData?: Record<string, any>
      }>
    ) => {
      if (action.payload.cipher !== undefined) state.selectedCipher = action.payload.cipher
      if (action.payload.op !== undefined) state.operation = action.payload.op
      if (action.payload.text !== undefined) state.inputText = action.payload.text
      if (action.payload.keyData !== undefined) state.keyData = action.payload.keyData
      state.outputText = ''
      state.keyUsed = '—'
    },
    clearWorkspace: state => {
      state.inputText = ''
      state.outputText = ''
      state.keyUsed = '—'
    },
    swapInputOutput: state => {
      const out = state.outputText
      if (out && !out.includes('empty') && !out.startsWith('ERROR')) {
        state.inputText = out
        state.outputText = ''
      }
    },
  },
})

export const {
  setCipher,
  setOperation,
  setInputText,
  setOutputText,
  setKeyData,
  setAllKeyData,
  setKeyUsed,
  restoreCipherState,
  clearWorkspace,
  swapInputOutput,
} = cipherSlice.actions

export default cipherSlice.reducer