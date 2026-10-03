import { brl, dataIsoBr } from "@/lib/api";
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
          <label style={campo}>
            Valor da lata na previsão
            <input type="number" min={0} step="0.01" name="valorLataPrevisao" defaultValue={p.valorLataPrevisao || ""} style={inputCampo} />
          </label>
          <button type="submit" style={{ background: "#1f6b45", color: "white", border: 0, borderRadius: 8, padding: "10px 16px" }}>
            Salvar
          </button>
        </div>
      </form>

      {pronto ? (
        <>
          <p>
            A previsão usa <strong>{fmt(p.quantidadeJaProduzem)}</strong> em Já produzem. A adubação usa os{" "}
            <strong>{fmt(p.total)}</strong> pés de pequeno, médio e grande, contados como uma unidade cada.
          </p>
          <p>
            A Embrapa descreve de <strong>6 a 8 cachos por açaizeira no ano</strong>.{" "}
            {p.repartoPelaSafra
              ? "Essa parte do ano segue os meses em que o sítio já tirou mais açaí."
              : "Ainda há pouca safra lançada, então o ano se reparte em partes iguais."}{" "}
            Uma lata sai de <strong>{p.cachosPorLata} {p.cachosPorLata === 1 ? "cacho" : "cachos"}</strong>. O valor da
            lata é {p.fontePreco === "informado" ? "o que você informou" : p.fontePreco === "ultima" ? "o da última produção lançada" : "ainda sem produção lançada"}.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fffdf8" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
                  <th style={{ padding: 8 }}>Período</th>
                  <th style={{ padding: 8 }}>Cachos no período</th>
                  <th style={{ padding: 8 }}>Latas previstas</th>
                  <th style={{ padding: 8 }}>Já tiradas</th>
                  <th style={{ padding: 8 }}>Valor da lata</th>
                  <th style={{ padding: 8 }}>Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {p.previsoes.map((item) => (
                  <tr key={item.meses} style={{ borderBottom: "1px solid #f0e8da" }}>
                    <td style={{ padding: 8 }}>
                      {item.periodo}
                      <span style={{ opacity: 0.65 }}> · {item.meses} meses · {fmt(item.parteDoAno * 100)}% do ano</span>
                    </td>
                    <td style={{ padding: 8 }}>{faixa(item.cachos, item.cachosMax)}</td>
                    <td style={{ padding: 8 }}>{faixa(item.latas, item.latasMax)}</td>
                    <td style={{ padding: 8 }}>{fmt(item.latasTiradas)}</td>
                    <td style={{ padding: 8 }}>
                      {item.valorMedioLata == null ? "sem produção lançada" : brl(item.valorMedioLata)}
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
            Latas previstas olham para a frente, na parte do ano indicada. Já tiradas são a produção mais a casa nos
            últimos meses desse prazo. A casa não entra no caixa. O faturamento usa o valor da lata da previsão.
          </p>
          {(p.historico ?? []).length > 0 ? (
            <>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>Contagens guardadas</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#fffdf8" }}>
                <thead>
                  <tr>
                    <th style={{ padding: 8 }}>Data</th>
                    <th style={{ padding: 8 }}>Pequeno</th>
                    <th style={{ padding: 8 }}>Médio</th>
                    <th style={{ padding: 8 }}>Grande</th>
                    <th style={{ padding: 8 }}>Já produzem</th>
                  </tr>
                </thead>
                <tbody>
                  {p.historico.map((c, i) => (
                    <tr key={`${c.data}-${i}`}>
                      <td style={{ padding: 8 }}>{dataIsoBr(c.data)}</td>
                      <td style={{ padding: 8 }}>{fmt(c.pequeno)}</td>
                      <td style={{ padding: 8 }}>{fmt(c.medio)}</td>
                      <td style={{ padding: 8 }}>{fmt(c.grande)}</td>
                      <td style={{ padding: 8 }}>{fmt(c.jaProduzem)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
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
