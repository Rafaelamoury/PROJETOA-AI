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
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside
        style={{
          background: "linear-gradient(180deg, #3a1454 0%, #1f6b45 100%)",
          color: "#fffdf8",
          padding: "28px 20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
          <p style={{ letterSpacing: "0.18em", fontSize: 11, opacity: 0.8, margin: 0 }}>RR</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "4px 0 28px" }}>Açaí</h1>
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          {nav.map((l) => {
            const active = l.href === "/" ? path === "/" : path === l.href || path.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: active ? "rgba(255,255,255,0.18)" : "transparent",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        {user && (
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            <p style={{ margin: "0 0 8px" }}>{user.nome}</p>
            <form action={sair}>
              <button type="submit" style={{ background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, padding: "6px 10px" }}>
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
