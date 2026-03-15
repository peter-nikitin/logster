import { cn } from '@/lib/utils'
import { uiTestIds } from '@/ui/test-ids'

type ErrorStateProps = {
  title: string
  message: string
  tone?: 'error' | 'warning'
}

export function ErrorState({
  title,
  message,
  tone = 'error',
}: ErrorStateProps) {
  const isWarning = tone === 'warning'

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        isWarning
          ? 'border-primary/25 bg-primary/10 text-foreground'
          : 'border-destructive/30 bg-destructive/10 text-destructive',
      )}
      data-testid={uiTestIds.errorState}
      role="alert"
    >
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <p
        className={cn(
          'text-sm leading-6',
          isWarning ? 'text-muted-foreground' : 'text-destructive',
        )}
      >
        {message}
      </p>
    </div>
  )
}
