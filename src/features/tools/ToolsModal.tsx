import React from 'react'
import { Modal } from '../../components/ui/Modal'
import { ModularInverseTool } from './ModularInverseTool'
import { HillMatrixTool } from './HillMatrixTool'
import { GcdTool } from './GcdTool'
import { LetterReplaceTool } from './LetterReplaceTool'
import { AffineCheckTool } from './AffineCheckTool'
import { CaesarBruteTool } from './CaesarBruteTool'

interface ToolsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ToolsModal: React.FC<ToolsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <i className="fas fa-tools text-primary-500"></i> Tools
        </>
      }
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Modular Inverse Extended Euclidean */}
        <ModularInverseTool />

        {/* Hill Matrix Utilities */}
        <HillMatrixTool />

        {/* GCD */}
        <GcdTool />

        {/* Letter Replace */}
        <LetterReplaceTool />

        {/* Affine Check */}
        <AffineCheckTool />

        {/* Caesar Brute Force */}
        <CaesarBruteTool />
      </div>
    </Modal>
  )
}
