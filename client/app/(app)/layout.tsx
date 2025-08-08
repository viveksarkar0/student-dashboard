import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Topbar } from "@/components/layout/topbar"
import { DashboardFiltersProvider } from "@/hooks/useDashboardFilters"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <DashboardFiltersProvider>
          <main className="p-4">{children}</main>
        </DashboardFiltersProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
// Sidebar uses shadcn's new Sidebar primitives for a clean, collapsible nav [^3].
// Layout follows Next.js App Router composition with server/client interleaving [^2].
