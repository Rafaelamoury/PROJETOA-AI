"use client";

import { useRouter } from "next/navigation";
import { MESES } from "@/lib/api";
import { campo, inputCampo } from "@/components/LancarModal";

export function FiltroMesAno({ ano, mes, anos }: { ano: number; mes: number; anos: number[] }) {
  const router = useRouter();

  function ir(proximoAno: number, proximoMes: number) {
    router.push(`/producao?ano=${proximoAno}&mes=${proximoMes}`);
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "4px 0 20px" }}>
      <label style={campo}>
        Ano
        <select
          value={ano}
          onChange={(e) => ir(Number(e.target.value), mes)}
          style={{ ...inputCampo, minWidth: 120 }}
        >
          {anos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>
      <label style={campo}>
        Mês
        <select
          value={mes}
          onChange={(e) => ir(ano, Number(e.target.value))}
          style={{ ...inputCampo, minWidth: 180 }}
        >
          {MESES.map((nome, i) => (
            <option key={nome} value={i + 1}>
              {nome}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
