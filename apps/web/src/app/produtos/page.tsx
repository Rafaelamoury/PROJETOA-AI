import { brl, UNIDADES, unidadeDe } from "@/lib/api";
import type { Produto } from "@/lib/types";
import { excluirProduto, salvarProduto } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { LancarModal, botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

const selectUnidade = { padding: 8, borderRadius: 8, border: "1px solid #e4d9c8" };

export default async function ProdutosPage() {
  const lista = await apiGet<Produto[]>("/produtos");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Valor dos produtos</h2>
          <p>
            Cadastre o material e o preço da unidade: metro, litro, quilo ou unidade. A compra, com a quantidade e o
            total, é lançada em Custos. Alterar o preço daqui não reescreve o que já saiu do caixa.
          </p>
        </div>
        <LancarModal titulo="Novo produto" botao="+ Incluir produto" dica="Depois de adicionar, a aba continua aberta.">
          <form action={salvarProduto} style={{ display: "grid", gap: 12 }}>
            <label style={campo}>
              Produto
              <input name="nome" required style={inputCampo} />
            </label>
            <label style={campo}>
              Unidade
              <select name="unidade" defaultValue="Metro" required style={inputCampo}>
                {UNIDADES.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </label>
            <label style={campo}>
              Valor da unidade
              <input name="valor" type="number" step="0.01" min={0} required style={inputCampo} />
            </label>
            <button type="submit" style={botaoAdicionar}>
              Adicionar
            </button>
          </form>
        </LancarModal>
      </div>
      {lista.map((p) => {
        const unidade = unidadeDe(p.unidade);
        return (
          <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, background: "#fffdf8", borderRadius: 10, marginBottom: 8, border: "1px solid #e4d9c8" }}>
            <form action={salvarProduto} style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
              <input type="hidden" name="id" value={p.id} />
              <input name="nome" defaultValue={p.nome} required style={{ flex: 1, minWidth: 160, padding: 8 }} />
              <select name="unidade" defaultValue={p.unidade || "Unidade"} required style={selectUnidade}>
                {UNIDADES.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
              <input name="valor" type="number" step="0.01" min={0} defaultValue={p.valor} required style={{ width: 120, padding: 8 }} />
              <span style={{ alignSelf: "center", fontSize: 13, opacity: 0.75 }}>{brl(p.valor)} {unidade.por}</span>
              <button type="submit" style={{ background: "#4a1c6b", color: "white", border: 0, borderRadius: 8, padding: "8px 12px" }}>
                Alterar
              </button>
            </form>
            <form action={excluirProduto}>
              <input type="hidden" name="id" value={p.id} />
              <button type="submit" style={{ color: "#8a1c1c" }}>
                excluir
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
