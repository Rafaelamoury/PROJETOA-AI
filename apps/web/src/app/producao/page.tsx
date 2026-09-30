import { brl, MESES, nomeMes } from "@/lib/api";
import type { Producao } from "@/lib/types";
import { excluirProducao, salvarProducao } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { LancarModal, botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

export default async function ProducaoPage() {
  const lista = await apiGet<Producao[]>("/producoes");
  const now = new Date();
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Producao mensal</h2>
          <p>
            Informe o custo total para tirar o acai. O sistema calcula custo por lata e valor liquido. Ao incluir, o
            valor entra no caixa. Mes ja lancado: exclua e lance de novo se errou.
          </p>
        </div>
        <LancarModal
          titulo="Novo mes de producao"
          botao="+ Lancar producao"
          dica="Depois de adicionar, a aba continua aberta para o proximo mes."
        >
          <form action={salvarProducao} style={{ display: "grid", gap: 12 }}>
            <label style={campo}>
              Ano
              <input type="number" name="ano" defaultValue={now.getFullYear()} required style={inputCampo} />
            </label>
            <label style={campo}>
              Mês
              <select name="mes" defaultValue={now.getMonth() + 1} required style={inputCampo}>
                {MESES.map((nome, i) => (
                  <option key={nome} value={i + 1}>
                    {nome}
                  </option>
                ))}
              </select>
            </label>
            <label style={campo}>
              Quantidade de latas
              <input type="number" step="0.01" name="quantidadeLatas" required style={inputCampo} />
            </label>
            <label style={campo}>
              Valor da lata
              <input type="number" step="0.01" name="valorLata" required style={inputCampo} />
            </label>
            <label style={campo}>
              Custo total para tirar o acai
              <input type="number" step="0.01" name="custosExtracao" required style={inputCampo} />
            </label>
            <button type="submit" style={botaoAdicionar}>
              Adicionar
            </button>
          </form>
        </LancarModal>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
            <th>Mes</th>
            <th>Latas</th>
            <th>Valor lata</th>
            <th>Custo total</th>
            <th>Custo/lata</th>
            <th>Valor bruto</th>
            <th>Valor liquido</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #f0e8da" }}>
              <td>
                {nomeMes(p.mes)} / {p.ano}
              </td>
              <td>{p.quantidadeLatas}</td>
              <td>{brl(p.valorLata)}</td>
              <td>{brl(p.custoTotal ?? p.custosExtracao)}</td>
              <td>{p.custoPorLata != null ? brl(p.custoPorLata) : "-"}</td>
              <td>{brl(p.valorBruto ?? p.quantidadeLatas * p.valorLata)}</td>
              <td>
                <strong>{brl(p.valorLiquido ?? p.valorProducao)}</strong>
              </td>
              <td>
                <form action={excluirProducao}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" style={{ color: "#8a1c1c" }}>
                    excluir
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
