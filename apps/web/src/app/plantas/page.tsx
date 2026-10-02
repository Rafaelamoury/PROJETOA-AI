import { brl } from "@/lib/api";
import type { Plantas } from "@/lib/types";
import { salvarPlantas } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { campo, inputCampo } from "@/components/LancarModal";

const card = { background: "#fffdf8", border: "1px solid #e4d9c8", borderRadius: 16, padding: 16 };

export default async function PlantasPage() {
  const p = await apiGet<Plantas>("/plantas");
  const pronto = p.cachosPorLata > 0;

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Plantas</h2>
      <p>
        Médio e grande entram como uma unidade cada, só para contar o plantio. Em Já produzem você coloca o número que
        já fez a conta: a maior parte com 2 palmeiras juntas e as que têm 3. A tabela usa só esse número. Cada
        açaizeira entra com 6 a 8 cachos no ano, e esse total se reparte em trimestre, semestre, nove meses e ano.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          ["Pequeno", p.quantidadePequeno],
          ["Médio", p.quantidadeMedio],
          ["Grande", p.quantidadeGrande],
          ["Total P/M/G", p.total],
          ["Já produzem", p.quantidadeJaProduzem],
        ].map(([nome, quantidade]) => (
          <div key={String(nome)} style={card}>
            <p style={{ margin: 0, opacity: 0.7 }}>{nome}</p>
            <strong style={{ fontSize: 28 }}>{quantidade}</strong>
          </div>
        ))}
      </div>

      <form action={salvarPlantas} style={{ display: "grid", gap: 16, marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "end", flexWrap: "wrap" }}>
          <label style={campo}>
            Pequeno
            <input type="number" min={0} name="quantidadePequeno" defaultValue={p.quantidadePequeno} required style={inputCampo} />
          </label>
          <label style={campo}>
            Médio
            <input type="number" min={0} name="quantidadeMedio" defaultValue={p.quantidadeMedio} required style={inputCampo} />
          </label>
          <label style={campo}>
            Grande
            <input type="number" min={0} name="quantidadeGrande" defaultValue={p.quantidadeGrande} required style={inputCampo} />
          </label>
          <label style={campo}>
            Já produzem
            <input type="number" min={0} name="quantidadeJaProduzem" defaultValue={p.quantidadeJaProduzem} required style={inputCampo} />
          </label>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "end", flexWrap: "wrap" }}>
          <label style={campo}>
            Cachos para dar 1 lata
            <input type="number" min={0} name="cachosPorLata" defaultValue={p.cachosPorLata || ""} required style={inputCampo} />
          </label>
          <input type="hidden" name="mesesParaMadurar" value={p.mesesParaMadurar || 0} />
          <input type="hidden" name="mesesEntreCachos" value={p.mesesEntreCachos || 0} />
          <button type="submit" style={{ background: "#1f6b45", color: "white", border: 0, borderRadius: 8, padding: "10px 16px" }}>
            Salvar
          </button>
        </div>
      </form>

      {pronto ? (
        <>
          <p>
            A tabela parte de <strong>{fmt(p.quantidadeJaProduzem)}</strong> açaizeiras que já produzem. Médio e grande
            não entram nessa conta.
          </p>
          <p>
            A Embrapa descreve de <strong>6 a 8 cachos por açaizeira no ano</strong>. O trimestre leva um quarto desse
            ano, o semestre a metade, os nove meses três quartos e o ano o total. Uma lata sai de{" "}
            <strong>{p.cachosPorLata} {p.cachosPorLata === 1 ? "cacho" : "cachos"}</strong>.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fffdf8" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
                  <th style={{ padding: 8 }}>Período</th>
                  <th style={{ padding: 8 }}>Cachos no período</th>
                  <th style={{ padding: 8 }}>Latas</th>
                  <th style={{ padding: 8 }}>Valor médio da lata</th>
                  <th style={{ padding: 8 }}>Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {p.previsoes.map((item) => (
                  <tr key={item.meses} style={{ borderBottom: "1px solid #f0e8da" }}>
                    <td style={{ padding: 8 }}>
                      {item.periodo}
                      <span style={{ opacity: 0.65 }}> · {item.meses} meses</span>
                    </td>
                    <td style={{ padding: 8 }}>{faixa(item.cachos, item.cachosMax)}</td>
                    <td style={{ padding: 8 }}>{faixa(item.latas, item.latasMax)}</td>
                    <td style={{ padding: 8 }}>
                      {item.valorMedioLata == null ? "sem produção lançada" : brl(item.valorMedioLata)}
                      {item.valorDaMediaGeral ? " (média geral)" : ""}
                    </td>
                    <td style={{ padding: 8 }}>
                      {item.faturamento == null || item.faturamentoMax == null
                        ? "—"
                        : faixa(item.faturamento, item.faturamentoMax, brl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: "#5c4a32" }}>
            O faturamento é a quantidade de latas vezes o valor médio da lata nas produções já lançadas naquele
            período.
          </p>
        </>
      ) : (
        <p>
          Informe quantos cachos dão uma lata para ver o trimestre, o semestre e o ano.
        </p>
      )}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

function faixa(min: number, max: number, formatar: (n: number) => string = fmt) {
  if (min === max) return formatar(min);
  return `${formatar(min)} a ${formatar(max)}`;
}
