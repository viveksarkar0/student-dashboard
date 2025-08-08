"use client"

import React from "react"
import type { DashboardFilters } from "@/lib/api"

export type DashboardFiltersState = {
  preset: "7d" | "30d" | "90d" | "custom"
  from?: Date
  to?: Date
  role: "all" | "admin" | "teacher" | "user"
  q: string
}

function toApiFilters(state: DashboardFiltersState): DashboardFilters {
  return {
    preset: state.preset,
    from: state.from ? state.from.toISOString() : undefined,
    to: state.to ? state.to.toISOString() : undefined,
    role: state.role === "all" ? "" : state.role,
    q: state.q,
  }
}

type DashboardFiltersContextValue = {
  state: DashboardFiltersState
  setState: React.Dispatch<React.SetStateAction<DashboardFiltersState>>
  toApi: () => DashboardFilters
}

const DashboardFiltersContext = React.createContext<DashboardFiltersContextValue | null>(null)

export function DashboardFiltersProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<DashboardFiltersState>({
    preset: "30d",
    role: "all",
    q: "",
  })

  const value = React.useMemo<DashboardFiltersContextValue>(
    () => ({ state, setState, toApi: () => toApiFilters(state) }),
    [state]
  )

  return (
    <DashboardFiltersContext.Provider value={value}>{children}</DashboardFiltersContext.Provider>
  )
}

export function useDashboardFilters() {
  const ctx = React.useContext(DashboardFiltersContext)
  if (!ctx) throw new Error("useDashboardFilters must be used within DashboardFiltersProvider")
  return ctx
}


