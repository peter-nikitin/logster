import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { uiTestIds } from '@/ui/test-ids'
import { useLayoutStore } from '@/ui/stores/layout-store'

type SidebarProps = {
  children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const isOpen = useLayoutStore((state) => state.isSidebarOpen)

  return (
    <aside
      className={cn(
        'relative shrink-0 overflow-hidden border-r border-border/70 transition-[width,opacity] duration-200',
        isOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0',
      )}
      data-testid={uiTestIds.workspaceSidebar}
    >
      <div
        className={cn(
          'h-full overflow-auto p-3',
          !isOpen && 'pointer-events-none',
        )}
      >
        {children}
      </div>
    </aside>
  )
}
