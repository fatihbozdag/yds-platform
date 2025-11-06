'use client'

import { forwardRef } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  interactive?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'default',
    padding = 'md',
    hover = false,
    interactive = false,
    className = '',
    children,
    ...props
  }, ref) => {
    const baseClasses = 'rounded-xl transition-all duration-200'

    const variantClasses = {
      default: 'bg-white border border-slate-200 shadow-sm',
      elevated: 'bg-white shadow-md hover:shadow-lg border border-slate-100',
      outlined: 'bg-transparent border-2 border-slate-200',
      glass: 'bg-white/70 backdrop-blur-md border border-slate-200/50 shadow-sm'
    }

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-7'
    }

    const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-0.5' : ''
    const interactiveClasses = interactive ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200' : ''

    const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${interactiveClasses} ${className}`
    
    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header Component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export function CardHeader({ title, subtitle, action, className = '', children, ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`} {...props}>
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-slate-600">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="ml-4">
          {action}
        </div>
      )}
    </div>
  )
}

// Card Content Component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  )
}

// Card Footer Component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-6 border-t border-slate-200 ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card
