import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { uiTestIds } from '@/ui/test-ids'

type WorkspaceSidebarProps = {
  children: ReactNode
  isOpen: boolean
}

export function WorkspaceSidebar({ children, isOpen }: WorkspaceSidebarProps) {
  return (
    <aside
      className={cn(
        'relative shrink-0 overflow-hidden border-r border-border/70 bg-muted/20 transition-[width,opacity] duration-200',
        isOpen ? 'w-[320px] opacity-100' : 'w-0 opacity-0',
      )}
      data-testid={uiTestIds.workspaceSidebar}
    >
      <div
        className={cn(
          'h-full overflow-auto p-4',
          !isOpen && 'pointer-events-none',
        )}
      >
        {children}
      </div>
    </aside>
  )
}
