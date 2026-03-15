import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LogRow } from '@/domain/log-dataset/entities/log-row'
import { presentRowDetails } from '@/ui/presenters/present-row-details'
import { uiTestIds } from '@/ui/test-ids'

type RowDetailsProps = {
  row: LogRow
}

export function RowDetails({ row }: RowDetailsProps) {
  const details = presentRowDetails(row)

  return (
    <Card
      className="border-border/70 bg-card/95 shadow-sm"
      data-testid={uiTestIds.rowDetails}
    >
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Row details</CardTitle>
            <CardDescription>
              Full content for the currently selected log row.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit font-mono">
            {details.deltaLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <dl className="grid gap-4 text-sm">
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
            <dt className="mb-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Time
            </dt>
            <dd className="font-mono text-foreground">{details.timestampLabel}</dd>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
            <dt className="mb-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Method
            </dt>
            <dd className="font-mono text-foreground">{details.method}</dd>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4">
            <dt className="mb-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Message
            </dt>
            <dd className="text-foreground">{details.message}</dd>
          </div>
        </dl>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Raw row
            </h3>
          </div>
          <pre className="overflow-auto rounded-xl border border-border/70 bg-muted/30 p-4 text-xs leading-6 text-foreground">
            <code>{details.json}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
