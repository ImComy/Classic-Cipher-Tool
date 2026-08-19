import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface LabState {
  ciphertext: string
  livePreview: string
  subMapping: Record<string, string>
  activeLabTool: 'substitution' | 'caesar' | 'vigenere' | 'affine' | null
  affineA: number
  affineB: number
  caesarShift: number | null
  vigenereKey: string
  toolsCollapsed: boolean
  collapsedTools: string[]
}

const initialState: LabState = {
  ciphertext: '',
  livePreview: '',
  subMapping: {},
  activeLabTool: null,
  affineA: 5,
  affineB: 3,
  caesarShift: null,
  vigenereKey: 'KEY',
  toolsCollapsed: false,
  collapsedTools: [],
}

const labSlice = createSlice({
  name: 'lab',
  initialState,
  reducers: {
    setCiphertext: (state, action: PayloadAction<string>) => {
      state.ciphertext = action.payload
    },
    setLivePreview: (state, action: PayloadAction<string>) => {
      state.livePreview = action.payload
    },
    setSubMapping: (state, action: PayloadAction<{ char: string; mappedTo: string }>) => {
      const { char, mappedTo } = action.payload
      if (!mappedTo) {
        delete state.subMapping[char]
      } else {
        state.subMapping[char] = mappedTo
      }
    },
    clearSubMapping: state => {
      state.subMapping = {}
    },
    setActiveLabTool: (state, action: PayloadAction<LabState['activeLabTool']>) => {
      state.activeLabTool = action.payload
    },
    setAffineA: (state, action: PayloadAction<number>) => {
      state.affineA = action.payload
    },
    setAffineB: (state, action: PayloadAction<number>) => {
      state.affineB = action.payload
    },
    setCaesarShift: (state, action: PayloadAction<number | null>) => {
      state.caesarShift = action.payload
    },
    setVigenereKey: (state, action: PayloadAction<string>) => {
      state.vigenereKey = action.payload
    },
    setToolsCollapsed: (state, action: PayloadAction<boolean>) => {
      state.toolsCollapsed = action.payload
    },
    toggleToolCollapse: (state, action: PayloadAction<string>) => {
      const tool = action.payload
      if (state.collapsedTools.includes(tool)) {
        state.collapsedTools = state.collapsedTools.filter(t => t !== tool)
      } else {
        state.collapsedTools.push(tool)
      }
    },
    resetLabState: state => {
      state.livePreview = state.ciphertext
      state.subMapping = {}
      state.affineA = 5
      state.affineB = 3
      state.caesarShift = null
      state.vigenereKey = 'KEY'
    },
  },
})

export const {
  setCiphertext,
  setLivePreview,
  setSubMapping,
  clearSubMapping,
  setActiveLabTool,
  setAffineA,
  setAffineB,
  setCaesarShift,
  setVigenereKey,
  setToolsCollapsed,
  toggleToolCollapse,
  resetLabState,
} = labSlice.actions

export default labSlice.reducer
