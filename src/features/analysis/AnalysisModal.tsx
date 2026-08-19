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
  const inputText = useAppSelector(state => state.cipher.inputText)
  const [analysis, setAnalysis] = useState<FrequencyAnalysisResult>(() =>
    computeFrequency(inputText)
  )

  useEffect(() => {
    if (isOpen) {
      setAnalysis(computeFrequency(inputText))
    }
  }, [isOpen, inputText])

  const handleAnalyze = () => {
    setAnalysis(computeFrequency(inputText))
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
      <p className="text-gray-600 text-sm mb-2">
        Analyzes the text in the main input box. Click <strong>Analyze</strong> to update.
      </p>

      <Button variant="primary" size="sm" onClick={handleAnalyze} id="analyzeBtn">
        <i className="fas fa-chart-simple mr-2"></i> Analyze
      </Button>

      <FrequencyChart analysis={analysis} />
    </Modal>
  )
}
