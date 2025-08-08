"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { register as registerApi } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await registerApi({ name, email, password })
      router.replace("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:block p-10 bg-gradient-to-br from-zinc-50 to-zinc-100 border-r">
        <h1 className="text-3xl font-semibold mb-4">{"Create your account"}</h1>
        <p className="text-zinc-600">{"Start exploring your data."}</p>
        <img
          src="/demo.jpeg"
          alt="Illustration"
          className="rounded-xl border shadow-sm mt-10"
        />
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{"Create account"}</h2>
            <p className="text-sm text-zinc-600">{"We’ll use your email for authentication only."}</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">{"Name"}</label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-md border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10"
                placeholder="Jane Doe"
              />
            </div>
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
                placeholder="Create a strong password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="h-10 w-full rounded-md bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="mt-4 text-sm text-zinc-600">
            {"Already have an account? "}
            <Link href="/auth/login" className="underline">{"Sign in"}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
