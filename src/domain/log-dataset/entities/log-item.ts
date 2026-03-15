import type { LogRow } from './log-row'

export type LogFilterFacet = {
  method: string
  message: string
}

export type LogVisualFilterSelection = {
  includedMethods: string[]
  excludedMethods: string[]
  includedMessages: LogFilterFacet[]
  excludedMessages: LogFilterFacet[]
}

export class LogItem {
  private readonly row: LogRow

  constructor(row: LogRow) {
    this.row = row
  }

  get id() {
    return this.row.id
  }

  get method() {
    return this.row.method
  }

  get message() {
    return this.row.message
  }

  get value() {
    return this.row
  }

  get facet(): LogFilterFacet {
    return {
      method: this.method,
      message: this.message,
    }
  }

  get facetKey() {
    return toFacetKey(this.facet)
  }

  matchesVisualFilter(selection: LogVisualFilterSelection) {
    const includedMethods = new Set(selection.includedMethods)
    const excludedMethods = new Set(selection.excludedMethods)
    const includedMessages = new Set(selection.includedMessages.map(toFacetKey))
    const excludedMessages = new Set(selection.excludedMessages.map(toFacetKey))
    const hasPositiveSelections =
      includedMethods.size > 0 || includedMessages.size > 0

    const isIncluded =
      !hasPositiveSelections ||
      includedMethods.has(this.method) ||
      includedMessages.has(this.facetKey)
    const isExcluded =
      excludedMethods.has(this.method) || excludedMessages.has(this.facetKey)

    return isIncluded && !isExcluded
  }
}

function toFacetKey(facet: LogFilterFacet) {
  return `${facet.method}::${facet.message}`
}
