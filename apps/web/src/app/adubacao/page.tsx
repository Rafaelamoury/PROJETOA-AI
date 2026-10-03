import { brl, unidadeDe } from "@/lib/api";
import type { Adubacao, FaixaAdubacao, Lancamento, Plantas, Produto } from "@/lib/types";
import { salvarAdubacao } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { campo, inputCampo } from "@/components/LancarModal";

const card = { background: "#fffdf8", border: "1px solid #e4d9c8", borderRadius: 16, padding: 16 };

export default async function AdubacaoPage() {
  const [plano, produtos, plantas, lancamentos] = await Promise.all([
    apiGet<Adubacao>("/adubacao"),
    apiGet<Produto[]>("/produtos"),
    apiGet<Plantas>("/plantas"),
    apiGet<Lancamento[]>("/lancamentos"),
  ]);
  const comprado = new Map<number, number>();
  for (const l of lancamentos) {
    if (l.produtoId == null || l.quantidade == null) continue;
    comprado.set(l.produtoId, (comprado.get(l.produtoId) ?? 0) + l.quantidade);
  }
  const faixas = [plano.pequeno, plano.medio, plano.grande];
  const preciso = new Map<number, number>();
  for (const f of faixas) {
    if (f.produtoId == null) continue;
    preciso.set(f.produtoId, (preciso.get(f.produtoId) ?? 0) + f.totalAno);
  }
  const pronto = faixas.some((f) => f.quantidadePorPlanta > 0 && f.aplicacoesNoAno > 0);

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Adubação</h2>
      <p>
        Pequeno, médio e grande usam o adubo que você escolher para cada tamanho. A quantidade do ano se divide pelo
        número de aplicações. O valor sai do preço em Produtos. Esta aba não lança compra nem mexe no caixa.
      </p>
      <p>
        Já produzem, usado na previsão de latas: <strong>{fmt(plantas.quantidadeJaProduzem)}</strong>. Pés desta aba,
        pequeno + médio + grande: <strong>{fmt(plantas.total)}</strong>.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {faixas.map((f) => (
          <div key={f.tamanho} style={card}>
            <p style={{ margin: 0, opacity: 0.7 }}>{f.tamanho}</p>
            <strong style={{ fontSize: 28 }}>{fmt(f.plantas)}</strong>
          </div>
        ))}
      </div>

      <form action={salvarAdubacao} style={{ display: "grid", gap: 18, marginBottom: 28 }}>
        <FaixaForm nome="Pequeno" faixa={plano.pequeno} produtos={produtos} />
        <FaixaForm nome="Medio" titulo="Médio" faixa={plano.medio} produtos={produtos} />
        <FaixaForm nome="Grande" faixa={plano.grande} produtos={produtos} />
        <button type="submit" style={{ background: "#1f6b45", color: "white", border: 0, borderRadius: 8, padding: "10px 16px", justifySelf: "start" }}>
          Salvar
        </button>
      </form>

      {produtos.length === 0 ? <p>Cadastre os adubos em Produtos para a aba calcular o gasto.</p> : null}

      {pronto ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fffdf8" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
                <th style={{ padding: 8 }}>Tamanho</th>
                <th style={{ padding: 8 }}>Adubo</th>
                <th style={{ padding: 8 }}>Nesta aplicação</th>
                <th style={{ padding: 8 }}>Gasto desta</th>
                <th style={{ padding: 8 }}>No ano</th>
                <th style={{ padding: 8 }}>Já comprado</th>
                <th style={{ padding: 8 }}>Falta comprar</th>
                <th style={{ padding: 8 }}>Gasto no ano</th>
              </tr>
            </thead>
            <tbody>
              {faixas.map((f) => {
                const medida = f.unidade ? unidadeDe(f.unidade).curto : "";
                return (
                  <tr key={f.tamanho} style={{ borderBottom: "1px solid #f0e8da" }}>
                    <td style={{ padding: 8 }}>{f.tamanho}</td>
                    <td style={{ padding: 8 }}>{f.produtoNome ?? "escolha o adubo"}</td>
                    <td style={{ padding: 8 }}>
                      {f.aplicacoesNoAno > 0 ? `${fmt(f.porAplicacao)} ${medida}` : "—"}
                    </td>
                    <td style={{ padding: 8 }}>{f.gastoAplicacao == null ? "—" : brl(f.gastoAplicacao)}</td>
                    <td style={{ padding: 8 }}>{f.quantidadePorPlanta > 0 ? `${fmt(f.totalAno)} ${medida}` : "—"}</td>
                    <td style={{ padding: 8 }}>
                      {f.produtoId == null ? "—" : `${fmt(comprado.get(f.produtoId) ?? 0)} ${medida}`}
                    </td>
                    <td style={{ padding: 8 }}>
                      {f.produtoId == null || f.quantidadePorPlanta <= 0
                        ? "—"
                        : `${fmt(Math.max(0, (preciso.get(f.produtoId) ?? 0) - (comprado.get(f.produtoId) ?? 0)))} ${medida}`}
                    </td>
                    <td style={{ padding: 8 }}>{f.gastoAno == null ? "—" : brl(f.gastoAno)}</td>
                  </tr>
                );
              })}
              <tr>
                <td style={{ padding: 8 }} colSpan={3}>
                  <strong>Total</strong>
                </td>
                <td style={{ padding: 8 }}>
                  <strong>{plano.gastoAplicacao == null ? "—" : brl(plano.gastoAplicacao)}</strong>
                </td>
                <td style={{ padding: 8 }} colSpan={3} />
                <td style={{ padding: 8 }}>
                  <strong>{plano.gastoAno == null ? "—" : brl(plano.gastoAno)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p>Para cada tamanho, informe o adubo, quanto cada planta recebe no ano e em quantas vezes isso se divide.</p>
      )}
    </div>
  );
}

