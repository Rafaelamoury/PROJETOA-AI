import { apiBase } from "@/lib/api-base";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = apiBase();

export async function apiGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get("acai_token")?.value;
  if (!token) redirect("/login");
  const res = await fetch(`${API}${path}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) redirect("/login");
  if (res.status === 403) redirect("/");
  if (!res.ok) throw new Error("API");
  return res.json();
}

export type Sessao = { id: number; nome: string; cpf: string; isAdmin: boolean };

export async function versaoDaApi(): Promise<string | null> {
  try {
    const res = await fetch(`${API}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { versao?: string };
    return body.versao ?? null;
  } catch {
    return null;
  }
}

export async function getSessao(): Promise<Sessao | null> {
  const token = (await cookies()).get("acai_token")?.value;
  if (!token) return null;
  const res = await fetch(`${API}/auth/me`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}
