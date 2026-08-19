import React, { type SelectHTMLAttributes } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  className?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  children,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-[0.7rem] font-semibold text-gray-500 uppercase tracking-wider mb-0.5"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
