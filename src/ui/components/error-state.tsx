import { uiTestIds } from '@/ui/test-ids'

type ErrorStateProps = {
  message: string
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div
      className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive"
      data-testid={uiTestIds.errorState}
      role="alert"
    >
      <h3 className="mb-2 text-base font-semibold">Parsing error</h3>
      <p className="text-sm leading-6">{message}</p>
    </div>
  )
}
