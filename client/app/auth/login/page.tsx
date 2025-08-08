"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { login } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login({ email, password })
      // middleware will redirect authenticated users away from auth pages
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block p-10 bg-gradient-to-br from-zinc-50 to-zinc-100 border-r">
        <h1 className="text-3xl font-semibold mb-4">{"Welcome back"}</h1>
        <p className="text-zinc-600">{"Sign in to view your dashboard."}</p>
        <img
          src="/demo.jpeg"
          alt="Illustration"
          className="rounded-xl border shadow-sm mt-10"
        />
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{"Sign in"}</h2>
            <p className="text-sm text-zinc-600">{"Use your email and password."}</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">{"Email"}</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10"
                placeholder="you@company.com"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">{"Password"}</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-md bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="mt-4 text-sm text-zinc-600">
            {"No account? "}
            <Link href="/auth/register" className="underline">{"Create one"}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
