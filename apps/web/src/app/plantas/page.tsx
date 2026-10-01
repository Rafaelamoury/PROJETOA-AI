import { brl } from "@/lib/api";
import type { Plantas } from "@/lib/types";
import { salvarPlantas } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { campo, inputCampo } from "@/components/LancarModal";

const card = { background: "#fffdf8", border: "1px solid #e4d9c8", borderRadius: 16, padding: 16 };

export default async function PlantasPage() {
  const p = await apiGet<Plantas>("/plantas");
  const pronto = p.cachosPorLata > 0 && p.mesesParaMadurar > 0;
  const latasMes = pronto ? p.quantidadeJaProduzem / p.cachosPorLata : 0;
  const cachosNoPe = p.quantidadeJaProduzem * p.mesesParaMadurar;

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Plantas</h2>
      <p>
        Cada fase do plantio fica separada. A média de produção usa só os pés que já produzem: cada um bota 1 cacho por
        mês, e esse cacho leva um tempo para ficar maduro.
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
            Meses para o cacho ficar maduro
            <input type="number" min={0} name="mesesParaMadurar" defaultValue={p.mesesParaMadurar || ""} required style={inputCampo} />
          </label>
          <button type="submit" style={{ background: "#1f6b45", color: "white", border: 0, borderRadius: 8, padding: "10px 16px" }}>
            Salvar
          </button>
        </div>
      </form>

      {pronto ? (
        <>
          <p>
            Cada pé que já produz bota <strong>1 cacho por mês</strong>. Esse cacho leva{" "}
            <strong>{p.mesesParaMadurar} {p.mesesParaMadurar === 1 ? "mês" : "meses"}</strong> para ficar maduro: o que
            nasce agora é colhido depois desse prazo. Como esses pés já produzem, amadurece 1 cacho por pé em cada mês.
            Uma lata sai de <strong>{p.cachosPorLata} {p.cachosPorLata === 1 ? "cacho" : "cachos"}</strong>.
          </p>
          <p>
            Neste mês nascem <strong>{fmt(p.quantidadeJaProduzem)} cachos</strong> e ficam maduros outros{" "}
            <strong>{fmt(p.quantidadeJaProduzem)}</strong>, o que dá <strong>{fmt(latasMes)} latas</strong>. Nos pés que
            já produzem há <strong>{fmt(cachosNoPe)} cachos</strong> a caminho, um para cada mês até madurar. Pequeno,
            médio e grande ainda não entram nessa média.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fffdf8" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
                  <th style={{ padding: 8 }}>Período</th>
                  <th style={{ padding: 8 }}>Cachos maduros</th>
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
                    <td style={{ padding: 8 }}>{fmt(item.cachos)}</td>
                    <td style={{ padding: 8 }}>{fmt(item.latas)}</td>
                    <td style={{ padding: 8 }}>
                      {item.valorMedioLata == null ? "sem produção lançada" : brl(item.valorMedioLata)}
                      {item.valorDaMediaGeral ? " (média geral)" : ""}
                    </td>
                    <td style={{ padding: 8 }}>{item.faturamento == null ? "—" : brl(item.faturamento)}</td>
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
        <p>Informe quantos cachos dão uma lata e quantos meses o cacho leva para madurar. A média aparece em seguida.</p>
      )}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}
