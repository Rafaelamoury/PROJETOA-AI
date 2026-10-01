"use client";

import { useState } from "react";
import { salvarProducao } from "@/app/actions";
import { MESES, hojeLocal } from "@/lib/api";
import { botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

function inicio() {
  const [ano, mes, dia] = hojeLocal().split("-").map(Number);
  return { ano, mes, dia };
}

function diasDoMes(ano: number, mes: number) {
  return new Date(ano, mes, 0).getDate();
}

export function FormProducao() {
  const [quando, setQuando] = useState(inicio);
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

  return (
    <form action={salvarProducao} style={{ display: "grid", gap: 12 }}>
      <input type="hidden" name="data" value={data} />
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
        <input type="number" step="0.01" name="quantidadeLatas" required style={inputCampo} />
      </label>
      <label style={campo}>
        Valor da lata
        <input type="number" step="0.01" name="valorLata" required style={inputCampo} />
      </label>
      <label style={campo}>
        Custo total para tirar o acai
        <input type="number" step="0.01" name="custosExtracao" required style={inputCampo} />
      </label>
      <button type="submit" style={botaoAdicionar}>
        Adicionar
      </button>
    </form>
  );
}
