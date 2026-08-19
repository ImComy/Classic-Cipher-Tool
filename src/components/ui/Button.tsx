import React, { type ButtonHTMLAttributes, type ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
  | 'primary'
  | 'secondary'
  | 'emerald'
  | 'danger'
  | 'amber'
  | 'blue'
  | 'purple'
  | 'accent'
  | 'outline'
  | 'pill'
  size?: 'sm' | 'md' | 'lg' | 'xs'
  children: ReactNode
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const sizeStyles = {
    xs: 'px-2 py-1 text-xs rounded',
    sm: 'px-2.5 py-1.5 text-sm rounded',
    md: 'px-3 py-1.5 text-sm rounded',
    lg: 'px-4 py-2 text-base rounded-md',
  }

  const variantStyles = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    emerald: 'bg-emerald-700 text-white hover:bg-emerald-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    amber:
      'bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0',
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
    purple: 'bg-purple-600 text-white hover:bg-purple-700',
    accent: 'bg-accent-500 text-white hover:bg-accent-600',
    outline:
      'bg-transparent border border-gray-300 text-gray-700 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50',
    pill: 'px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-transparent',
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