function FaixaForm({
  nome,
  titulo,
  faixa,
  produtos,
}: {
  nome: string;
  titulo?: string;
  faixa: FaixaAdubacao;
  produtos: Produto[];
}) {
  return (
    <fieldset style={{ border: "1px solid #e4d9c8", borderRadius: 12, padding: 16 }}>
      <legend style={{ fontFamily: "Georgia, serif", padding: "0 8px" }}>{titulo ?? nome}</legend>
      <div style={{ display: "flex", gap: 16, alignItems: "end", flexWrap: "wrap" }}>
        <label style={campo}>
          Adubo
          <select
            key={`${nome}-${faixa.produtoId ?? ""}`}
            name={`produto${nome}`}
            defaultValue={faixa.produtoId == null ? "" : String(faixa.produtoId)}
            style={inputCampo}
          >
            <option value="">Escolha o adubo</option>
            {produtos.map((p) => {
              const u = unidadeDe(p.unidade);
              return (
                <option key={`${nome}-${p.id}`} value={String(p.id)}>
                  {p.nome} — {brl(p.valor)} {u.por}
                </option>
              );
            })}
          </select>
        </label>
        <label style={campo}>
          Quantidade por planta no ano
          <input
            type="number"
            min={0}
            step="0.01"
            name={`quantidade${nome}`}
            defaultValue={faixa.quantidadePorPlanta || ""}
            style={inputCampo}
          />
        </label>
        <label style={campo}>
          Adubações no ano
          <input
            type="number"
            min={0}
            step={1}
            name={`aplicacoes${nome}`}
            defaultValue={faixa.aplicacoesNoAno || ""}
            style={inputCampo}
          />
        </label>
      </div>
      {faixa.quantidadePorPlanta > 0 && faixa.aplicacoesNoAno > 0 ? (
        <p style={{ margin: "12px 0 0", color: "#5c4a32" }}>
          Cada pé leva {fmt(faixa.porPlantaNaAplicacao)} {faixa.unidade ? unidadeDe(faixa.unidade).curto : ""} nesta
          aplicação.
        </p>
      ) : null}
    </fieldset>
  );
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}
