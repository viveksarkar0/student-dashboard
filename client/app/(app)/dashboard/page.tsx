"use client"

import { useUser } from "@/lib/useUser"
import DashboardFilters from "@/components/dashboard/filters"
import MetricsCards from "@/components/dashboard/metrics-cards"
import SalesOverview from "@/components/dashboard/sales-overview"
import SubscribersCard from "@/components/dashboard/subscribers-card"
import RevenueDonut from "@/components/dashboard/revenue-donut"
import GrowthArea from "@/components/dashboard/growth-area"
import RecentActivity from "@/components/dashboard/recent-activity"
import Link from "next/link"

export default function DashboardPage() {
  const { loading, isAuthenticated } = useUser()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <button className="h-9 rounded-md border px-3 text-sm">Export</button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <button className="h-9 rounded-md border px-3 text-sm">Export</button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Please log in to view the dashboard</p>
            <Link 
              href="/auth/login" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <button className="h-9 rounded-md border px-3 text-sm">Export</button>
      </div>
      <DashboardFilters />
      <MetricsCards />
      <div className="grid min-w-0 gap-4 md:grid-cols-7">
        <SalesOverview className="md:col-span-4" />
        <SubscribersCard className="md:col-span-3" />
      </div>
      <div className="grid min-w-0 gap-4 md:grid-cols-7">
        <RevenueDonut className="md:col-span-3" />
        <GrowthArea className="md:col-span-4" />
      </div>
      <RecentActivity />
    </div>
  )
}
