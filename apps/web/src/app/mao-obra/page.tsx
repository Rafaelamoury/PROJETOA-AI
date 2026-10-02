import type { Servico } from "@/lib/types";
import { excluirServico, salvarServico } from "@/app/actions";
import { apiGet } from "@/lib/server-api";
import { LancarModal, botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

export default async function MaoObraPage() {
  const lista = await apiGet<Servico[]>("/servicos");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginTop: 0 }}>Servicos de mao de obra</h2>
          <p>Incluir, alterar e excluir o serviço e o valor. O lançamento desse custo é feito em Custos.</p>
        </div>
        <LancarModal titulo="Novo servico" botao="+ Incluir servico" dica="Depois de adicionar, a aba continua aberta.">
          <form action={salvarServico} style={{ display: "grid", gap: 12 }}>
            <label style={campo}>
              Nome do servico
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
      {lista.map((s) => (
        <div key={s.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: 12, background: "#fffdf8", borderRadius: 10, marginBottom: 8, border: "1px solid #e4d9c8" }}>
          <form action={salvarServico} style={{ display: "flex", gap: 8, flex: 1 }}>
            <input type="hidden" name="id" value={s.id} />
            <input name="nome" defaultValue={s.nome} required style={{ flex: 1, padding: 8 }} />
            <input name="valor" type="number" step="0.01" defaultValue={s.valor} required style={{ width: 120, padding: 8 }} />
            <button type="submit" style={{ background: "#1f6b45", color: "white", border: 0, borderRadius: 8, padding: "8px 12px" }}>
              Alterar
            </button>
          </form>
          <form action={excluirServico}>
            <input type="hidden" name="id" value={s.id} />
            <button type="submit" className="neo-texto">
              excluir
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
