export const uiTestIds = {
  sidebarToggle: 'sidebar-toggle',
  workspaceSidebar: 'workspace-sidebar',
  datasetSourcePanel: 'dataset-source-panel',
  storedDatasetItem: 'stored-dataset-item',
  storedDatasetDeleteButton: 'stored-dataset-delete-button',
  datasetTable: 'dataset-table',
  datasetRow: 'dataset-row',
  uploadInput: 'upload-input',
  errorState: 'error-state',
  tableColumnResizeHandle: (columnId: string) => `table-column-resize-${columnId}`,
} as const
