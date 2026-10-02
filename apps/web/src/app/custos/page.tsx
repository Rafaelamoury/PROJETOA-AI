import { brl, dataIsoBr, unidadeDe } from "@/lib/api";
import type { Lancamento, Produto, Servico } from "@/lib/types";
import { excluirLancamento } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { FormLancamentoCusto } from "@/components/FormLancamentoCusto";
import { LancarModal } from "@/components/LancarModal";

export default async function CustosPage() {
  const [lista, servicos, produtos] = await Promise.all([
    apiGet<Lancamento[]>("/lancamentos"),
    apiGet<Servico[]>("/servicos"),
    apiGet<Produto[]>("/produtos"),
  ]);
  const custos = lista.filter((l) => l.tipo === "CustoOperacional" || l.tipo === "MaoObra");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Custos</h2>
          <p>
            Lance gastos avulsos, compra de material e mão de obra. No produto cadastrado, informe a quantidade e o
            valor desta compra. O total que sai do caixa é a quantidade vezes esse valor.
          </p>
        </div>
        <LancarModal
          titulo="Novo custo"
          botao="+ Lançar custo"
          dica="Depois de adicionar, a aba continua aberta para o próximo lançamento."
        >
          <FormLancamentoCusto servicos={servicos} produtos={produtos} />
        </LancarModal>
      </div>
      <table style={{ width: "100%", marginTop: 8, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e4d9c8" }}>
            <th>Data</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Quantidade</th>
            <th>Quem fez</th>
            <th>Dias</th>
            <th>Pessoas</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {custos.map((l) => (
            <tr key={l.id} style={{ borderBottom: "1px solid #f0e8da" }}>
              <td>{dataIsoBr(l.data)}</td>
              <td>{l.tipo === "MaoObra" ? "Mão de obra" : "Operacional"}</td>
              <td>
                {l.descricao}
                {l.servicoNome && !l.descricao.includes(l.servicoNome) ? ` (${l.servicoNome})` : ""}
              </td>
              <td>{textoQuantidade(l)}</td>
              <td>{textoPessoas(l)}</td>
              <td>{l.diasAtividade ?? "—"}</td>
              <td>{l.pessoas?.length ?? "—"}</td>
              <td>{brl(l.valor)}</td>
              <td>
                {l.producaoMensalId ? (
                  <span style={{ opacity: 0.55, fontSize: 12 }}>via produção</span>
                ) : (
                  <form action={excluirLancamento}>
                    <input type="hidden" name="id" value={l.id} />
                    <button type="submit" className="neo-texto">
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

function textoQuantidade(l: Lancamento) {
  if (l.quantidade == null || !l.unidade) return "—";
  const unidade = unidadeDe(l.unidade);
  const qtd = l.quantidade.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  const unitario = l.valorUnitario != null ? ` × ${brl(l.valorUnitario)}` : "";
  return `${qtd} ${unidade.curto}${unitario}`;
}

function textoPessoas(l: Lancamento) {
  if (!l.pessoas?.length) return "—";
  return l.pessoas.map((p) => `${p.nome} (${brl(p.valor)}/dia)`).join(", ");
}
