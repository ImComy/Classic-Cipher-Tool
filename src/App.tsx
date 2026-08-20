import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './store'
import { loadSessions, updateActiveSessionData } from './store/slices/sessionSlice'
import { restoreCipherState } from './store/slices/cipherSlice'
import { closeModal } from './store/slices/uiSlice'
import { Header } from './components/Header'
import { SessionSidebar } from './components/SessionSidebar'
import { CipherRunner } from './features/cipher/CipherRunner'
import { LabWorkspace } from './features/lab/LabWorkspace'
import { StepsModal } from './components/StepsModal'
import { TipsModal } from './components/TipsModal'
import { AnalysisModal } from './features/analysis/AnalysisModal'
import { DictionaryModal } from './features/dictionary/DictionaryModal'
import { ToolsModal } from './features/tools/ToolsModal'
import { Toast } from './components/ui/Toast'

export function App() {
  const dispatch = useAppDispatch()
  const { sessions, activeSessionId, loading } = useAppSelector(state => state.session)
  const { inputText, selectedCipher, operation, keyData } = useAppSelector(state => state.cipher)
  const { activeModal, activeWorkspace } = useAppSelector(state => state.ui)
  const isInitialRestore = useRef(false)

  // Load sessions from IndexedDB on startup
  useEffect(() => {
    dispatch(loadSessions())
  }, [dispatch])

  // When sessions finish loading, restore active session to cipher state
  useEffect(() => {
    if (!loading && sessions.length > 0 && activeSessionId && !isInitialRestore.current) {
      const active = sessions.find(s => s.id === activeSessionId) || sessions[0]
      dispatch(
        restoreCipherState({
          cipher: active.cipher,
          op: active.op,
          text: active.text,
          keyData: active.keyData,
        })
      )
      isInitialRestore.current = true
    }
  }, [loading, sessions, activeSessionId, dispatch])

  // Debounced auto-save of active session when workspace state changes
  useEffect(() => {
    if (!loading && activeSessionId && isInitialRestore.current) {
      const timer = setTimeout(() => {
        dispatch(
          updateActiveSessionData({
            cipher: selectedCipher,
            op: operation,
            text: inputText,
            keyData,
          })
        )
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [inputText, selectedCipher, operation, keyData, activeSessionId, loading, dispatch])

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
      <Header />

      <main className="max-w-6xl w-full mx-auto px-3 md:px-6 py-4 md:py-6 flex flex-col gap-4 flex-1">
        {activeWorkspace === 'desk' ? <CipherRunner /> : <LabWorkspace />}
      </main>

      {/* Modals */}
      <StepsModal />
      <TipsModal
        isOpen={activeModal === 'tipsModal'}
        onClose={() => dispatch(closeModal())}
      />
      <AnalysisModal
        isOpen={activeModal === 'analysisModal'}
        onClose={() => dispatch(closeModal())}
      />
      <DictionaryModal
        isOpen={activeModal === 'dictionaryModal'}
        onClose={() => dispatch(closeModal())}
      />
      <ToolsModal
        isOpen={activeModal === 'toolsModal'}
        onClose={() => dispatch(closeModal())}
      />
      <SessionSidebar />

      {/* Global Toast */}
      <Toast />
    </div>
  )
}

export default App