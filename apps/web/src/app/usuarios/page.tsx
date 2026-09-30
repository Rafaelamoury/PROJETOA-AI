import { apiGet, getSessao } from "@/lib/server-api";
import { criarUsuario } from "@/app/actions";
import { redirect } from "next/navigation";
import { LancarModal, botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";
import { urlsNaRede } from "@/lib/rede";

type Usuario = { id: number; nome: string; cpf: string; isAdmin: boolean };

export default async function UsuariosPage() {
  const sessao = await getSessao();
  if (!sessao?.isAdmin) redirect("/");
  const lista = await apiGet<Usuario[]>("/usuarios");
  const naRede = urlsNaRede();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Usuarios</h2>
          <p style={{ maxWidth: 640 }}>
            Voce cria o acesso. A outra pessoa entra na tela de login com o <strong>CPF</strong> e a <strong>senha</strong> que voce cadastrar. Nao marque administrador, a menos que ela tambem possa criar gente.
          </p>
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

      <div style={{ background: "#fffdf8", border: "1px solid #e4d9c8", borderRadius: 16, padding: 20, margin: "8px 0 24px", maxWidth: 720 }}>
        <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 8px" }}>Como a outra pessoa abre o RR Acai</h3>
        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Crie o usuario no botao <strong>+ Criar usuario</strong> (nome, CPF e uma senha).</li>
          <li>Passe para ela o CPF, a senha e o endereco abaixo.</li>
          <li>Na internet (depois de publicar): mande o link publico do RR Acai, o CPF e a senha.</li>
          <li>Neste computador (so na sua casa): <strong>http://localhost:3000</strong></li>
          {naRede.length > 0 ? (
            <li>
              No celular ou em outro PC na mesma Wi-Fi:
              <ul style={{ margin: "6px 0 0" }}>
                {naRede.map((u) => (
                  <li key={u}>
                    <strong>{u}</strong>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li>Na mesma Wi-Fi: use o IP deste computador na porta 3000 (ex.: http://192.168.0.10:3000).</li>
          )}
          <li>Ela abre o login, digita o CPF e a senha. E o mesmo sistema: o mesmo caixa e os mesmos lancamentos.</li>
        </ol>
      </div>

      {lista.map((u) => (
        <div key={u.id} style={{ padding: 12, background: "#fffdf8", borderRadius: 10, marginBottom: 8, border: "1px solid #e4d9c8" }}>
          <strong>{u.nome}</strong> · CPF {u.cpf} · {u.isAdmin ? "admin" : "usuario"}
        </div>
      ))}
    </div>
  );
}
