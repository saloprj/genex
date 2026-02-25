import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'teal' | 'orange' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-brand-surface text-brand-muted border border-brand-border':
            variant === 'default',
          'bg-brand-teal/10 text-brand-teal border border-brand-teal/20':
            variant === 'teal',
          'bg-brand-orange/10 text-brand-orange border border-brand-orange/20':
            variant === 'orange',
          'border border-brand-border text-brand-muted': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
