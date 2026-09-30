"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

const overlay: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(28, 20, 36, 0.45)",
  display: "grid",
  placeItems: "center",
  zIndex: 80,
  padding: 16,
};

const panel: CSSProperties = {
  width: "min(560px, 100%)",
  maxHeight: "90vh",
  overflow: "auto",
  background: "#fff",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
};

export const campo: CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: "#4a1c6b",
};

export const inputCampo: CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #e4d9c8",
  fontWeight: 400,
  color: "#1c1424",
  fontSize: 15,
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
          background: "#4a1c6b",
          color: "white",
          border: 0,
          borderRadius: 10,
          padding: compact ? "8px 12px" : "10px 16px",
          fontWeight: 600,
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
                style={{ border: 0, background: "transparent", fontSize: 22, lineHeight: 1, cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            {children}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setAberto(false)}
                style={{
                  background: "transparent",
                  border: "1px solid #e4d9c8",
                  borderRadius: 8,
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
  background: "#4a1c6b",
  color: "white",
  border: 0,
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 600,
  marginTop: 8,
};
