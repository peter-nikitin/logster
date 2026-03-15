import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'
import type {
  MessageFacetSummary,
  MethodFacetSummary,
} from '@/ui/presenters/derive-log-viewer-state'
import { uiTestIds } from '@/ui/test-ids'
import type { MessageFacet } from '@/ui/stores/log-viewer-filter-store'
import { Ban, ChevronDown, ChevronRight } from 'lucide-react'

type DatasetFiltersPanelProps = {
  isDisabled: boolean
  methods: MethodFacetSummary[]
  includedMethods: string[]
  excludedMethods: string[]
  includedMessages: MessageFacet[]
  excludedMessages: MessageFacet[]
  expandedMethods: string[]
  totalCount: number
  visibleCount: number
  onMethodIncludedChange: (method: string, included: boolean) => void
  onMethodExcludeToggle: (method: string) => void
  onMessageIncludedChange: (
    facet: MessageFacet,
    included: boolean,
    siblingMessages: string[],
  ) => void
  onMessageExcludeToggle: (facet: MessageFacet) => void
  onMethodExpandedToggle: (method: string) => void
  onClearFilters: () => void
}

export function DatasetFiltersPanel({
  isDisabled,
  methods,
  includedMethods,
  excludedMethods,
  includedMessages,
  excludedMessages,
  expandedMethods,
  totalCount,
  visibleCount,
  onMethodIncludedChange,
  onMethodExcludeToggle,
  onMessageIncludedChange,
  onMessageExcludeToggle,
  onMethodExpandedToggle,
  onClearFilters,
}: DatasetFiltersPanelProps) {
  const includedMethodSet = new Set(includedMethods)
  const excludedMethodSet = new Set(excludedMethods)
  const includedMessageSet = new Set(includedMessages.map(toFacetKey))
  const excludedMessageSet = new Set(excludedMessages.map(toFacetKey))
  const expandedMethodSet = new Set(expandedMethods)
  const hasFilters =
    includedMethods.length > 0 ||
    excludedMethods.length > 0 ||
    includedMessages.length > 0 ||
    excludedMessages.length > 0

  return (
    <Card
      className="border-border/70 bg-card/95 shadow-sm"
      data-testid={uiTestIds.filterPanel}
    >
      <CardHeader className="space-y-2 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Drill into a method, pick inner texts with checkboxes, or invert a facet on the right.
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {visibleCount} / {totalCount || 0}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 pt-0">
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Facet tree
            </p>
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                disabled={isDisabled}
              >
                Clear
              </Button>
            ) : null}
          </div>

          {isDisabled ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
              Open a dataset to inspect methods and drill into nested log texts.
            </div>
          ) : null}

          {!isDisabled && methods.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
              No facets are available for the current dataset.
            </div>
          ) : null}

          {!isDisabled ? (
            <div className="space-y-1.5">
              {methods.map((methodEntry) => {
                const methodFacetKey = methodEntry.method
                const isExpanded = expandedMethodSet.has(methodEntry.method)
                const childIncludedCount = methodEntry.messages.filter((messageEntry) =>
                  includedMessageSet.has(
                    toFacetKey({
                      method: methodEntry.method,
                      message: messageEntry.message,
                    }),
                  ),
                ).length
                const isIncluded =
                  includedMethodSet.has(methodEntry.method) ||
                  childIncludedCount === methodEntry.messages.length
                const isIndeterminate =
                  !includedMethodSet.has(methodEntry.method) &&
                  childIncludedCount > 0 &&
                  childIncludedCount < methodEntry.messages.length
                const isExcluded = excludedMethodSet.has(methodEntry.method)

                return (
                  <div
                    key={methodEntry.method}
                    className="rounded-lg border border-border/70 bg-background/80"
                  >
                    <FacetRow
                      label={methodEntry.method}
                      count={methodEntry.rowCount}
                      isExpanded={isExpanded}
                      isIncluded={isIncluded}
                      isIndeterminate={isIndeterminate}
                      isExcluded={isExcluded}
                      checkboxTestId={uiTestIds.filterMethodCheckbox(methodFacetKey)}
                      invertTestId={uiTestIds.filterMethodInvertButton(methodFacetKey)}
                      expandTestId={uiTestIds.filterMethodExpand(methodFacetKey)}
                      onToggleCheckbox={(nextIncluded) =>
                        onMethodIncludedChange(methodEntry.method, nextIncluded)
                      }
                      onToggleInvert={() => onMethodExcludeToggle(methodEntry.method)}
                      onToggleExpanded={() => onMethodExpandedToggle(methodEntry.method)}
                    />

                    {isExpanded ? (
                      <div className="space-y-0.5 border-t border-border/60 px-1.5 py-1">
                        {methodEntry.messages.map((messageEntry) => {
                          const facet = {
                            method: methodEntry.method,
                            message: messageEntry.message,
                          }
                          const facetKey = toFacetKey(facet)

                          return (
                            <FacetRow
                              key={facetKey}
                              label={messageEntry.message}
                              count={messageEntry.rowCount}
                              level="child"
                              isIncluded={
                                includedMethodSet.has(methodEntry.method) ||
                                includedMessageSet.has(facetKey)
                              }
                              isExcluded={excludedMessageSet.has(facetKey)}
                              checkboxTestId={uiTestIds.filterMessageCheckbox(
                                methodEntry.method,
                                messageEntry.message,
                              )}
                              invertTestId={uiTestIds.filterMessageInvertButton(
                                methodEntry.method,
                                messageEntry.message,
                              )}
                              onToggleCheckbox={(nextIncluded) =>
                                onMessageIncludedChange(
                                  facet,
                                  nextIncluded,
                                  methodEntry.messages.map((entry) => entry.message),
                                )
                              }
                              onToggleInvert={() => onMessageExcludeToggle(facet)}
                            />
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </section>
      </CardContent>
    </Card>
  )
}

function FacetRow({
  label,
  count,
  level = 'root',
  isExpanded,
  isIncluded,
  isIndeterminate = false,
  isExcluded,
  checkboxTestId,
  invertTestId,
  expandTestId,
  onToggleCheckbox,
  onToggleInvert,
  onToggleExpanded,
}: {
  label: string
  count: number
  level?: 'root' | 'child'
  isExpanded?: boolean
  isIncluded: boolean
  isIndeterminate?: boolean
  isExcluded: boolean
  checkboxTestId: string
  invertTestId: string
  expandTestId?: string
  onToggleCheckbox: (nextIncluded: boolean) => void
  onToggleInvert: () => void
  onToggleExpanded?: () => void
}) {
  const checkboxRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  return (
    <div
      className={cn(
        'group flex min-h-8 items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors',
        isIncluded && 'bg-primary/10',
        isExcluded && 'bg-destructive/8',
        level === 'child' && 'pl-4',
      )}
    >
      {onToggleExpanded ? (
        <button
          type="button"
          data-testid={expandTestId}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted/70"
          onClick={onToggleExpanded}
          aria-label={isExpanded ? 'Collapse facet' : 'Expand facet'}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      ) : (
        <span className="h-5 w-3 shrink-0" />
      )}

      <label className="flex min-w-0 flex-1 items-center gap-2">
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={isIncluded}
          data-testid={checkboxTestId}
          onChange={(event) => onToggleCheckbox(event.target.checked)}
          className="h-3.5 w-3.5 shrink-0 rounded-sm border-input text-primary focus:ring-ring"
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate leading-5 text-foreground',
              level === 'root' ? 'font-mono text-[12px]' : 'text-[12px]',
              isExcluded && 'line-through text-foreground/70',
            )}
          >
            {label}
          </span>
        </span>
      </label>

      <Badge
        variant={isIncluded ? 'default' : 'outline'}
        className={cn(
          'h-5 shrink-0 rounded-md px-1.5 py-0 text-[10px] leading-4',
          isExcluded && 'border-destructive/40 bg-destructive/10 text-destructive',
        )}
      >
        {count}
      </Badge>

      <Button
        type="button"
        variant={isExcluded ? 'default' : 'ghost'}
        size="sm"
        data-testid={invertTestId}
        className={cn(
          'h-5 w-5 shrink-0 rounded-sm p-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100',
          !isExcluded && 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
          isExcluded &&
            'opacity-100 bg-destructive/90 text-destructive-foreground hover:bg-destructive/90',
        )}
        onClick={onToggleInvert}
        aria-label={isExcluded ? 'Remove inverted facet' : 'Invert facet'}
      >
        <Ban className="h-3 w-3" />
      </Button>
    </div>
  )
}

function toFacetKey(facet: MessageFacet | MessageFacetSummary & { method: string }) {
  return `${facet.method}::${facet.message}`
}
