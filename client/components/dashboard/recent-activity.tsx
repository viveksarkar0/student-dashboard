"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis } from "recharts"
import { getRecentLogins, getRecentUsers, type RecentLogin, type RecentUser } from "@/lib/api"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"
import ChartResize from "@/components/chart-resize"

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function RecentActivity({ className = "" }: { className?: string }) {
  const [logins, setLogins] = useState<RecentLogin[]>([])
  const [users, setUsers] = useState<RecentUser[]>([])
  const [spark, setSpark] = useState<{ label: string; value: number }[]>([])
  const { state } = useDashboardFilters()

  useEffect(() => {
    let ignore = false
    ;(async () => {
      const filterParams = {
        from: state.from?.toISOString(),
        to: state.to?.toISOString(),
        role: state.role === 'all' ? undefined : state.role,
        q: state.q || undefined,
        limit: 8,
      }
      const [l, u] = await Promise.all([getRecentLogins(filterParams), getRecentUsers(filterParams)])
      if (ignore) return
      setLogins(l)
      setUsers(u)
      const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      setSpark(labels.map((label) => ({ label, value: Math.round(400 + Math.random() * 600) })))
    })()
    return () => { ignore = true }
  }, [state.from, state.to, state.role, state.q])

  return (
    <div className={`grid min-w-0 gap-4 md:grid-cols-7 ${className}`}>
      <Card className="md:col-span-4 min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Recent Logins</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {logins.slice(0, 5).map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={it.avatarUrl || "/placeholder.svg?height=32&width=32&query=user"} alt={it.name} />
                      <AvatarFallback>{(it.name?.[0] ?? "U").toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <div className="text-sm font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{it.email}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{timeAgo(it.at)}</Badge>
                </div>
              ))}
            </div>
            <div className="h-[180px] min-w-0 overflow-hidden">
              <ChartContainer
                config={{ value: { label: "Logins", color: "hsl(var(--chart-2))" } }}
                className="h-full w-full min-w-0 overflow-hidden"
              >
                <ChartResize>
                  {({ width, height }) => (
                    <AreaChart width={width} height={height} data={spark} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                      <defs>
                        <linearGradient id="fill-logins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <Area dataKey="value" stroke="hsl(var(--chart-2))" fill="url(#fill-logins)" strokeWidth={2} type="monotone" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </AreaChart>
                  )}
                </ChartResize>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3 min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>New Users</CardTitle>
          <CardDescription>Latest signups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.slice(0, 6).map((u) => (
            <div key={u.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.avatarUrl || "/placeholder.svg?height=32&width=32&query=user"} alt={u.name} />
                  <AvatarFallback>{(u.name?.[0] ?? "U").toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{timeAgo(u.at)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
