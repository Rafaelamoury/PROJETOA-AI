"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(63, 24, 76, 0.45)",
  display: "grid",
  placeItems: "center",
  zIndex: 80,
  padding: 16,
};

const panel: CSSProperties = {
  width: "min(560px, 100%)",
  maxHeight: "90vh",
  overflow: "auto",
  background: "var(--card)",
  borderRadius: 24,
  padding: 24,
  boxShadow: "var(--shadow)",
};

export const campo: CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: "var(--purple)",
};

export const inputCampo: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "none",
  fontWeight: 400,
  color: "var(--ink)",
  fontSize: 15,
  background: "var(--card)",
  boxShadow: "none",
};

export function LancarModal({
  titulo,
  botao,
  dica,
  compact,
  children,
}: {
  titulo: string;
  botao: string;
  dica?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        style={{
          padding: compact ? "8px 12px" : "10px 16px",
          fontWeight: 600,
          color: "var(--purple)",
        }}
      >
        {botao}
      </button>
      {aberto && (
        <div style={overlay} onClick={() => setAberto(false)}>
          <div style={panel} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <h3 style={{ fontFamily: "Georgia, serif", margin: 0, fontSize: 22 }}>{titulo}</h3>
                {dica && <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.7 }}>{dica}</p>}
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="neo-secundario"
                style={{ fontSize: 22, lineHeight: 1, padding: "4px 10px" }}
              >
                ×
              </button>
            </div>
            {children}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="neo-secundario"
                style={{
                  padding: "8px 14px",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const botaoAdicionar: CSSProperties = {
  color: "var(--purple)",
  padding: "10px 16px",
  fontWeight: 600,
  marginTop: 8,
};
