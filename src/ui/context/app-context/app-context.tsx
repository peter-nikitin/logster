import { bundledDatasets } from '@/adapters/bundled-datasets/bundled-dataset-source'
import {  type ReactNode } from 'react'
import { useActiveDataset } from '@/ui/hooks/use-active-dataset'
import { useLogViewerWorkspace } from '@/ui/hooks/use-log-viewer-workspace'
import { AppContext } from './useAppContext'

export function AppProvider({ children }: { children: ReactNode }) {
  const datasetState = useActiveDataset(bundledDatasets)
  const viewerState = useLogViewerWorkspace({
    activeDataset: datasetState.activeDataset,
    activeDatasetId: datasetState.activeDatasetId,
    activeRow: datasetState.activeRow,
    selectRow: datasetState.selectRow,
  })

  return (
    <AppContext.Provider value={{ datasetState, viewerState }}>
      {children}
    </AppContext.Provider>
  )
}

