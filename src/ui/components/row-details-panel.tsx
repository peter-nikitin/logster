import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { LogRow } from '@/domain/log-dataset/entities/log-row'
import { uiTestIds } from '@/ui/test-ids'
import { JsonView, collapseAllNested, defaultStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

type RowDetailsPanelProps = {
  row: LogRow | null
}

const jsonViewerStyles = {
  ...defaultStyles,
  container:
    'm-0 rounded-xl border border-border/70 bg-muted/20 p-4 font-mono text-xs leading-6 text-foreground',
  childFieldsContainer: 'm-0 pl-4',
  basicChildStyle: 'list-none',
  label: 'text-muted-foreground',
  stringValue: 'text-primary',
  numberValue: 'text-foreground',
  booleanValue: 'text-foreground',
  punctuation: 'text-muted-foreground',
  collapseIcon: 'cursor-pointer text-muted-foreground',
  expandIcon: 'cursor-pointer text-muted-foreground',
  collapsedContent: 'text-muted-foreground italic',
} satisfies typeof defaultStyles

export function RowDetailsPanel({ row }: RowDetailsPanelProps) {
  return (
    <Card
      className="flex h-full min-h-0 w-[360px] min-w-[320px] max-w-[520px] flex-col border-border/70 bg-card/95 shadow-sm"
      data-testid={uiTestIds.rowDetailsPanel}
    >
      <CardHeader className="space-y-3 border-b border-border/70">
        <div>
          <CardTitle>Row details</CardTitle>
          <CardDescription>
            Inspect the selected row without losing the surrounding table context.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto p-4">
        {row ? (
          <>
            <section className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
              <DetailField label="Time" value={new Date(row.timestamp).toISOString()} />
              <DetailField
                label="Delta"
                value={row.deltaMs === null ? '—' : `+${row.deltaMs} ms`}
              />
              <DetailField label="Method" value={row.method} mono />
              <DetailField label="Message" value={row.message} />
            </section>

            <section className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Payload
              </p>
              {renderPayload(row.payload)}
            </section>

            <section className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Raw row
              </p>
              <pre className="overflow-auto rounded-xl border border-border/70 bg-muted/20 p-4 font-mono text-xs leading-6 text-foreground">
                {JSON.stringify(row, null, 2)}
              </pre>
            </section>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
            Select a visible row to inspect its metadata and payload.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className={mono ? 'font-mono text-sm text-foreground' : 'text-sm text-foreground'}>
        {value}
      </p>
    </div>
  )
}

function renderPayload(payload: unknown) {
  if (payload === undefined) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
        This row does not include a payload.
      </div>
    )
  }

  if (payload === null || typeof payload !== 'object') {
    return (
      <pre className="overflow-auto rounded-xl border border-border/70 bg-muted/20 p-4 font-mono text-xs leading-6 text-foreground">
        {JSON.stringify(payload, null, 2)}
      </pre>
    )
  }

  return (
    <div data-testid={uiTestIds.payloadJsonViewer}>
      <JsonView
        data={payload as Record<string, unknown> | Array<unknown>}
        clickToExpandNode
        shouldExpandNode={collapseAllNested}
        style={jsonViewerStyles}
      />
    </div>
  )
}
