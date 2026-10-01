"use client";

import { useState, type FormEvent } from "react";
import { salvarProducao } from "@/app/actions";
import { MESES, brl, hojeLocal } from "@/lib/api";
import { botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

function inicio() {
  const [ano, mes, dia] = hojeLocal().split("-").map(Number);
  return { ano, mes, dia };
}

function diasDoMes(ano: number, mes: number) {
  return new Date(ano, mes, 0).getDate();
}

export function FormProducao({
  inicial,
}: {
  inicial?: {
    id: number;
    ano: number;
    mes: number;
    dia: number;
    quantidadeLatas: number;
    valorLata: number;
    custoPorLata: number;
  };
}) {
  const [quando, setQuando] = useState(() =>
    inicial ? { ano: inicial.ano, mes: inicial.mes, dia: inicial.dia } : inicio(),
  );
  const [latas, setLatas] = useState(inicial ? String(inicial.quantidadeLatas) : "");
  const [custoPorLata, setCustoPorLata] = useState(inicial ? String(inicial.custoPorLata) : "");
  const totalGasto = Math.round((Number(latas) || 0) * (Number(custoPorLata) || 0) * 100) / 100;
  const totalDias = diasDoMes(quando.ano, quando.mes);
  const dia = Math.min(quando.dia, totalDias);
  const data = `${quando.ano}-${String(quando.mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  function mudar(parcial: Partial<typeof quando>) {
    setQuando((atual) => {
      const proximo = { ...atual, ...parcial };
      const max = diasDoMes(proximo.ano, proximo.mes);
      if (proximo.dia > max) proximo.dia = max;
      return proximo;
    });
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    await salvarProducao(new FormData(form));
    setLatas("");
    setCustoPorLata("");
    const valor = form.elements.namedItem("valorLata");
    if (valor instanceof HTMLInputElement) valor.value = "";
  }

  return (
    <form onSubmit={enviar} style={{ display: "grid", gap: 12 }}>
      <input type="hidden" name="data" value={data} />
      {inicial ? <input type="hidden" name="id" value={inicial.id} /> : null}
      <label style={campo}>
        Ano
        <input
          type="number"
          value={quando.ano}
          min={2000}
          max={2100}
          required
          onChange={(e) => mudar({ ano: Number(e.target.value) })}
          style={inputCampo}
        />
      </label>
      <label style={campo}>
        Mês
        <select value={quando.mes} required onChange={(e) => mudar({ mes: Number(e.target.value) })} style={inputCampo}>
          {MESES.map((nome, i) => (
            <option key={nome} value={i + 1}>
              {nome}
            </option>
          ))}
        </select>
      </label>
      <label style={campo}>
        Dia
        <select value={dia} required onChange={(e) => mudar({ dia: Number(e.target.value) })} style={inputCampo}>
          {Array.from({ length: totalDias }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {String(d).padStart(2, "0")}
            </option>
          ))}
        </select>
      </label>
      <label style={campo}>
        Quantidade de latas
        <input
          type="number"
          step="0.01"
          min={0}
          name="quantidadeLatas"
          value={latas}
          required
          onChange={(e) => setLatas(e.target.value)}
          style={inputCampo}
        />
      </label>
      <label style={campo}>
        Valor da lata
        <input type="number" step="0.01" min={0} name="valorLata" defaultValue={inicial?.valorLata} required style={inputCampo} />
      </label>
      <label style={campo}>
        Custo por lata
        <input
          type="number"
          step="0.01"
          min={0}
          name="custoPorLata"
          value={custoPorLata}
          required
          onChange={(e) => setCustoPorLata(e.target.value)}
          style={inputCampo}
        />
      </label>
      <p style={{ margin: 0, color: "#5c4a32" }}>Total gasto: {brl(totalGasto)}</p>
      <button type="submit" style={botaoAdicionar}>
        {inicial ? "Salvar" : "Adicionar"}
      </button>
    </form>
  );
}
