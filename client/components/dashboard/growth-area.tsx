"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts"
import { getDashboard, type DashboardFilters } from "@/lib/api"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"

type Row = { label: string; users: number }

export default function GrowthArea({ className = "" }: { className?: string }) {
  const [growth, setGrowth] = useState<Row[]>([])
  const { toApi } = useDashboardFilters()

  useEffect(() => {
    let ignore = false
    const filters: DashboardFilters = toApi()
    ;(async () => {
      try {
        const resp = await getDashboard(filters)
        if (ignore) return
        setGrowth(resp.trend.map((r) => ({ label: r.label, users: r.value })))
      } catch (error) {
        if (!ignore) {
          // Fallback sample data for testing
          const sampleData = [
            { label: "Week 1", users: 25 },
            { label: "Week 2", users: 35 },
            { label: "Week 3", users: 45 },
            { label: "Week 4", users: 60 },
            { label: "Week 5", users: 75 },
            { label: "Week 6", users: 90 },
            { label: "Week 7", users: 110 },
          ]
          setGrowth(sampleData)
        }
      }
    })()
    return () => { ignore = true }
  }, [toApi])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`min-w-0 ${className}`}>
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>User Growth</CardTitle>
          <CardDescription>Last 90 days</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 overflow-hidden">
          
          {growth.length > 0 ? (
            <ChartContainer
              config={{ users: { label: "Users", color: "hsl(var(--chart-1))" } }}
              className="h-[260px] w-full min-w-0 overflow-hidden"
            >
              <AreaChart data={growth} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                <defs>
                  <linearGradient id="fill-users" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Area dataKey="users" stroke="hsl(var(--chart-1))" fill="url(#fill-users)" strokeWidth={2} type="monotone" />
                <ChartTooltip content={<ChartTooltipContent />} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[260px] w-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">No data available</p>
                <p className="text-xs">Please log in to view dashboard data</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
