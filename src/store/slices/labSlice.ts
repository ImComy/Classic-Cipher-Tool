import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface LabState {
  ciphertext: string
  livePreview: string
  subMapping: Record<string, string>
  substitutionMapping: Record<string, string> | null
  activeLabTool: 'substitution' | 'caesar' | 'vigenere' | 'affine' | 'substitution-bf' | 'affine-bf' | null
  affineA: number
  affineB: number
  affineKey: { a: number; b: number } | null
  caesarShift: number | null
  vigenereKey: string
  toolsCollapsed: boolean
  collapsedTools: string[]
}

const initialState: LabState = {
  ciphertext: '',
  livePreview: '',
  subMapping: {},
  substitutionMapping: null,
  activeLabTool: null,
  affineA: 1,
  affineB: 0,
  affineKey: null,
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
      state.substitutionMapping = Object.keys(state.subMapping).length > 0 ? state.subMapping : null
    },
    setSubstitutionMapping: (state, action: PayloadAction<Record<string, string> | null>) => {
      state.subMapping = action.payload ?? {}
      state.substitutionMapping = action.payload ? { ...action.payload } : null
    },
    clearSubMapping: state => {
      state.subMapping = {}
      state.substitutionMapping = null
    },
    setActiveLabTool: (state, action: PayloadAction<LabState['activeLabTool']>) => {
      state.activeLabTool = action.payload
    },
    setAffineA: (state, action: PayloadAction<number>) => {
      state.affineA = action.payload
      state.affineKey = { a: action.payload, b: state.affineB }
    },
    setAffineB: (state, action: PayloadAction<number>) => {
      state.affineB = action.payload
      state.affineKey = { a: state.affineA, b: action.payload }
    },
    setAffineKey: (state, action: PayloadAction<{ a: number; b: number } | null>) => {
      if (!action.payload) {
        state.affineKey = null
        return
      }
      state.affineA = action.payload.a
      state.affineB = action.payload.b
      state.affineKey = action.payload
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
      state.affineA = 1
      state.affineB = 0
      state.caesarShift = null
      state.vigenereKey = 'KEY'
    },
  },
})

export const {
  setCiphertext,
  setLivePreview,
  setSubMapping,
  setSubstitutionMapping,
  clearSubMapping,
  setActiveLabTool,
  setAffineA,
  setAffineB,
  setAffineKey,
  setCaesarShift,
  setVigenereKey,
  setToolsCollapsed,
  toggleToolCollapse,
  resetLabState,
} = labSlice.actions

export default labSlice.reducer
