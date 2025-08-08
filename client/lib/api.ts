"use client"

export type LoginDto = { email: string; password: string }
export type RegisterDto = { name: string; email: string; password: string }
export type Me = { name: string; email: string; bio?: string; avatarUrl?: string }

const DEFAULT_API = "http://localhost:4000"

function baseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL
  return (envUrl && typeof envUrl === "string" && envUrl.length > 0) ? envUrl : DEFAULT_API
}

async function request(input: string, init?: RequestInit) {
  const res = await fetch(`${baseUrl()}${input}`, {
    credentials: "include",
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers || {}),
    },
    ...init,
  })
  const text = await res.text()
  const json = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(json?.message || res.statusText)
  }
  return json
}

function fullUrlIfRelative(url?: string | null) {
  if (!url) return undefined
  if (/^https?:\/\//.test(url)) return url
  return `${baseUrl()}${url}`
}

function withCacheBuster(url?: string | null) {
  if (!url) return undefined
  const sep = url.includes("?") ? "&" : "?"
  return `${url}${sep}v=${Date.now()}`
}

function joinName(first?: string, last?: string) {
  return [first || "", last || ""].join(" ").trim()
}

function splitName(name: string) {
  const parts = (name || "").trim().split(/\s+/)
  const firstName = parts.shift() || ""
  const lastName = parts.join(" ")
  return { firstName, lastName }
}

type BackendUser = { firstName?: string; lastName?: string; email?: string; bio?: string; avatar?: string }

function normalizeUserPayload(payload: unknown): Me {
  const container = (payload as { user?: BackendUser }) || {}
  const user: BackendUser = container.user || (payload as BackendUser) || {}
  return {
    name: joinName(user?.firstName, user?.lastName),
    email: user?.email || "",
    bio: user?.bio,
    avatarUrl: withCacheBuster(fullUrlIfRelative(user?.avatar)),
  }
}

export async function login(dto: LoginDto) {
  return request("/v1/auth/login", { method: "POST", body: JSON.stringify(dto) })
}

export async function register(dto: RegisterDto) {
  const { firstName, lastName } = splitName(dto.name)
  return request("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email: dto.email, password: dto.password }),
  })
}

export async function logout() {
  try {
    await request("/v1/auth/logout", { method: "POST" })
  } catch {
    // ignore if endpoint doesn't exist
  }
}

export async function getMe(): Promise<Me> {
  const data = await request("/v1/users/me")
  return normalizeUserPayload(data)
}

export type DashboardFilters = {
  preset: "7d" | "30d" | "90d" | "custom"
  from?: string
  to?: string
  role: string
  q: string
}

export async function getDashboard(filters: DashboardFilters) {
  const summaryParams = new URLSearchParams()
  const trendsParams = new URLSearchParams()
  // Date range
  if (filters.from) summaryParams.set("from", new Date(filters.from).toISOString())
  if (filters.to) summaryParams.set("to", new Date(filters.to).toISOString())
  if (filters.from) trendsParams.set("from", new Date(filters.from).toISOString())
  if (filters.to) trendsParams.set("to", new Date(filters.to).toISOString())
  // Preset -> days for trends if custom not provided
  if (!filters.from && !filters.to) {
    const days = filters.preset === "7d" ? 7 : filters.preset === "90d" ? 90 : 30
    trendsParams.set("days", String(days))
  }
  // Role and query
  if (filters.role && filters.role !== "all") {
    summaryParams.set("role", filters.role)
    trendsParams.set("role", filters.role)
  }
  if (filters.q) {
    summaryParams.set("q", filters.q)
    trendsParams.set("q", filters.q)
  }

  const [summaryRes, trendsRes] = await Promise.all([
    request(`/v1/dashboard/summary?${summaryParams.toString()}`),
    request(`/v1/dashboard/trends?${trendsParams.toString()}`),
  ])

  const summary = summaryRes?.summary || {}
  const trends = (trendsRes?.trends || []) as Array<{ date: string; count: number }>
  return {
    summary: {
      pageViews: Number(summary.last7Days || 0),
      revenue: 0,
      bounceRate: 0,
      subscribers: Number(summary.totalUsers || 0),
    },
    trend: trends.map((t) => ({ label: t.date, value: t.count })).slice(-10), // Limit to last 10 data points
  }
}

export async function updateMe(body: { name: string; email: string; bio?: string }): Promise<Me> {
  const { firstName, lastName } = splitName(body.name)
  const data = await request("/v1/users/me", {
    method: "PUT",
    body: JSON.stringify({ firstName, lastName, bio: body.bio }),
  })
  return normalizeUserPayload(data)
}

export async function uploadAvatar(file: File): Promise<string> {
  const fd = new FormData()
  fd.append("avatar", file)
  const res = await fetch(`${baseUrl()}/v1/users/me/avatar`, {
    method: "POST",
    body: fd,
    credentials: "include",
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.message || "Upload failed")
  // Always return absolute URL and append cache buster to avoid stale images
  const absolute = fullUrlIfRelative(data?.url) || ""
  return `${absolute}?v=${Date.now()}`
}

// Dashboard: recent activity helpers
export type RecentUser = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  at: string
}

export type RecentLogin = RecentUser

export async function getRecentUsers(filters?: { from?: string; to?: string; role?: string; q?: string; limit?: number }): Promise<RecentUser[]> {
  const params = new URLSearchParams()
  if (filters?.from) params.set("from", new Date(filters.from).toISOString())
  if (filters?.to) params.set("to", new Date(filters.to).toISOString())
  if (filters?.role) params.set("role", filters.role)
  if (filters?.q) params.set("q", filters.q)
  if (filters?.limit) params.set("limit", String(filters.limit))
  const qs = params.toString()
  const data = await request(`/v1/dashboard/recent-users${qs ? `?${qs}` : ""}`)
  type ServerRecentUser = {
    _id?: string
    id?: string
    firstName?: string
    lastName?: string
    email?: string
    avatar?: string
    createdAt?: string | number | Date
  }
  const users = (data?.users || []) as Array<ServerRecentUser>
  return users.map((u) => ({
    id: String(u?._id || u?.id || ""),
    name: joinName(u?.firstName, u?.lastName),
    email: u?.email || "",
    avatarUrl: withCacheBuster(fullUrlIfRelative(u?.avatar)),
    at: u?.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  }))
}

// There is no dedicated recent-logins endpoint on the server.
// Reuse recent users as a proxy for recent login activity.
export async function getRecentLogins(filters?: { from?: string; to?: string; role?: string; q?: string; limit?: number }): Promise<RecentLogin[]> {
  const users = await getRecentUsers(filters)
  return users
}

export async function getRoleBreakdown(filters?: { from?: string; to?: string; q?: string }) {
  const params = new URLSearchParams()
  if (filters?.from) params.set("from", new Date(filters.from).toISOString())
  if (filters?.to) params.set("to", new Date(filters.to).toISOString())
  if (filters?.q) params.set("q", filters.q)
  const data = await request(`/v1/dashboard/roles?${params.toString()}`)
  return (data?.roles || { admin: 0, teacher: 0, user: 0 }) as Record<string, number>
}
