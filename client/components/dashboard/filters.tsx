"use client"

import { useState, useEffect } from "react"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"
import { CalendarIcon, Filter, UserCog } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DashboardFilters() {
  const { state, setState } = useDashboardFilters()
  const [open, setOpen] = useState(false)
  const { preset, from, to, role, q } = state
  const setPreset = (p: "7d" | "30d" | "90d" | "custom") => setState((s) => ({ ...s, preset: p }))
  const setFrom = (d?: Date) => setState((s) => ({ ...s, from: d }))
  const setTo = (d?: Date) => setState((s) => ({ ...s, to: d }))
  const setRole = (r: "all" | "admin" | "teacher" | "user") => setState((s) => ({ ...s, role: r }))
  const setQ = (val: string) => setState((s) => ({ ...s, q: val }))

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2">
      <div className="relative flex-1 min-w-[220px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
          placeholder="Search keyword…"
          className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2"
        />
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start min-w-[180px]">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {preset !== "custom"
              ? preset === "7d"
                ? "Last 7 days"
                : preset === "30d"
                ? "Last 30 days"
                : "Last 90 days"
              : from && to
               ? `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`
              : "Select dates…"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <div className="grid md:grid-cols-2">
            <div className="p-3">
              <div className="grid gap-2">
                {([
                  { key: "7d", label: "Last 7 days" },
                  { key: "30d", label: "Last 30 days" },
                  { key: "90d", label: "Last 90 days" },
                  { key: "custom", label: "Custom…" },
                ] as Array<{ key: "7d" | "30d" | "90d" | "custom"; label: string }>).map((p) => (
                  <Button
                    key={p.key}
                    variant={preset === p.key ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => {
                      if (p.key !== "custom") {
                        setPreset(p.key)
                        setFrom(undefined)
                        setTo(undefined)
                        setOpen(false)
                      } else {
                        setPreset("custom")
                      }
                    }}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="border-l p-3">
              <Calendar
                mode="range"
                selected={{ from, to }}
                onSelect={(range) => {
                  setPreset("custom")
                  setFrom(range?.from)
                  setTo(range?.to)
                }}
                numberOfMonths={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                 <Button variant="ghost" size="sm" onClick={() => { setPreset("30d"); setFrom(undefined); setTo(undefined) }}>
                  {"Clear"}
                </Button>
                <Button size="sm" onClick={() => setOpen(false)}>{"Apply"}</Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

       <Select value={role} onValueChange={(v: string) => setRole(v as "all" | "admin" | "teacher" | "user")}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> {"All roles"}
            </div>
          </SelectItem>
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4" /> {"Admin"}
            </div>
          </SelectItem>
          <SelectItem value="teacher">{"Teacher"}</SelectItem>
          <SelectItem value="user">{"User"}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
