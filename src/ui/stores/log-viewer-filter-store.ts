import { create } from 'zustand'
import type { LogFilterFacet, LogVisualFilterSelection } from '@/domain/log-dataset/entities/log-item'

export type MessageFacet = LogFilterFacet

type LogViewerFilterStore = {
  includedMethods: string[]
  excludedMethods: string[]
  includedMessages: MessageFacet[]
  excludedMessages: MessageFacet[]
  expandedMethods: string[]
  setMethodIncluded: (method: string, included: boolean) => void
  toggleMethodExclude: (method: string) => void
  setMessageIncluded: (
    facet: MessageFacet,
    included: boolean,
    siblingMessages: string[],
  ) => void
  toggleMessageExclude: (facet: MessageFacet) => void
  toggleMethodExpanded: (method: string) => void
  clearFilters: () => void
  resetForDataset: () => void
}

export type LogViewerFilterSelection = LogVisualFilterSelection

const initialState = {
  includedMethods: [] as string[],
  excludedMethods: [] as string[],
  includedMessages: [] as MessageFacet[],
  excludedMessages: [] as MessageFacet[],
  expandedMethods: [] as string[],
}

export const useLogViewerFilterStore = create<LogViewerFilterStore>((set) => ({
  ...initialState,
  setMethodIncluded: (method, included) => {
    set((state) => ({
      includedMethods: included
        ? [...state.includedMethods.filter((candidate) => candidate !== method), method]
        : state.includedMethods.filter((candidate) => candidate !== method),
      includedMessages: state.includedMessages.filter(
        (candidate) => candidate.method !== method,
      ),
      excludedMethods: state.excludedMethods.filter((candidate) => candidate !== method),
    }))
  },
  toggleMethodExclude: (method) => {
    set((state) => ({
      excludedMethods: state.excludedMethods.includes(method)
        ? state.excludedMethods.filter((candidate) => candidate !== method)
        : [...state.excludedMethods, method],
      includedMethods: state.includedMethods.filter((candidate) => candidate !== method),
    }))
  },
  setMessageIncluded: (facet, included, siblingMessages) => {
    set((state) => {
      const parentIncluded = state.includedMethods.includes(facet.method)
      const methodMessages = siblingMessages.map((message) => ({
        method: facet.method,
        message,
      }))

      let nextIncludedMethods = state.includedMethods.filter(
        (candidate) => candidate !== facet.method,
      )
      let nextIncludedMessages = state.includedMessages.filter(
        (candidate) => candidate.method !== facet.method,
      )

      if (parentIncluded) {
        nextIncludedMessages = methodMessages.filter(
          (candidate) => candidate.message !== facet.message,
        )
      } else {
        nextIncludedMessages = included
          ? [...nextIncludedMessages, facet]
          : removeFacet(nextIncludedMessages, facet)
      }

      const includedCount = nextIncludedMessages.filter(
        (candidate) => candidate.method === facet.method,
      ).length

      if (includedCount === siblingMessages.length && siblingMessages.length > 0) {
        nextIncludedMethods = [...nextIncludedMethods, facet.method]
        nextIncludedMessages = nextIncludedMessages.filter(
          (candidate) => candidate.method !== facet.method,
        )
      }

      return {
        includedMethods: nextIncludedMethods,
        includedMessages: dedupeFacets(nextIncludedMessages),
        excludedMessages: removeFacet(state.excludedMessages, facet),
      }
    })
  },
  toggleMessageExclude: (facet) => {
    set((state) => ({
      excludedMessages: toggleFacet(state.excludedMessages, facet),
      includedMessages: removeFacet(state.includedMessages, facet),
    }))
  },
  toggleMethodExpanded: (method) => {
    set((state) => ({
      expandedMethods: state.expandedMethods.includes(method)
        ? state.expandedMethods.filter((candidate) => candidate !== method)
        : [...state.expandedMethods, method],
    }))
  },
  clearFilters: () => {
    set(initialState)
  },
  resetForDataset: () => {
    set(initialState)
  },
}))

function removeFacet(current: MessageFacet[], target: MessageFacet) {
  return current.filter(
    (candidate) =>
      candidate.method !== target.method || candidate.message !== target.message,
  )
}

function toggleFacet(current: MessageFacet[], target: MessageFacet) {
  return current.some(
    (candidate) =>
      candidate.method === target.method && candidate.message === target.message,
  )
    ? removeFacet(current, target)
    : [...current, target]
}

function dedupeFacets(current: MessageFacet[]) {
  return current.filter(
    (candidate, index, all) =>
      all.findIndex(
        (entry) =>
          entry.method === candidate.method && entry.message === candidate.message,
      ) === index,
  )
}
