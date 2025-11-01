'use client'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

export default function Badge({ 
  variant = 'default', 
  size = 'md', 
  icon,
  removable = false,
  onRemove,
  className = '', 
  children, 
  ...props 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 font-semibold rounded-full transition-all duration-200'
  
  const variantClasses = {
    default: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-800 hover:bg-red-200',
    info: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    secondary: 'bg-purple-100 text-purple-800 hover:bg-purple-200'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <span className={classes} {...props}>
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      <span>{children}</span>
      
      {removable && (
        <button
          onClick={onRemove}
          className="ml-1 flex-shrink-0 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove badge"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

// Status Badge Component
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'failed'
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    active: { 
      variant: 'success' as const, 
      icon: '🟢', 
      text: 'Aktif' 
    },
    inactive: { 
      variant: 'secondary' as const, 
      icon: '⚪', 
      text: 'Pasif' 
    },
    pending: { 
      variant: 'warning' as const, 
      icon: '🟡', 
      text: 'Beklemede' 
    },
    completed: { 
      variant: 'success' as const, 
      icon: '✅', 
      text: 'Tamamlandı' 
    },
    failed: { 
      variant: 'danger' as const, 
      icon: '❌', 
      text: 'Başarısız' 
    }
  }
  
  const config = statusConfig[status]
  
  return (
    <Badge variant={config.variant} size={size} icon={config.icon}>
      {config.text}
    </Badge>
  )
}
