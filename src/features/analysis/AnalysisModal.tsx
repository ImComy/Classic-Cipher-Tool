import React, { useState, useEffect } from 'react'
import { useAppSelector } from '../../store'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { FrequencyChart } from './FrequencyChart'
import { computeFrequency, type FrequencyAnalysisResult } from '../../lib/utils/frequency'

interface AnalysisModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose }) => {
  const { inputText } = useAppSelector(state => state.cipher)
  const { ciphertext, livePreview } = useAppSelector(state => state.lab)
  const { activeWorkspace } = useAppSelector(state => state.ui)
  
  // Only applicable in Lab
  const [labTarget, setLabTarget] = useState<'source' | 'preview'>('source')

  const textToAnalyze = activeWorkspace === 'lab' 
    ? (labTarget === 'source' ? ciphertext : livePreview)
    : inputText
  const [analysis, setAnalysis] = useState<FrequencyAnalysisResult>(() =>
    computeFrequency(textToAnalyze)
  )

  useEffect(() => {
    if (isOpen) {
      setAnalysis(computeFrequency(textToAnalyze))
    }
  }, [isOpen, textToAnalyze])

  const handleAnalyze = () => {
    setAnalysis(computeFrequency(textToAnalyze))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <i className="fas fa-chart-bar text-primary-500"></i> Frequency Analysis
        </>
      }
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-gray-100 pb-3">
        <p className="text-gray-600 text-sm">
          Analyzes the text in the active workspace ({activeWorkspace === 'lab' ? 'Lab' : 'Desk'}). Click <strong>Analyze</strong> to force update.
        </p>

        {activeWorkspace === 'lab' && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md shrink-0">
            <button
              onClick={() => setLabTarget('source')}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                labTarget === 'source' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ciphertext
            </button>
            <button
              onClick={() => setLabTarget('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded ${
                labTarget === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Live Preview
            </button>
          </div>
        )}
      </div>

      <Button variant="primary" size="sm" onClick={handleAnalyze} id="analyzeBtn">
        <i className="fas fa-chart-simple mr-2"></i> Analyze
      </Button>

      <FrequencyChart analysis={analysis} />
    </Modal>
  )
}
