import type { Produto } from "@/lib/types";
import { excluirProduto, salvarProduto } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { LancarModal, botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

export default async function ProdutosPage() {
  const lista = await apiGet<Produto[]>("/produtos");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Valor dos produtos</h2>
          <p>Alterar o preco da tabela nao reescreve producao nem caixa ja lancados.</p>
        </div>
        <LancarModal titulo="Novo produto" botao="+ Incluir produto" dica="Depois de adicionar, a aba continua aberta.">
          <form action={salvarProduto} style={{ display: "grid", gap: 12 }}>
            <label style={campo}>
              Produto
              <input name="nome" required style={inputCampo} />
            </label>
            <label style={campo}>
              Valor
              <input name="valor" type="number" step="0.01" required style={inputCampo} />
            </label>
            <button type="submit" style={botaoAdicionar}>
              Adicionar
            </button>
          </form>
        </LancarModal>
      </div>
      {lista.map((p) => (
        <div key={p.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, background: "#fffdf8", borderRadius: 10, marginBottom: 8, border: "1px solid #e4d9c8" }}>
          <form action={salvarProduto} style={{ display: "flex", gap: 8, flex: 1 }}>
            <input type="hidden" name="id" value={p.id} />
            <input name="nome" defaultValue={p.nome} required style={{ flex: 1, padding: 8 }} />
            <input name="valor" type="number" step="0.01" defaultValue={p.valor} required style={{ width: 120, padding: 8 }} />
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
      ))}
    </div>
  );
}
