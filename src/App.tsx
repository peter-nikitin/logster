import { AppProvider } from '@/ui/context/app-context/app-context'
import { Content } from '@/ui/components/content'
import { Sidebar } from '@/ui/components/sidebar'
import { SidebarPanel } from '@/ui/components/sidebar-panel'
import { Toolbar } from '@/ui/components/toolbar'

function App() {
  return (
    <AppProvider>
      <main className="flex h-screen min-h-screen w-full flex-col">
        <Toolbar />

        <section className="flex min-h-0 flex-1">
          <Sidebar>
            <SidebarPanel />
          </Sidebar>

          <Content />
        </section>
      </main>
    </AppProvider>
  )
}

export default App
