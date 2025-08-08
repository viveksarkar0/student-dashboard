"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from 'lucide-react'
import { getMe, updateMe, uploadAvatar, type Me } from "@/lib/api"

function splitName(full = ""): { firstName: string; lastName: string } {
  const parts = full.trim().split(" ").filter(Boolean)
  if (parts.length <= 1) return { firstName: full || "", lastName: "" }
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.slice(-1).join(" ") }
}

export default function ProfileForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const me: Me = await getMe()
        if (ignore) return
        const s = splitName(me.name ?? "")
        setFirstName(s.firstName)
        setLastName(s.lastName)
        setEmail(me.email ?? "")
        setBio(me.bio ?? "")
        setAvatarUrl(me.avatarUrl ?? "")
      } catch (e) {
        if (!ignore) setErr(e instanceof Error ? e.message : "Failed to load profile")
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => { ignore = true }
  }, [])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    setMsg(null)
    try {
      const updated = await updateMe({ name: `${firstName} ${lastName}`.trim(), email, bio })
      const s = splitName(updated.name)
      setFirstName(s.firstName)
      setLastName(s.lastName)
      setBio(updated.bio || "")
      setAvatarUrl(updated.avatarUrl || avatarUrl)
      setMsg("Profile updated.")
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  async function onUpload() {
    if (!file) return
    setSaving(true)
    setErr(null)
    setMsg(null)
    try {
      const url = await uploadAvatar(file)
      // Bust cache to ensure the browser fetches the new image immediately
      setAvatarUrl(`${url}`)
      setFile(null) // Clear the file input
      setMsg("Avatar updated.")
      // Refresh profile from server to persist in local state
      const me = await getMe()
      setAvatarUrl(me.avatarUrl || `${url}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Avatar upload failed")
    } finally {
      setSaving(false)
    }
  }

  const initials = useMemo(() => (firstName?.[0] || "") + (lastName?.[0] || ""), [firstName, lastName])

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{"Profile"}</CardTitle>
        <CardDescription>{"Update your information and avatar."}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-24 rounded-md bg-zinc-100 animate-pulse" />
        ) : (
          <form onSubmit={onSave} className="grid gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {avatarUrl ? (
                  <AvatarImage
                    key={avatarUrl}
                    src={avatarUrl}
                    alt="Avatar"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <AvatarFallback>{initials || <User className="h-6 w-6" />}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                 <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                   key={file ? 'has-file' : 'no-file'}
                />
                <Button type="button" variant="secondary" onClick={onUpload} disabled={!file || saving}>
                  {"Upload"}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first">{"First name"}</Label>
                <Input id="first" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last">{"Last name"}</Label>
                <Input id="last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">{"Email"}</Label>
              <Input id="email" type="email" value={email} readOnly className="bg-zinc-50" />
              <p className="text-xs text-muted-foreground">{"Email cannot be changed."}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">{"Bio"}</Label>
              <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            {msg && <p className="text-sm text-emerald-600">{msg}</p>}
            {err && <p className="text-sm text-red-600">{err}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
