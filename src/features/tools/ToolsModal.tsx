import React from 'react'
import { Modal } from '../../components/ui/Modal'
import { ModularInverseTool } from './ModularInverseTool'
import { HillMatrixTool } from './HillMatrixTool'
import { GcdTool } from './GcdTool'
import { AffineCheckTool } from './AffineCheckTool'

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
      maxWidth="max-w-5xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Modular Inverse - spans both rows */}
        <div className="md:row-span-2">
          <ModularInverseTool />
        </div>

        {/* Right Column Top: GCD */}
        <GcdTool />

        {/* Right Column Bottom: Affine Check */}
        <AffineCheckTool />

        {/* Bottom Row: Hill Matrix - spans both columns */}
        <div className="md:col-span-2">
          <HillMatrixTool />
        </div>
      </div>
    </Modal>
  )
}