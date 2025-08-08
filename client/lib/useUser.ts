"use client"

import { useEffect, useState } from "react"
import { getMe } from "./api"

export type User = {
  name: string
  email: string
  bio?: string
  avatarUrl?: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    
    const checkAuth = async () => {
      try {
        setLoading(true)
        setError(null)
        const userData = await getMe()
        if (!ignore) {
          setUser(userData)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Authentication failed"
        if (!ignore) {
          setError(message)
          setUser(null)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    checkAuth()
    
    return () => {
      ignore = true
    }
  }, [])

  return { user, loading, error, isAuthenticated: !!user }
}


