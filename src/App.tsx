import React, { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './store'
import { loadSessions, updateActiveSessionData } from './store/slices/sessionSlice'
import { restoreCipherState } from './store/slices/cipherSlice'
import { openModal, closeModal } from './store/slices/uiSlice'
import { Header } from './components/Header'
import { CipherRunner } from './features/cipher/CipherRunner'
import { StepsModal } from './components/StepsModal'
import { TipsModal } from './components/TipsModal'
import { AnalysisModal } from './features/analysis/AnalysisModal'
import { DictionaryModal } from './features/dictionary/DictionaryModal'
import { ToolsModal } from './features/tools/ToolsModal'
import { Toast } from './components/ui/Toast'
import { Button } from './components/ui/Button'

export function App() {
  const dispatch = useAppDispatch()
  const { sessions, activeSessionId, loading } = useAppSelector(state => state.session)
  const { inputText, selectedCipher, operation, keyData } = useAppSelector(state => state.cipher)
  const activeModal = useAppSelector(state => state.ui.activeModal)
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
        <CipherRunner />

        {/* Feature Buttons */}
        <div className="flex flex-wrap gap-1.5 px-1">
          <Button
            variant="pill"
            size="sm"
            data-modal="tipsModal"
            onClick={() => dispatch(openModal('tipsModal'))}
          >
            <i className="fas fa-lightbulb mr-1.5 text-amber-500"></i> Tips
          </Button>
          <Button
            variant="pill"
            size="sm"
            data-modal="analysisModal"
            onClick={() => dispatch(openModal('analysisModal'))}
          >
            <i className="fas fa-chart-bar mr-1.5 text-blue-500"></i> Analysis
          </Button>
          <Button
            variant="pill"
            size="sm"
            data-modal="dictionaryModal"
            onClick={() => dispatch(openModal('dictionaryModal'))}
          >
            <i className="fas fa-book mr-1.5 text-emerald-500"></i> Dictionary
          </Button>
          <Button
            variant="pill"
            size="sm"
            data-modal="toolsModal"
            onClick={() => dispatch(openModal('toolsModal'))}
          >
            <i className="fas fa-tools mr-1.5 text-purple-500"></i> Tools
          </Button>
        </div>
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

      {/* Global Toast */}
      <Toast />
    </div>
  )
}

export default App