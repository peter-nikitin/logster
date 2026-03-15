import { bundledDatasets } from '@/adapters/bundled-datasets/bundled-dataset-source'
import { DatasetFiltersPanel } from '@/ui/components/dataset-filters-panel'
import { DatasetSourcePanel } from '@/ui/components/dataset-source-panel'
import { useAppContext } from '../context/app-context/useAppContext'
import { useLayoutStore } from '@/ui/stores/layout-store'

export function SidebarPanel() {
  const { datasetState, viewerState } = useAppContext()
  const activePanel = useLayoutStore((state) => state.activeSidebarPanel)

  if (activePanel === 'datasets') {
    return (
      <DatasetSourcePanel
        bundledDatasets={bundledDatasets}
        storedDatasets={datasetState.storedDatasets}
        activeDatasetOrigin={datasetState.activeDatasetOrigin}
        activeDatasetId={datasetState.activeDatasetId}
        isImporting={datasetState.isImporting}
        isRestoring={datasetState.isRestoring}
        onImportFile={datasetState.importFile}
        onSelectBundled={datasetState.selectBundledDataset}
        onSelectStored={datasetState.selectStoredDataset}
        onDeleteStored={datasetState.deleteStoredDataset}
      />
    )
  }

  return (
    <DatasetFiltersPanel
      isDisabled={!datasetState.activeDataset}
      methods={viewerState.derivedViewerState.methods}
      includedMethods={viewerState.includedMethods}
      excludedMethods={viewerState.excludedMethods}
      includedMessages={viewerState.includedMessages}
      excludedMessages={viewerState.excludedMessages}
      expandedMethods={viewerState.expandedMethods}
      onMethodIncludedChange={viewerState.setMethodIncluded}
      onMethodExcludeToggle={viewerState.toggleMethodExclude}
      onMessageIncludedChange={viewerState.setMessageIncluded}
      onMessageExcludeToggle={viewerState.toggleMessageExclude}
      onMethodExpandedToggle={viewerState.toggleMethodExpanded}
      onClearFilters={viewerState.clearFilters}
    />
  )
}
