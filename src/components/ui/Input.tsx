'use client'

import { forwardRef, useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  variant?: 'default' | 'filled' | 'outlined'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    icon, 
    iconPosition = 'left',
    variant = 'default',
    className = '', 
    id,
    ...props 
  }, ref) => {
    // useId provides a stable, SSR-safe id that matches on server and client
    const reactId = useId()
    const inputId = id || `input-${reactId}`
    
    const baseClasses = 'w-full px-4 py-3 text-sm border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      default: 'bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500',
      filled: 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 focus:bg-white',
      outlined: 'bg-transparent border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500'
    }
    
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
    const iconClasses = icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${errorClasses} ${iconClasses} ${className}`
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400">{icon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={classes}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-slate-400">{icon}</span>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-2 text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
