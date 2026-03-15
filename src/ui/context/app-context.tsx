import { bundledDatasets } from '@/adapters/bundled-datasets/bundled-dataset-source'
import { createContext, type ReactNode, useContext } from 'react'
import { useActiveDataset } from '@/ui/hooks/use-active-dataset'
import { useLogViewerWorkspace } from '@/ui/hooks/use-log-viewer-workspace'

type WorkspaceContextValue = {
  datasetState: ReturnType<typeof useActiveDataset>
  viewerState: ReturnType<typeof useLogViewerWorkspace>
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const datasetState = useActiveDataset(bundledDatasets)
  const viewerState = useLogViewerWorkspace({
    activeDataset: datasetState.activeDataset,
    activeDatasetId: datasetState.activeDatasetId,
    activeRow: datasetState.activeRow,
    selectRow: datasetState.selectRow,
  })

  return (
    <WorkspaceContext.Provider value={{ datasetState, viewerState }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)

  if (!context) {
    throw new Error('useWorkspace must be used inside AppProvider')
  }

  return context
}
