"use client";

import { useState, type FormEvent } from "react";
import { salvarCasa } from "@/app/actions";
import { MESES, hojeLocal } from "@/lib/api";
import { botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

function inicio() {
  const [ano, mes, dia] = hojeLocal().split("-").map(Number);
  return { ano, mes, dia };
}

function diasDoMes(ano: number, mes: number) {
  return new Date(ano, mes, 0).getDate();
}

export function FormCasa({
  inicial,
  padrao,
  nomes,
}: {
  inicial?: {
    id: number;
    ano: number;
    mes: number;
    dia: number;
    quantidade: number;
    quemTirou: string;
  };
  padrao?: { ano: number; mes: number; dia: number };
  nomes?: string[];
}) {
  const [quando, setQuando] = useState(() =>
    inicial ? { ano: inicial.ano, mes: inicial.mes, dia: inicial.dia } : padrao ?? inicio(),
  );
  const [quantidade, setQuantidade] = useState(inicial ? String(inicial.quantidade) : "");
  const [quem, setQuem] = useState(inicial?.quemTirou ?? "");
  const totalDias = diasDoMes(quando.ano, quando.mes);
  const dia = Math.min(quando.dia, totalDias);
  const data = `${quando.ano}-${String(quando.mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  const listaId = `quem-casa-${inicial?.id ?? "novo"}`;

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
    await salvarCasa(new FormData(form));
    if (!inicial) {
      setQuantidade("");
      setQuem("");
    }
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
          min={0.01}
          name="quantidade"
          value={quantidade}
          required
          onChange={(e) => setQuantidade(e.target.value)}
          style={inputCampo}
        />
      </label>
      <label style={campo}>
        Quem tirou
        <input
          name="quemTirou"
          list={listaId}
          value={quem}
          required
          maxLength={80}
          placeholder="Nome de quem levou para casa"
          onChange={(e) => setQuem(e.target.value)}
          style={inputCampo}
        />
        <datalist id={listaId}>
          {(nomes ?? []).map((nome) => (
            <option key={nome} value={nome} />
          ))}
        </datalist>
      </label>
      <button type="submit" style={botaoAdicionar}>
        {inicial ? "Salvar" : "Adicionar"}
      </button>
    </form>
  );
}
