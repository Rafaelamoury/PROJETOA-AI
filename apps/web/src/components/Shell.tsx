"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sair } from "@/app/actions";
import type { Sessao } from "@/lib/server-api";

const links = [
  { href: "/", label: "Painel" },
  { href: "/caixa", label: "Caixa" },
  { href: "/custos", label: "Custos" },
  { href: "/mao-obra", label: "Mão de obra" },
  { href: "/producao", label: "Produção" },
  { href: "/produtos", label: "Produtos" },
  { href: "/plantas", label: "Plantas" },
  { href: "/adubacao", label: "Adubação" },
  { href: "/planejamento", label: "Planejamento" },
  { href: "/como-usar", label: "Como usar" },
];

export function Shell({ children, user, contaDefasada }: { children: React.ReactNode; user: Sessao | null; contaDefasada?: boolean }) {
  const path = usePathname();

  if (path === "/login") return <>{children}</>;

  const nav = user?.isAdmin ? [...links, { href: "/usuarios", label: "Usuários" }] : links;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      <aside
        style={{
          padding: "28px 18px",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
          color: "var(--ink)",
          borderRight: "1px solid var(--line)",
          maxHeight: "100vh",
          overflow: "auto",
          position: "sticky",
          top: 0,
        }}
      >
        <Link href="/" style={{ color: "inherit", textDecoration: "none", padding: "8px 12px" }}>
          <p style={{ letterSpacing: "0.18em", fontSize: 11, color: "var(--purple)", margin: 0 }}>RR</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "4px 0 28px", color: "var(--sidebar)" }}>Açaí</h1>
        </Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {nav.map((l) => {
            const active = l.href === "/" ? path === "/" : path === l.href || path.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: active ? "rgba(63, 24, 76, 0.08)" : "transparent",
                  fontWeight: active ? 700 : 500,
                  color: "var(--sidebar)",
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
              <button type="submit" className="neo-sair" style={{ width: "100%", padding: "10px 14px" }}>
                Sair
              </button>
            </form>
          </div>
        )}
      </aside>
      <main style={{ padding: "32px 40px", maxWidth: 1240 }}>
        {contaDefasada ? (
          <p style={{ margin: "0 0 16px", color: "var(--purple)", fontWeight: 700 }}>
            A tela e a conta do sítio estão em versões diferentes. Atualize daqui a pouco.
          </p>
        ) : null}
        {children}
      </main>
    </div>
  );
}
