import { brl, dataIsoBr, hojeLocal } from "@/lib/api";
import type { Lancamento, Servico } from "@/lib/types";
import { criarLancamento, excluirLancamento } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { LancarModal, botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

export default async function CustosPage() {
  const [lista, servicos] = await Promise.all([
    apiGet<Lancamento[]>("/lancamentos"),
    apiGet<Servico[]>("/servicos"),
  ]);
  const hoje = hojeLocal();
  const custos = lista.filter((l) => l.tipo === "CustoOperacional" || l.tipo === "MaoObra");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Custos</h2>
          <p>
            Lance custos operacionais e pagamentos de mao de obra. Cada lancamento desconta o caixa. O valor de cada
            servico fica em <strong>Mao de obra</strong>.
          </p>
        </div>
        <LancarModal
          titulo="Novo custo"
          botao="+ Lancar custo"
          dica="Depois de adicionar, a aba continua aberta para o proximo lancamento."
        >
          <form action={criarLancamento} style={{ display: "grid", gap: 12 }}>
            <label style={campo}>
              Data
              <input type="date" name="data" defaultValue={hoje} required style={inputCampo} />
            </label>
            <label style={campo}>
              Tipo
              <select name="tipo" defaultValue="CustoOperacional" style={inputCampo}>
                <option value="CustoOperacional">Custo operacional</option>
                <option value="MaoObra">Mao de obra</option>
              </select>
            </label>
            <label style={campo}>
              Valor
              <input type="number" step="0.01" name="valor" required style={inputCampo} />
            </label>
            <label style={campo}>
              Servico (se for mao de obra)
              <select name="servicoMaoObraId" defaultValue="" style={inputCampo}>
                <option value="">Nenhum</option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome} - {brl(s.valor)}
                  </option>
                ))}
              </select>
            </label>
            <label style={campo}>
              Descricao
              <input name="descricao" required style={inputCampo} />
            </label>
            <button type="submit" style={botaoAdicionar}>
              Adicionar
            </button>
          </form>
        </LancarModal>
      </div>
      <table style={{ width: "100%", marginTop: 8, borderCollapse: "collapse" }}>
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
          {custos.map((l) => (
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
                ) : (
                  <form action={excluirLancamento}>
                    <input type="hidden" name="id" value={l.id} />
                    <button type="submit" style={{ border: 0, background: "transparent", color: "#8a1c1c" }}>
                      excluir
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
