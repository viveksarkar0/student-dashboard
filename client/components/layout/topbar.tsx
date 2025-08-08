"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Search } from 'lucide-react'

export function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="relative w-full max-w-[720px]">
        <input
          placeholder="Search…"
          className="w-full h-9 rounded-md border bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-2"
          aria-label="Search"
        />
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    </header>
  )
}
