import React, { type ReactNode, useEffect } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  maxWidth?: string
  footer?: ReactNode
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-3xl',
  footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`bg-white rounded-md w-full ${maxWidth} max-h-[90vh] flex flex-col shadow-lg overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">{title}</h2>
          <button
            className="text-2xl text-gray-400 px-2 py-0.5 rounded hover:bg-gray-100 hover:text-gray-700 transition leading-none cursor-pointer"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-gray-200 flex justify-end shrink-0 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}