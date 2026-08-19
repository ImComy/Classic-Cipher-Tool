import React, { type TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  sublabel?: string
  className?: string
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  sublabel,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-500 block mb-0.5">
          {label} {sublabel && <span className="font-normal text-xs text-gray-400">{sublabel}</span>}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full min-h-[160px] px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-800 font-mono focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-y transition ${className}`}
        {...props}
      />
    </div>
  )
}
