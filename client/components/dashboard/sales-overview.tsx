"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"

// Placeholder: This card shows a static series but we will slice it differently for filter presets
const baseData = [
  { month: "Oct", value: 2988 },
  { month: "Nov", value: 1765 },
  { month: "Dec", value: 4005 },
  { month: "Jan", value: 5100 },
  { month: "Feb", value: 5600 },
  { month: "Mar", value: 6200 },
]

export default function SalesOverview({ className = "" }: { className?: string }) {
  const { state } = useDashboardFilters()
  const data = state.preset === "7d" ? baseData.slice(-2) : state.preset === "90d" ? baseData : baseData.slice(-4)
  return (
    <Card className={`${className} min-w-0 overflow-hidden`}>
      <CardHeader className="pb-2">
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>Monthly breakdown</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 overflow-hidden">
        <ChartContainer
          config={{ value: { label: "Value", color: "hsl(var(--chart-1))" } }}
          className="h-[260px] w-full min-w-0 overflow-hidden"
        >
          <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
