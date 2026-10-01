import { brl, dataBr, nomeMes } from "@/lib/api";
import type { Producao, RetiradaCasa } from "@/lib/types";
import { excluirCasa, excluirProducao } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { FormProducao } from "@/components/FormProducao";
import { FormCasa } from "@/components/FormCasa";
import { FiltroMesAno } from "@/components/FiltroMesAno";
import { LancarModal } from "@/components/LancarModal";

export default async function ProducaoPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const sp = await searchParams;
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const anoPedido = Number(sp.ano);
  const mesPedido = Number(sp.mes);
  const ano = anoPedido >= 2000 && anoPedido <= 2100 ? anoPedido : anoAtual;
  const mes = mesPedido >= 1 && mesPedido <= 12 ? mesPedido : mesAtual;

  const [lista, casas] = await Promise.all([
    apiGet<Producao[]>("/producoes"),
    apiGet<RetiradaCasa[]>("/casa"),
  ]);

  const anosComDado = [...lista.map((p) => p.ano), ...casas.map((c) => c.ano), ano];
  const inicio = Math.min(anoAtual - 4, ...anosComDado);
  const fim = Math.max(anoAtual, ...anosComDado);
  const anos: number[] = [];
  for (let a = fim; a >= inicio; a--) anos.push(a);

  const doMes = lista
    .filter((p) => p.ano === ano && p.mes === mes)
    .sort((a, b) => b.dia - a.dia || b.id - a.id);
  const casaMes = casas
    .filter((c) => c.ano === ano && c.mes === mes)
    .sort((a, b) => b.dia - a.dia || b.id - a.id);
  const nomes = [...new Set(casas.map((c) => c.quemTirou))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const diaPadrao = ano === anoAtual && mes === mesAtual ? hoje.getDate() : 1;
  const padrao = { ano, mes, dia: diaPadrao };
  const totalLatas = doMes.reduce((s, p) => s + p.quantidadeLatas, 0);
  const totalLiquido = doMes.reduce((s, p) => s + (p.valorLiquido ?? p.valorProducao), 0);
  const totalCasa = casaMes.reduce((s, c) => s + c.quantidade, 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Producao mensal</h2>
          <p>
            Escolha o ano e o mês para ver os lançamentos daquele período. Os doze meses ficam no filtro. Informe o
            custo de cada lata: o total gasto e a quantidade vezes esse valor e sai do caixa no mesmo dia, junto com a
            entrada das latas. Pode lançar quantas produções quiser no mesmo dia. Use alterar para corrigir uma linha já lançada.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <LancarModal
            titulo="Novo lançamento de produção"
            botao="+ Lançar produção"
            dica="Informe o custo por lata. O total gasto é calculado pela quantidade e lançado no caixa nesse dia."
          >
            <FormProducao padrao={padrao} />
          </LancarModal>
          <LancarModal
            titulo="Casa"
            botao="+ Lançar casa"
            dica="Açaí tirado para beber em casa. Não entra no caixa: fica o dia, o mês, a quantidade e quem tirou."
          >
            <FormCasa padrao={padrao} nomes={nomes} />
          </LancarModal>
        </div>
      </div>

      <FiltroMesAno ano={ano} mes={mes} anos={anos} />

      <p style={{ margin: "0 0 18px", color: "#4a1c6b", fontWeight: 700 }}>
        {nomeMes(mes)} de {ano}
        {" · "}
        {qtd(totalLatas)} latas na produção
        {" · "}
        {qtd(totalCasa)} latas para casa
      </p>

      <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 8px" }}>Produção de {nomeMes(mes)}</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 8 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
            <th>Data</th>
            <th>Latas</th>
            <th>Valor lata</th>
            <th>Custo total</th>
            <th>Custo/lata</th>
            <th>Valor bruto</th>
            <th>Valor líquido</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {doMes.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: "14px 0", opacity: 0.7 }}>
                Nenhuma produção em {nomeMes(mes)} de {ano}.
              </td>
            </tr>
          ) : (
            doMes.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f0e8da" }}>
                <td>{dataBr(p.ano, p.mes, p.dia)}</td>
                <td>{qtd(p.quantidadeLatas)}</td>
                <td>{brl(p.valorLata)}</td>
                <td>{brl(p.custoTotal ?? p.custosExtracao)}</td>
                <td>{p.custoPorLata != null ? brl(p.custoPorLata) : "-"}</td>
                <td>{brl(p.valorBruto ?? p.quantidadeLatas * p.valorLata)}</td>
                <td>
                  <strong>{brl(p.valorLiquido ?? p.valorProducao)}</strong>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <LancarModal titulo="Alterar produção" botao="alterar" compact dica="O caixa e os custos desta data são atualizados juntos.">
                      <FormProducao
                        inicial={{
                          id: p.id,
                          ano: p.ano,
                          mes: p.mes,
                          dia: p.dia || 1,
                          quantidadeLatas: p.quantidadeLatas,
                          valorLata: p.valorLata,
                          custoPorLata: p.custoPorLata ?? (p.quantidadeLatas > 0 ? p.custosExtracao / p.quantidadeLatas : 0),
                        }}
                      />
                    </LancarModal>
                    <form action={excluirProducao}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" style={{ color: "#8a1c1c" }}>
                        excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {doMes.length > 0 ? (
        <p style={{ margin: "0 0 28px", fontSize: 13 }}>
          Total do mês: <strong>{qtd(totalLatas)} latas</strong> · líquido <strong>{brl(totalLiquido)}</strong>
        </p>
      ) : (
        <div style={{ height: 20 }} />
      )}

      <h3 style={{ fontFamily: "Georgia, serif", margin: "8px 0 4px" }}>Casa</h3>
      <p style={{ margin: "0 0 10px", fontSize: 14, opacity: 0.75 }}>
        Açaí tirado para beber em casa em {nomeMes(mes)} de {ano}. Cada linha guarda a quantidade, o dia e quem tirou.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
            <th>Data</th>
            <th>Mês</th>
            <th>Quantidade</th>
            <th>Quem tirou</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {casaMes.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: "14px 0", opacity: 0.7 }}>
                Nenhuma retirada para casa em {nomeMes(mes)} de {ano}.
              </td>
            </tr>
          ) : (
            casaMes.map((c) => (
              <tr key={c.id} style={{ borderBottom: "1px solid #f0e8da" }}>
                <td>{dataBr(c.ano, c.mes, c.dia)}</td>
                <td>{nomeMes(c.mes)}</td>
                <td>{qtd(c.quantidade)} latas</td>
                <td>{c.quemTirou}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <LancarModal titulo="Alterar casa" botao="alterar" compact dica="Corrige a quantidade, o dia ou quem tirou.">
                      <FormCasa
                        inicial={{
                          id: c.id,
                          ano: c.ano,
                          mes: c.mes,
                          dia: c.dia,
                          quantidade: c.quantidade,
                          quemTirou: c.quemTirou,
                        }}
                        nomes={nomes}
                      />
                    </LancarModal>
                    <form action={excluirCasa}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" style={{ color: "#8a1c1c" }}>
                        excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {casaMes.length > 0 ? (
        <p style={{ margin: "10px 0 0", fontSize: 13 }}>
          Total para casa neste mês: <strong>{qtd(totalCasa)} latas</strong>
        </p>
      ) : null}
    </div>
  );
}

function qtd(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}
