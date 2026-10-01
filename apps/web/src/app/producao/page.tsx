import { brl, dataBr } from "@/lib/api";
import type { Producao } from "@/lib/types";
import { excluirProducao } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { FormProducao } from "@/components/FormProducao";
import { LancarModal } from "@/components/LancarModal";

export default async function ProducaoPage() {
  const lista = await apiGet<Producao[]>("/producoes");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Producao mensal</h2>
          <p>
            Escolha o mes e o dia em que o acai foi tirado. O valor das latas entra no caixa nessa data e o custo para
            tirar sai no mesmo dia. Pode lancar varios dias no mesmo mes. Use alterar para corrigir uma linha ja lancada.
          </p>
        </div>
        <LancarModal
          titulo="Novo mes de producao"
          botao="+ Lancar producao"
          dica="Escolha o dia do mes. O caixa e os custos lancam nessa data. A aba continua aberta para outro dia."
        >
          <FormProducao />
        </LancarModal>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
            <th>Data</th>
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
              <td>{dataBr(p.ano, p.mes, p.dia)}</td>
              <td>{p.quantidadeLatas}</td>
              <td>{brl(p.valorLata)}</td>
              <td>{brl(p.custoTotal ?? p.custosExtracao)}</td>
              <td>{p.custoPorLata != null ? brl(p.custoPorLata) : "-"}</td>
              <td>{brl(p.valorBruto ?? p.quantidadeLatas * p.valorLata)}</td>
              <td>
                <strong>{brl(p.valorLiquido ?? p.valorProducao)}</strong>
              </td>
              <td>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <LancarModal titulo="Alterar producao" botao="alterar" compact dica="O caixa e os custos desta data sao atualizados juntos.">
                    <FormProducao
                      inicial={{
                        id: p.id,
                        ano: p.ano,
                        mes: p.mes,
                        dia: p.dia || 1,
                        quantidadeLatas: p.quantidadeLatas,
                        valorLata: p.valorLata,
                        custosExtracao: p.custosExtracao,
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
