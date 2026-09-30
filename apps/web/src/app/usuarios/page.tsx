import { apiGet, getSessao } from "@/lib/server-api";
import { criarUsuario } from "@/app/actions";
import { redirect } from "next/navigation";
import { LancarModal, botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

type Usuario = { id: number; nome: string; cpf: string; isAdmin: boolean };

export default async function UsuariosPage() {
  const sessao = await getSessao();
  if (!sessao?.isAdmin) redirect("/");
  const lista = await apiGet<Usuario[]>("/usuarios");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Usuarios</h2>
          <p>Crie acesso para Rita Terra e outros. Cada um entra com CPF e senha.</p>
        </div>
        <LancarModal titulo="Novo usuario" botao="+ Criar usuario" dica="Depois de adicionar, a aba continua aberta.">
          <form action={criarUsuario} style={{ display: "grid", gap: 12 }}>
            <label style={campo}>
              Nome completo
              <input name="nome" required style={inputCampo} />
            </label>
            <label style={campo}>
              CPF
              <input name="cpf" required style={inputCampo} />
            </label>
            <label style={campo}>
              Senha (min. 6)
              <input name="senha" type="password" required minLength={6} style={inputCampo} />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input type="checkbox" name="isAdmin" value="true" />
              Administrador (pode criar usuarios)
            </label>
            <button type="submit" style={botaoAdicionar}>
              Adicionar
            </button>
          </form>
        </LancarModal>
      </div>
      {lista.map((u) => (
        <div key={u.id} style={{ padding: 12, background: "#fffdf8", borderRadius: 10, marginBottom: 8, border: "1px solid #e4d9c8" }}>
          <strong>{u.nome}</strong> · CPF {u.cpf} · {u.isAdmin ? "admin" : "usuario"}
        </div>
      ))}
    </div>
  );
}
