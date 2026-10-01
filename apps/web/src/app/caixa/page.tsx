import { brl, dataIsoBr, hojeLocal } from "@/lib/api";
import type { Caixa, Lancamento } from "@/lib/types";
import { atualizarSaldo, criarLancamento, excluirLancamento } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { LancarModal, botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

export default async function CaixaPage() {
  const [caixa, lista] = await Promise.all([apiGet<Caixa>("/caixa"), apiGet<Lancamento[]>("/lancamentos")]);
  const hoje = hojeLocal();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Caixa</h2>
          <p>
            Saldo unico da operacao. Entradas (incluindo acai tirado na producao) somam; custos e extracao saem. Gastos
            novos se lancam em <strong>Custos</strong>.
          </p>
        </div>
        <LancarModal
          titulo="Nova entrada"
          botao="+ Lancar entrada"
          dica="Depois de adicionar, a aba continua aberta para o proximo lancamento."
        >
          <form action={criarLancamento} style={{ display: "grid", gap: 12 }}>
            <input type="hidden" name="tipo" value="EntradaCaixa" />
            <label style={campo}>
              Data
              <input type="date" name="data" defaultValue={hoje} required style={inputCampo} />
            </label>
            <label style={campo}>
              Valor
              <input type="number" step="0.01" name="valor" required style={inputCampo} />
            </label>
            <label style={campo}>
              Descricao
              <input name="descricao" placeholder="Ex.: venda, aporte" required style={inputCampo} />
            </label>
            <button type="submit" style={botaoAdicionar}>
              Adicionar
            </button>
          </form>
        </LancarModal>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#fffdf8", border: "1px solid #e4d9c8", borderRadius: 16, padding: 20 }}>
          <p style={{ marginTop: 0 }}>Saldo atual</p>
          <strong style={{ fontSize: 32, color: "#1f6b45" }}>{brl(caixa.saldo)}</strong>
          <form action={atualizarSaldo} style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <input name="saldoInicial" defaultValue={caixa.saldoInicial} type="number" step="0.01" style={{ flex: 1, padding: 8 }} />
            <button type="submit" style={{ background: "#4a1c6b", color: "white", border: 0, borderRadius: 8, padding: "8px 14px" }}>
              Atualizar inicial
            </button>
          </form>
        </div>
        <div style={{ background: "#fffdf8", border: "1px solid #e4d9c8", borderRadius: 16, padding: 20 }}>
          <p style={{ marginTop: 0 }}>Movimento</p>
          <p>Entradas {brl(caixa.entradas)}</p>
          <p>Saidas {brl(caixa.saidas)}</p>
        </div>
      </div>
      <h3 style={{ fontFamily: "Georgia, serif", marginTop: 32 }}>Extrato</h3>
      <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
            <th>Data</th>
            <th>Tipo</th>
            <th>Descricao</th>
            <th>Valor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((l) => (
            <tr key={l.id} style={{ borderBottom: "1px solid #f0e8da" }}>
              <td>{dataIsoBr(l.data)}</td>
              <td>{l.tipo}</td>
              <td>
                {l.descricao}
                {l.servicoNome ? ` (${l.servicoNome})` : ""}
              </td>
              <td>{brl(l.valor)}</td>
              <td>
                {l.producaoMensalId ? (
                  <span style={{ opacity: 0.55, fontSize: 12 }}>via producao</span>
                ) : l.tipo === "EntradaCaixa" ? (
                  <form action={excluirLancamento}>
                    <input type="hidden" name="id" value={l.id} />
                    <button type="submit" style={{ border: 0, background: "transparent", color: "#8a1c1c" }}>
                      excluir
                    </button>
                  </form>
                ) : (
                  <span style={{ opacity: 0.55, fontSize: 12 }}>em Custos</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
