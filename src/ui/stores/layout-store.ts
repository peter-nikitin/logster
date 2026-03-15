import { create } from 'zustand'
import { tableColumnConfig } from '@/ui/table-columns'

export type TableColumnId = 'time' | 'delta' | 'method' | 'message' | 'payload'
export type SidebarPanelId = 'datasets' | 'filters'

type ColumnWidths = Record<TableColumnId, number>

type LayoutStore = {
  isSidebarOpen: boolean
  activeSidebarPanel: SidebarPanelId
  columnWidths: ColumnWidths
  setSidebarOpen: (isOpen: boolean) => void
  toggleSidebar: () => void
  openSidebarPanel: (panel: SidebarPanelId) => void
  setColumnWidth: (columnId: TableColumnId, width: number) => void
  fitColumnsToWidth: (availableWidth: number) => void
}

const defaultColumnWidths = tableColumnConfig.reduce<ColumnWidths>((acc, column) => {
  acc[column.id] = column.defaultWidth
  return acc
}, {} as ColumnWidths)

const sidebarWidthDelta = 320
const payloadMinWidth = tableColumnConfig.find((column) => column.id === 'payload')!.minWidth

function getNextPayloadWidth(currentWidth: number, isSidebarOpening: boolean) {
  const nextWidth = isSidebarOpening
    ? currentWidth - sidebarWidthDelta
    : currentWidth + sidebarWidthDelta

  return Math.max(payloadMinWidth, nextWidth)
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  isSidebarOpen: true,
  activeSidebarPanel: 'datasets',
  columnWidths: defaultColumnWidths,
  setSidebarOpen: (isOpen) => {
    set((state) => {
      if (state.isSidebarOpen === isOpen) {
        return state
      }

      return {
        isSidebarOpen: isOpen,
        columnWidths: {
          ...state.columnWidths,
          payload: getNextPayloadWidth(state.columnWidths.payload, isOpen),
        },
      }
    })
  },
  openSidebarPanel: (panel) => {
    set((state) => {
      const shouldOpenSidebar = !state.isSidebarOpen || state.activeSidebarPanel !== panel

      if (shouldOpenSidebar) {
        return {
          isSidebarOpen: true,
          activeSidebarPanel: panel,
          columnWidths: state.isSidebarOpen
            ? state.columnWidths
            : {
                ...state.columnWidths,
                payload: getNextPayloadWidth(state.columnWidths.payload, true),
              },
        }
      }

      return {
        isSidebarOpen: false,
        activeSidebarPanel: panel,
        columnWidths: {
          ...state.columnWidths,
          payload: getNextPayloadWidth(state.columnWidths.payload, false),
        },
      }
    })
  },
  toggleSidebar: () => {
    set((state) => {
      const nextIsSidebarOpen = !state.isSidebarOpen

      return {
        isSidebarOpen: nextIsSidebarOpen,
        columnWidths: {
          ...state.columnWidths,
          payload: getNextPayloadWidth(
            state.columnWidths.payload,
            nextIsSidebarOpen,
          ),
        },
      }
    })
  },
  setColumnWidth: (columnId, width) => {
    set((state) => ({
      columnWidths: {
        ...state.columnWidths,
        [columnId]: width,
      },
    }))
  },
  fitColumnsToWidth: (availableWidth) => {
    set((state) => {
      const minTotalWidth = tableColumnConfig.reduce(
        (total, column) => total + column.minWidth,
        0,
      )

      if (availableWidth <= minTotalWidth) {
        return {
          columnWidths: tableColumnConfig.reduce<ColumnWidths>((acc, column) => {
            acc[column.id] = column.minWidth
            return acc
          }, {} as ColumnWidths),
        }
      }

      const distributableSpace = availableWidth - minTotalWidth
      const currentFlexibleTotal = tableColumnConfig.reduce(
        (total, column) =>
          total + Math.max(0, state.columnWidths[column.id] - column.minWidth),
        0,
      )

      const nextWidths = tableColumnConfig.reduce<ColumnWidths>((acc, column) => {
        const flexibleWidth = Math.max(
          0,
          state.columnWidths[column.id] - column.minWidth,
        )

        const extraWidth =
          currentFlexibleTotal === 0
            ? Math.floor(distributableSpace / tableColumnConfig.length)
            : Math.floor(
                (flexibleWidth / currentFlexibleTotal) * distributableSpace,
              )

        acc[column.id] = column.minWidth + extraWidth
        return acc
      }, {} as ColumnWidths)

      const nextTotalWidth = tableColumnConfig.reduce(
        (total, column) => total + nextWidths[column.id],
        0,
      )

      const remainder = availableWidth - nextTotalWidth

      if (remainder > 0) {
        nextWidths.payload += remainder
      }

      return {
        columnWidths: nextWidths,
      }
    })
  },
}))
