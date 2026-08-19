import React from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { setModalOpen } from '../store/slices/stepsSlice'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { renderStep } from '../lib/utils/steps'

export const StepsModal: React.FC = () => {
  const dispatch = useAppDispatch()
  const { steps, isOpen, cipherName, operationName, finalResult } = useAppSelector(
    state => state.steps
  )

  const hasError = steps.some(step => step.type === 'error')
  const opColor = operationName?.toLowerCase().includes('decrypt') ? '#7c3aed' : '#0e7490'
  const opIcon = operationName?.toLowerCase().includes('decrypt') ? '🔓' : '🔒'

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(setModalOpen(false))}
      title={
        <span className="flex items-center gap-2">
          <i className="fas fa-calculator text-primary-500" />
          <span>Calculation Steps</span>
        </span>
      }
      maxWidth="max-w-4xl"
      footer={
        <Button variant="secondary" size="md" onClick={() => dispatch(setModalOpen(false))}>
          Close
        </Button>
      }
    >
      {steps.length === 0 ? (
        <div className="steps-empty-state">
          <div className="steps-empty-icon">🧮</div>
          <div className="steps-empty-text">Run an operation and click <strong>Steps</strong> to see the full calculation.</div>
        </div>
      ) : (
        <div id="stepsContent">
          {/* Header bar */}
          <div className="steps-header-bar">
            <div className="steps-header-cipher">{cipherName} Cipher</div>
            <span
              className="steps-header-op"
              style={{ background: opColor }}
            >
              {opIcon} {operationName}
            </span>
            <div className="steps-header-count">{steps.length} step{steps.length !== 1 ? 's' : ''}</div>
          </div>

          {/* Steps list */}
          <div className="steps-list">
            {steps.map((step, idx) => (
              <div
                key={idx}
                dangerouslySetInnerHTML={{ __html: renderStep(step, idx) }}
              />
            ))}
          </div>

          {/* Final result banner */}
          {!hasError && finalResult && !finalResult.startsWith('ERROR') && (
            <div className="steps-final-banner">
              <span className="steps-final-label">Final Output</span>
              <span className="steps-final-value">{finalResult}</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}