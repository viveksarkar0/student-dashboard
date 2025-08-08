export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function mediaUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}


