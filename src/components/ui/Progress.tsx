'use client'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient'
  showLabel?: boolean
  label?: string
  animated?: boolean
}

export default function Progress({ 
  value, 
  max = 100, 
  size = 'md', 
  variant = 'default',
  showLabel = true,
  label,
  animated = false,
  className = '', 
  ...props 
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }
  
  const variantClasses = {
    default: 'bg-gradient-to-r from-blue-500 to-blue-600',
    success: 'bg-gradient-to-r from-green-500 to-green-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600',
    gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
  }
  
  const animationClass = animated ? 'animate-pulse' : ''
  
  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-slate-700">
            {label || 'İlerleme'}
          </span>
          <span className="text-sm font-bold text-slate-600">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${sizeClasses[size]} rounded-full transition-all duration-500 ease-out ${variantClasses[variant]} ${animationClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {animated && (
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  )
}

// Circular Progress Component
interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  showLabel?: boolean
  label?: string
}

export function CircularProgress({ 
  value, 
  max = 100, 
  size = 'md', 
  variant = 'default',
  showLabel = true,
  label,
  className = '', 
  ...props 
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const circumference = 2 * Math.PI * 45 // radius = 45
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }
  
  const strokeWidthClasses = {
    sm: 'stroke-2',
    md: 'stroke-3',
    lg: 'stroke-4'
  }
  
  const variantClasses = {
    default: 'stroke-blue-500',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-500'
  }
  
  return (
    <div className={`flex flex-col items-center ${className}`} {...props}>
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className="stroke-slate-200 stroke-3"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={`${strokeWidthClasses[size]} ${variantClasses[variant]} transition-all duration-500 ease-out`}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (percentage / 100) * circumference}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-slate-700">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {showLabel && label && (
        <span className="text-xs text-slate-600 mt-2 text-center">
          {label}
        </span>
      )}
    </div>
  )
}
