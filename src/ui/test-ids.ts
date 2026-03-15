export const uiTestIds = {
  datasetsPanelToggle: 'datasets-panel-toggle',
  filtersPanelToggle: 'filters-panel-toggle',
  workspaceSidebar: 'workspace-sidebar',
  datasetSourcePanel: 'dataset-source-panel',
  storedDatasetItem: 'stored-dataset-item',
  storedDatasetDeleteButton: 'stored-dataset-delete-button',
  datasetTable: 'dataset-table',
  datasetRow: 'dataset-row',
  filterPanel: 'filter-panel',
  filterMethodCheckbox: (method: string) => `filter-method-checkbox-${method}`,
  filterMethodInvertButton: (method: string) => `filter-method-invert-${method}`,
  filterMethodExpand: (method: string) => `filter-method-expand-${method}`,
  filterMessageCheckbox: (method: string, message: string) =>
    `filter-message-checkbox-${method}-${message}`,
  filterMessageInvertButton: (method: string, message: string) =>
    `filter-message-invert-${method}-${message}`,
  rowDetailsPanel: 'row-details-panel',
  payloadJsonViewer: 'payload-json-viewer',
  uploadInput: 'upload-input',
  emptyState: 'empty-state',
  errorState: 'error-state',
  tableColumnResizeHandle: (columnId: string) => `table-column-resize-${columnId}`,
} as const
