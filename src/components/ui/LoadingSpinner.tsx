'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-slate-200 border-t-blue-600`}></div>
      {text && (
        <p className={`text-slate-600 ${textSizeClasses[size]} font-medium`}>
          {text}
        </p>
      )}
    </div>
  )
}

// Modern skeleton loader component
interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-4 bg-slate-200 rounded mb-2 last:mb-0"></div>
      ))}
    </div>
  )
}

// Card skeleton for loading states
export function CardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded"></div>
        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        <div className="h-3 bg-slate-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}

// Progress bar skeleton
export function ProgressSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-12 animate-pulse"></div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className="h-2 bg-slate-300 rounded-full w-1/3 animate-pulse"></div>
      </div>
    </div>
  )
}
