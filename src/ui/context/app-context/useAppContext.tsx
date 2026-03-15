import { createContext, useContext } from 'react';
import type { useActiveDataset } from '../../hooks/use-active-dataset';
import type { useLogViewerWorkspace } from '../../hooks/use-log-viewer-workspace';

type AppContextValue = {
  datasetState: ReturnType<typeof useActiveDataset>
  viewerState: ReturnType<typeof useLogViewerWorkspace>
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useWorkspace must be used inside AppProvider');
  }

  return context;
}
