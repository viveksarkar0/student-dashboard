import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function serverGet<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      cookie: cookieHeader,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const msg = (await res.json().catch(() => ({})))?.message || `GET ${path} failed`;
    throw new Error(msg);
  }
  return (await res.json()) as T;
}


