import Link from "next/link";
import { apiGet } from "@/lib/server-api";
import { alterarAtividadePlanejamento, criarAtividadePlanejamento, excluirAtividadePlanejamento } from "@/app/actions";
import { LancarModal } from "@/components/LancarModal";

type Atividade = {
  id: number;
  ano: number;
  escala: string;
  periodo: number;
  titulo: string;
  detalhe: string | null;
};

const vistas = [
  { id: "trimestral", escala: "Trimestral", label: "Trimestral" },
  { id: "semestral", escala: "Semestral", label: "Semestral" },
  { id: "anual", escala: "Anual", label: "Anual" },
] as const;

function blocos(vista: string) {
  if (vista === "semestral") {
    return [
      { periodo: 1, titulo: "1o semestre", sub: "Janeiro a junho" },
      { periodo: 2, titulo: "2o semestre", sub: "Julho a dezembro" },
    ];
  }
  if (vista === "anual") {
    return [{ periodo: 1, titulo: "Ano inteiro", sub: "Atividades do ciclo anual" }];
  }
  return [
    { periodo: 1, titulo: "1o trimestre", sub: "Janeiro a marco" },
    { periodo: 2, titulo: "2o trimestre", sub: "Abril a junho" },
    { periodo: 3, titulo: "3o trimestre", sub: "Julho a setembro" },
    { periodo: 4, titulo: "4o trimestre", sub: "Outubro a dezembro" },
  ];
}

export default async function PlanejamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; vista?: string }>;
}) {
  const q = await searchParams;
  const agora = new Date().getFullYear();
  const ano = Number(q.ano) || agora;
  const vista = vistas.some((v) => v.id === q.vista) ? q.vista! : "trimestral";
  const meta = vistas.find((v) => v.id === vista)!;
  const lista = await apiGet<Atividade[]>(`/planejamento?ano=${ano}&escala=${meta.escala}`);
  const colunas = blocos(vista);

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32 }}>Planejamento do sitio</h2>
      <p>
        Organize o que precisa ser feito no terreno do acai. Escolha o ano e veja por trimestre, semestre ou o ano todo.
        Cada atividade fica so naquele periodo.
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "end", flexWrap: "wrap", marginBottom: 20 }}>
        <form method="get" action="/planejamento" style={{ display: "flex", gap: 8, alignItems: "end" }}>
          <input type="hidden" name="vista" value={vista} />
          <label>
            Ano
            <br />
            <input type="number" name="ano" defaultValue={ano} min={2000} max={2100} required style={{ width: 100, padding: 8 }} />
          </label>
          <button type="submit" style={{ background: "#4a1c6b", color: "white", border: 0, borderRadius: 8, padding: "8px 14px" }}>
            Ver ano
          </button>
        </form>
        <div style={{ display: "flex", gap: 8 }}>
          {vistas.map((v) => (
            <Link
              key={v.id}
              href={`/planejamento?ano=${ano}&vista=${v.id}`}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: v.id === vista ? "#4a1c6b" : "#fffdf8",
                color: v.id === vista ? "white" : "#1c1424",
                border: "1px solid #e4d9c8",
              }}
            >
              {v.label}
            </Link>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: vista === "anual" ? "1fr" : vista === "semestral" ? "1fr 1fr" : "repeat(2, 1fr)",
          gap: 16,
        }}
      >
        {colunas.map((col) => {
          const itens = lista.filter((a) => a.periodo === col.periodo);
          return (
            <section
              key={col.periodo}
              style={{ background: "#fffdf8", border: "1px solid #e4d9c8", borderRadius: 16, padding: 16 }}
            >
              <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 4px" }}>{col.titulo}</h3>
              <p style={{ margin: "0 0 12px", fontSize: 13, opacity: 0.7 }}>{col.sub}</p>
              {itens.map((a) => (
                <div key={a.id} style={{ borderTop: "1px solid #f0e8da", padding: "10px 0" }}>
                  <form action={alterarAtividadePlanejamento} style={{ display: "grid", gap: 6 }}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="ano" value={ano} />
                    <input type="hidden" name="escala" value={meta.escala} />
                    <input type="hidden" name="periodo" value={col.periodo} />
                    <input name="titulo" defaultValue={a.titulo} required style={{ padding: 6 }} />
                    <input name="detalhe" defaultValue={a.detalhe ?? ""} placeholder="Detalhe (opcional)" style={{ padding: 6 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="submit" style={{ background: "#1f6b45", color: "white", border: 0, borderRadius: 6, padding: "4px 10px" }}>
                        Alterar
                      </button>
                    </div>
                  </form>
                  <form action={excluirAtividadePlanejamento} style={{ marginTop: 4 }}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" style={{ color: "#8a1c1c", border: 0, background: "transparent" }}>
                      excluir
                    </button>
                  </form>
                </div>
              ))}
              <LancarModal
                titulo={`Nova atividade · ${col.titulo}`}
                botao="+ Adicionar atividade"
                compact
                dica="Depois de adicionar, a aba continua aberta para a proxima."
              >
                <form action={criarAtividadePlanejamento} style={{ display: "grid", gap: 12 }}>
                  <input type="hidden" name="ano" value={ano} />
                  <input type="hidden" name="escala" value={meta.escala} />
                  <input type="hidden" name="periodo" value={col.periodo} />
                  <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: "#4a1c6b" }}>
                    Atividade
                    <input name="titulo" required style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e4d9c8", fontWeight: 400 }} />
                  </label>
                  <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: "#4a1c6b" }}>
                    Detalhe no terreno (opcional)
                    <input name="detalhe" style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e4d9c8", fontWeight: 400 }} />
                  </label>
                  <button type="submit" style={{ background: "#4a1c6b", color: "white", border: 0, borderRadius: 8, padding: "10px 16px", fontWeight: 600 }}>
                    Adicionar
                  </button>
                </form>
              </LancarModal>
            </section>
          );
        })}
      </div>
    </div>
  );
}
