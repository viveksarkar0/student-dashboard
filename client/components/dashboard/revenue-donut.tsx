"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import { getRoleBreakdown } from "@/lib/api"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"

type Slice = { name: string; value: number }
const COLORS = ["hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

export default function RevenueDonut({ className = "" }: { className?: string }) {
  const [data, setData] = useState<Slice[]>([])
  const { state } = useDashboardFilters()

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const roles = await getRoleBreakdown({
          from: state.from?.toISOString(),
          to: state.to?.toISOString(),
          q: state.q,
        })
        if (ignore) return
        const arr: Slice[] = [
          { name: "Admin", value: roles.admin || 0 },
          { name: "Teacher", value: roles.teacher || 0 },
          { name: "User", value: roles.user || 0 },
        ]
        setData(arr)
      } catch (error) {
        if (!ignore) {
          // Fallback sample data for testing
          const sampleData = [
            { name: "Admin", value: 5 },
            { name: "Teacher", value: 15 },
            { name: "User", value: 80 },
          ]
          setData(sampleData)
        }
      }
    })()
    return () => { ignore = true }
  }, [state.from, state.to, state.q])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`min-w-0 ${className}`}>
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>User Roles</CardTitle>
          <CardDescription>Distribution</CardDescription>
        </CardHeader>
        <CardContent className="min-w-0 overflow-hidden">
          
          {data.length > 0 ? (
            <ChartContainer
              config={{ value: { label: "Users", color: "hsl(var(--chart-3))" } }}
              className="h-[260px] w-full min-w-0 overflow-hidden"
            >
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={6}>
                  {data.map((entry, idx) => (
                    <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
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
