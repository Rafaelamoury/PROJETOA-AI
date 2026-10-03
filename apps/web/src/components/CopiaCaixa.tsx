"use client";

import type { Lancamento } from "@/lib/types";

export function CopiaCaixa({ linhas }: { linhas: Lancamento[] }) {
  function baixar() {
    const cabecalho = "Data;Tipo;Descricao;Valor";
    const corpo = linhas
      .map((l) => [l.data, l.tipo, `"${l.descricao.replaceAll('"', '""')}"`, String(l.valor).replace(".", ",")] .join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + cabecalho + "\n" + corpo], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "caixa-rr-acai.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <button type="button" onClick={baixar} style={{ padding: "10px 14px" }}>
      Baixar cópia
    </button>
  );
}
