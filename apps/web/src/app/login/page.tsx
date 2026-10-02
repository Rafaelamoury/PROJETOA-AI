import { entrar } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const q = await searchParams;
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)" }}>
      <form
        action={entrar}
        style={{
          width: 380,
          background: "var(--card)",
          borderRadius: 24,
          padding: 32,
          display: "grid",
          gap: 12,
          boxShadow: "var(--shadow)",
        }}
      >
        <p style={{ letterSpacing: "0.16em", fontSize: 11, color: "var(--purple)", margin: 0 }}>RR AÇAÍ</p>
        <h1 style={{ fontFamily: "Georgia, serif", margin: "0 0 8px" }}>Entrar</h1>
        <p style={{ margin: 0, fontSize: 14 }}>Acesso com CPF e senha. Se outra pessoa criou seu usuario, use o CPF e a senha que ela passou.</p>
        {q.erro && <p style={{ color: "#8a1c1c", margin: 0 }}>{q.erro}</p>}
        <input name="cpf" placeholder="CPF" required autoComplete="username" style={{ padding: 10 }} />
        <input name="senha" type="password" placeholder="Senha" required autoComplete="current-password" style={{ padding: 10 }} />
        <button type="submit" style={{ padding: 12, color: "var(--purple)", fontWeight: 700 }}>
          Entrar
        </button>
      </form>
    </div>
  );
}
