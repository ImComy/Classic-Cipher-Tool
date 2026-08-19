import React from 'react'
import { Modal } from '../../components/ui/Modal'
import { DictionarySearch } from './DictionarySearch'

interface DictionaryModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <i className="fas fa-book text-primary-500"></i> Dictionary
        </>
      }
      maxWidth="max-w-3xl"
    >
      <DictionarySearch />
    </Modal>
  )
}
