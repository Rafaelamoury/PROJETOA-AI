export function apiBase(): string {
  const raw = process.env.API_URL || "http://127.0.0.1:5043/api";
  return raw.replace(/\/$/, "");
}
