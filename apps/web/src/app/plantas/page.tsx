import { brl, dataIsoBr } from "@/lib/api";
import type { Plantas } from "@/lib/types";
import { salvarPlantas } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { campo, inputCampo } from "@/components/LancarModal";

const card = { background: "#fffdf8", border: "1px solid #e4d9c8", borderRadius: 16, padding: 16 };

export default async function PlantasPage() {
  const p = await apiGet<Plantas>("/plantas");
  const cachosNoAno = p.cachosPorPalmeiraNoAno ?? 0;
  const pronto = p.cachosPorLata > 0 && cachosNoAno > 0;
  const ano = p.previsoes?.find((item) => item.meses === 12);

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Plantas</h2>
      <p>
        Médio e grande entram como uma unidade cada, só para contar o plantio. A conta do ano cheio usa só{" "}
        <strong>Já produzem</strong>: esse número vezes os cachos que cada açaizeira dá no ano, dividido pelos cachos de
        uma lata. Em {p.anoCorrente ?? new Date().getFullYear()} essa conta ainda não começa: o açaí fica pronto daqui
        aos meses que você informar, e o que entrar antes aparece como a mais.
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
            Cachos de cada açaizeira no ano
            <input type="number" min={0} name="cachosPorPalmeiraNoAno" defaultValue={cachosNoAno || ""} required style={inputCampo} />
          </label>
          <label style={campo}>
            Cachos para dar 1 lata
            <input type="number" min={0} name="cachosPorLata" defaultValue={p.cachosPorLata || ""} required style={inputCampo} />
          </label>
          <label style={campo}>
            Pronto em, de
            <input type="number" min={0} name="mesesAteProntoDe" defaultValue={p.mesesAteProntoDe ?? 6} required style={inputCampo} />
          </label>
          <label style={campo}>
            até (meses)
            <input type="number" min={0} name="mesesAteProntoAte" defaultValue={p.mesesAteProntoAte ?? 7} required style={inputCampo} />
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

      <div style={{ ...card, marginBottom: 28 }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, marginTop: 0 }}>{p.anoCorrente}, o começo</h3>
        <p style={{ marginBottom: 0 }}>
          Estamos começando agora. O açaí fica pronto em{" "}
          {p.mesesAteProntoDe === p.mesesAteProntoAte
            ? `${fmt(p.mesesAteProntoDe)} ${p.mesesAteProntoDe === 1 ? "mês" : "meses"}, em ${p.prontoDe}`
            : `${fmt(p.mesesAteProntoDe)} a ${fmt(p.mesesAteProntoAte)} meses, de ${p.prontoDe} a ${p.prontoAte}`}
          . A previsão de {p.anoCorrente} não usa o semestre. Até essa data, o previsto neste ano é{" "}
          <strong>{faixa(p.latasPrevistasNoAno, p.latasPrevistasNoAnoMax)} {p.latasPrevistasNoAno === 1 && p.latasPrevistasNoAnoMax === 1 ? "lata" : "latas"}</strong>.
          O que entrar antes é a mais: <strong>{fmt(p.latasAMaisNoAno)} {p.latasAMaisNoAno === 1 ? "lata" : "latas"}</strong>.
          A casa entra nesse volume e não entra no caixa.
        </p>
      </div>

      {pronto ? (
        <>
          <p>
            A previsão usa <strong>{fmt(p.quantidadeJaProduzem)}</strong> em Já produzem. A adubação usa os{" "}
            <strong>{fmt(p.total)}</strong> pés de pequeno, médio e grande, contados como uma unidade cada.
          </p>
          <p>
            {fmt(p.quantidadeJaProduzem)} já produzem × {fmt(cachosNoAno)} cachos no ano ={" "}
            <strong>{ano ? fmt(ano.cachos) : "—"} cachos no ano</strong>. Isso dividido por {fmt(p.cachosPorLata)} cachos
            de uma lata = <strong>{ano ? fmt(ano.latas) : "—"} latas no ano</strong>.{" "}
            A tabela abaixo é o ano cheio, contado só depois que o açaí fica pronto. Ela não é a base de {p.anoCorrente}.{" "}
            {p.repartoPelaSafra
              ? "Os meses seguem a safra que o sítio já tirou."
              : "Ainda há pouca safra lançada, então os meses saem em partes iguais."}{" "}
            O valor da lata é {p.fontePreco === "informado" ? "o que você informou" : p.fontePreco === "ultima" ? "o da última produção lançada" : "ainda sem produção lançada"}.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fffdf8" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
                  <th style={{ padding: 8 }}>Período</th>
                  <th style={{ padding: 8 }}>Cachos no período</th>
                  <th style={{ padding: 8 }}>Latas previstas</th>
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
            Essas latas só entram na conta a partir de {p.prontoDe}
            {p.prontoDe === p.prontoAte ? "" : ` a ${p.prontoAte}`}. O que já entrou em {p.anoCorrente} está na linha de a mais, acima.
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
          Informe quantos cachos cada açaizeira dá no ano e quantos cachos formam uma lata. A conta é sempre Já produzem × cachos no ano, dividido pelos cachos de uma lata.
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
