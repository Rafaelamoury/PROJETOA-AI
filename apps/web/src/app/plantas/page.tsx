import type { Plantas } from "@/lib/types";
import { salvarPlantas } from "@/app/actions";
import { apiGet } from "@/lib/server-api";

export default async function PlantasPage() {
  const p = await apiGet<Plantas>("/plantas");
  return (
    <div>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32 }}>Acai pequeno, medio e grande</h2>
      <p>Quantidade de plantas no campo por tamanho, e quantas ja produzem (total unico).</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          ["Pequeno", p.quantidadePequeno],
          ["Medio", p.quantidadeMedio],
          ["Grande", p.quantidadeGrande],
          ["Total P/M/G", p.total],
          ["Ja produzem", p.quantidadeJaProduzem],
        ].map(([l, n]) => (
          <div key={String(l)} style={{ background: "#fffdf8", border: "1px solid #e4d9c8", borderRadius: 16, padding: 16 }}>
            <p style={{ margin: 0, opacity: 0.7 }}>{l}</p>
            <strong style={{ fontSize: 28 }}>{n}</strong>
          </div>
        ))}
      </div>
      <form action={salvarPlantas} style={{ display: "flex", gap: 16, alignItems: "end", flexWrap: "wrap" }}>
        <label>
          Pequeno
          <br />
          <input type="number" min={0} name="quantidadePequeno" defaultValue={p.quantidadePequeno} />
        </label>
        <label>
          Medio
          <br />
          <input type="number" min={0} name="quantidadeMedio" defaultValue={p.quantidadeMedio} />
        </label>
        <label>
          Grande
          <br />
          <input type="number" min={0} name="quantidadeGrande" defaultValue={p.quantidadeGrande} />
        </label>
        <label>
          Ja produzem
          <br />
          <input type="number" min={0} name="quantidadeJaProduzem" defaultValue={p.quantidadeJaProduzem} />
        </label>
        <button type="submit" style={{ background: "#1f6b45", color: "white", border: 0, borderRadius: 8, padding: "10px 16px" }}>
          Atualizar quantidades
        </button>
      </form>
    </div>
  );
}
