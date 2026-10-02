"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { sair } from "@/app/actions";
import type { Sessao } from "@/lib/server-api";

const links = [
  { href: "/", label: "Painel" },
  { href: "/caixa", label: "Caixa" },
  { href: "/custos", label: "Custos" },
  { href: "/mao-obra", label: "Mao de obra" },
  { href: "/producao", label: "Producao" },
  { href: "/produtos", label: "Produtos" },
  { href: "/plantas", label: "Plantas" },
  { href: "/adubacao", label: "Adubação" },
  { href: "/planejamento", label: "Planejamento" },
  { href: "/como-usar", label: "Como usar" },
];

export function Shell({ children, user }: { children: React.ReactNode; user: Sessao | null }) {
  const path = usePathname();
  const router = useRouter();
  const decidiuAbertura = useRef(false);

  useEffect(() => {
    if (decidiuAbertura.current) return;
    decidiuAbertura.current = true;
    if (path === "/login" || path === "/") return;
    const abertura = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (abertura?.type === "reload") return;
    router.replace("/");
  }, [path, router]);

  if (path === "/login") return <>{children}</>;

  const nav = user?.isAdmin ? [...links, { href: "/usuarios", label: "Usuarios" }] : links;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      <aside
        style={{
          padding: "28px 18px",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
          maxHeight: "100vh",
          overflow: "auto",
          position: "sticky",
          top: 0,
        }}
      >
        <Link href="/" style={{ color: "inherit", textDecoration: "none", padding: "8px 12px" }}>
          <p style={{ letterSpacing: "0.18em", fontSize: 11, color: "var(--purple)", margin: 0 }}>RR</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "4px 0 28px" }}>Açaí</h1>
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {nav.map((l) => {
            const active = l.href === "/" ? path === "/" : path === l.href || path.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? "neo-press" : undefined}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: active ? "var(--bg)" : "var(--card)",
                  fontWeight: active ? 700 : 500,
                  color: active ? "var(--purple)" : "var(--ink)",
                  boxShadow: active
                    ? "inset 4px 4px 8px var(--dark), inset -4px -4px 8px var(--light)"
                    : "5px 5px 10px var(--dark), -5px -5px 10px var(--light)",
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        {user && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>{user.nome}</p>
            <form action={sair}>
              <button type="submit" style={{ width: "100%", padding: "10px 14px" }}>
                Sair
              </button>
            </form>
          </div>
        )}
      </aside>
      <main style={{ padding: "32px 40px", maxWidth: 1240 }}>{children}</main>
    </div>
  );
}
