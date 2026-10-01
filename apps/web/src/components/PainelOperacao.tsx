"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { brl } from "@/lib/api";
import type { MesOperacao, Painel } from "@/lib/types";

const card: CSSProperties = {
  background: "#fffdf8",
  border: "1px solid #e4d9c8",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 10px 30px rgba(74,28,107,0.06)",
};

const COR_RECEITA = "#1f6b45";
const COR_CUSTO = "#c45c26";
const COR_LUCRO = "#4a1c6b";
const COR_LATAS = "#2a6f97";
const COR_EXTRACAO = "#c45c26";
const COR_CAMPO = "#c9a227";
const COR_MAO = "#6b3d8f";

export function PainelOperacao({ data, frase }: { data: Painel; frase: string }) {
  const router = useRouter();
  const { destacado: d, anoResumo: ano, meses } = data;

  function ir(anoNum: number, mesNum: number) {
    router.push(`/?ano=${anoNum}&mes=${mesNum}`);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p style={{ letterSpacing: "0.14em", fontSize: 12, color: "#4a1c6b", margin: 0 }}>RR AÇAÍ</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 36, margin: "6px 0 8px" }}>Producao, custos e lucro</h2>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 20, color: "#4a1c6b", margin: "0 0 10px", maxWidth: 640 }}>{frase}</p>
          <p style={{ margin: 0, maxWidth: 640, opacity: 0.8 }}>
            Visao do que o produtor acompanha na safra: latas tiradas, receita, custo para tirar, gastos do campo, mao
            de obra e o que sobrou no mes. Escolha o mes no grafico ou nas abas.
          </p>
        </div>
        <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: "#4a1c6b" }}>
          Ano
          <select
            value={data.ano}
            onChange={(e) => ir(Number(e.target.value), data.mes)}
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e4d9c8", fontSize: 15, minWidth: 120 }}
          >
            {data.anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "20px 0 24px" }}>
        {meses.map((m) => {
          const ativo = m.mes === data.mes;
          return (
            <button
              key={m.mes}
              type="button"
              onClick={() => ir(data.ano, m.mes)}
              style={{
                border: ativo ? "0" : "1px solid #e4d9c8",
                background: ativo ? "#4a1c6b" : "#fff",
                color: ativo ? "#fff" : "#1c1424",
                borderRadius: 999,
                padding: "8px 12px",
                fontSize: 13,
                fontWeight: ativo ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {m.nome}
            </button>
          );
        })}
      </div>

      <ComparacaoAcai mes={d} ano={data.ano} />

      <p style={{ margin: "24px 0 10px", fontSize: 13, opacity: 0.7 }}>
        Operacao completa de {d.nome} · inclui campo e mao de obra · o ano soma {brl(ano.lucro)} de resultado
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Kpi
          titulo="Producao"
          valor={brl(d.receita)}
          detalhe={d.latas > 0 ? `${d.latas} latas · ${brl(d.receita / Math.max(d.latas, 1))} / lata` : "Sem extracao neste mes"}
          cor="#1f6b45"
        />
        <Kpi
          titulo="Custos da operacao"
          valor={brl(d.custos)}
          detalhe={
            d.custoPorLata != null
              ? `Custo/lata ${brl(d.custoPorLata)} · tirar ${brl(d.custoExtracao)} · campo ${brl(d.custosCampo)} · mao de obra ${brl(d.maoObra)}`
              : `Tirar ${brl(d.custoExtracao)} · campo ${brl(d.custosCampo)} · mao de obra ${brl(d.maoObra)}`
          }
          cor="#c45c26"
        />
        <Kpi
          titulo="Lucro da operacao"
          valor={brl(d.lucro)}
          detalhe={d.margemPercentual != null ? `Margem ${d.margemPercentual.toLocaleString("pt-BR")}% da receita` : "Sem receita neste mes"}
          cor={d.lucro >= 0 ? "#4a1c6b" : "#8a1c1c"}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 16, marginTop: 20 }}>
        <div style={card}>
          <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 4px" }}>Receita, custos e lucro no ano</h3>
          <p style={{ margin: "0 0 12px", fontSize: 13, opacity: 0.7 }}>Clique na coluna do mes para detalhar.</p>
          <GraficoTriplo meses={meses} mesAtivo={data.mes} onMes={(mes) => ir(data.ano, mes)} />
          <Legenda
            itens={[
              [COR_RECEITA, "Receita (latas x valor)"],
              [COR_CUSTO, "Custos"],
              [COR_LUCRO, "Lucro"],
            ]}
          />
        </div>
        <div style={card}>
          <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 4px" }}>De onde veio o custo</h3>
          <p style={{ margin: "0 0 12px", fontSize: 13, opacity: 0.7 }}>{d.nome}: o que o sitio gasta para operar.</p>
          <BarrasEmpilhadas mes={d} />
          <Legenda
            itens={[
              [COR_EXTRACAO, "Tirar o acai"],
              [COR_CAMPO, "Campo / operacional"],
              [COR_MAO, "Mao de obra"],
            ]}
          />
        </div>
      </div>

      <div style={{ ...card, marginTop: 16 }}>
        <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 4px" }}>Latas por mes</h3>
        <p style={{ margin: "0 0 12px", fontSize: 13, opacity: 0.7 }}>Volume da safra — pico e entressafra no mesmo grafico.</p>
        <GraficoLatas meses={meses} mesAtivo={data.mes} onMes={(mes) => ir(data.ano, mes)} />
      </div>
    </div>
  );
}

function ComparacaoAcai({ mes, ano }: { mes: MesOperacao; ano: number }) {
  const liquido = mes.receita - mes.custoExtracao;
  const margem = mes.receita > 0 ? (liquido / mes.receita) * 100 : null;
  const max = Math.max(mes.receita, mes.custoExtracao, Math.abs(liquido), 1);

  return (
    <div style={{ ...card, marginBottom: 4 }}>
      <p style={{ letterSpacing: "0.12em", fontSize: 11, color: "#1f6b45", margin: 0 }}>SO DO ACAI DESTE MES</p>
      <h3 style={{ fontFamily: "Georgia, serif", margin: "4px 0 6px", fontSize: 22 }}>
        {mes.nome} de {ano}: latas, custo para tirar e liquido
      </h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, opacity: 0.75, maxWidth: 720 }}>
        Comparacao so da extracao. Nao entra servico, custo de campo nem mao de obra — isso fica na operacao abaixo.
      </p>
      {mes.latas <= 0 && mes.receita <= 0 ? (
        <p style={{ margin: 0, opacity: 0.7 }}>Ainda nao ha producao lancada neste mes.</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
            <Kpi
              titulo="Acai tirado"
              valor={brl(mes.receita)}
              detalhe={`${mes.latas} latas · ${brl(mes.receita / Math.max(mes.latas, 1))} / lata`}
              cor={COR_RECEITA}
              solto
            />
            <Kpi
              titulo="Custo para tirar"
              valor={brl(mes.custoExtracao)}
              detalhe={mes.latas > 0 ? `${brl(mes.custoExtracao / mes.latas)} por lata` : "Sem latas"}
              cor={COR_EXTRACAO}
              solto
            />
            <Kpi
              titulo="Liquido do acai"
              valor={brl(liquido)}
              detalhe={margem != null ? `Sobra ${margem.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% depois de tirar` : "Sem receita"}
              cor={liquido >= 0 ? COR_LUCRO : "#8a1c1c"}
              solto
            />
          </div>
          <svg viewBox="0 0 640 72" width="100%" role="img" aria-label="Comparacao acai receita, custo para tirar e liquido">
            {[
              { nome: "Acai tirado", valor: mes.receita, cor: COR_RECEITA },
              { nome: "Custo para tirar", valor: mes.custoExtracao, cor: COR_EXTRACAO },
              { nome: "Liquido", valor: liquido, cor: liquido >= 0 ? COR_LUCRO : "#8a1c1c" },
            ].map((item, i) => {
              const y = 8 + i * 22;
              const w = Math.max(2, (Math.abs(item.valor) / max) * 430);
              return (
                <g key={item.nome}>
                  <text x="0" y={y + 11} fontSize="12" fill="#4a3a32">
                    {item.nome}
                  </text>
                  <rect x="140" y={y} width={w} height="14" rx="3" fill={item.cor} />
                  <text x={148 + w} y={y + 11} fontSize="12" fill="#1c1424" fontWeight="600">
                    {brl(item.valor)}
                  </text>
                </g>
              );
            })}
          </svg>
        </>
      )}
    </div>
  );
}

function Kpi({
  titulo,
  valor,
  detalhe,
  cor,
  solto,
}: {
  titulo: string;
  valor: string;
  detalhe: string;
  cor: string;
  solto?: boolean;
}) {
  return (
    <div style={solto ? { padding: "4px 0" } : card}>
      <p style={{ margin: 0, opacity: 0.7 }}>{titulo}</p>
      <strong style={{ fontSize: 28, color: cor }}>{valor}</strong>
      <p style={{ margin: "8px 0 0", fontSize: 13 }}>{detalhe}</p>
    </div>
  );
}

function Legenda({ itens }: { itens: [string, string][] }) {
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12, fontSize: 12 }}>
      {itens.map(([cor, nome]) => (
        <span key={nome} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: cor }} />
          {nome}
        </span>
      ))}
    </div>
  );
}

function GraficoTriplo({
  meses,
  mesAtivo,
  onMes,
}: {
  meses: MesOperacao[];
  mesAtivo: number;
  onMes: (mes: number) => void;
}) {
  const w = 640;
  const h = 220;
  const padL = 8;
  const padR = 8;
  const padT = 12;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const max = Math.max(1, ...meses.flatMap((m) => [m.receita, m.custos, Math.abs(m.lucro)]));
  const groupW = innerW / 12;
  const barW = groupW / 4.2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Receita, custos e lucro por mes">
      <line x1={padL} y1={padT + innerH} x2={w - padR} y2={padT + innerH} stroke="#eadfce" />
      {meses.map((m, i) => {
        const gx = padL + i * groupW + groupW * 0.18;
        const ativo = m.mes === mesAtivo;
        const yReceita = padT + innerH - (m.receita / max) * innerH;
        const yCusto = padT + innerH - (m.custos / max) * innerH;
        const hLucro = (Math.abs(m.lucro) / max) * innerH;
        const yLucro = m.lucro >= 0 ? padT + innerH - hLucro : padT + innerH;
        return (
          <g key={m.mes} style={{ cursor: "pointer" }} onClick={() => onMes(m.mes)}>
            {ativo && <rect x={padL + i * groupW} y={0} width={groupW} height={h} fill="rgba(74,28,107,0.06)" rx={6} />}
            <rect x={gx} y={yReceita} width={barW} height={(m.receita / max) * innerH} fill={COR_RECEITA} rx={2} />
            <rect x={gx + barW + 2} y={yCusto} width={barW} height={(m.custos / max) * innerH} fill={COR_CUSTO} rx={2} />
            <rect x={gx + (barW + 2) * 2} y={yLucro} width={barW} height={hLucro} fill={m.lucro >= 0 ? COR_LUCRO : "#8a1c1c"} rx={2} />
            <text x={padL + i * groupW + groupW / 2} y={h - 8} textAnchor="middle" fontSize="10" fill={ativo ? "#4a1c6b" : "#7a6a5a"} fontWeight={ativo ? 700 : 400}>
              {m.nome.slice(0, 3)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function GraficoLatas({
  meses,
  mesAtivo,
  onMes,
}: {
  meses: MesOperacao[];
  mesAtivo: number;
  onMes: (mes: number) => void;
}) {
  const w = 980;
  const h = 160;
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const max = Math.max(1, ...meses.map((m) => m.latas));
  const groupW = innerW / 12;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Latas por mes">
      <line x1={padL} y1={padT + innerH} x2={w - padR} y2={padT + innerH} stroke="#eadfce" />
      {meses.map((m, i) => {
        const barW = groupW * 0.55;
        const x = padL + i * groupW + (groupW - barW) / 2;
        const bh = (m.latas / max) * innerH;
        const y = padT + innerH - bh;
        const ativo = m.mes === mesAtivo;
        return (
          <g key={m.mes} style={{ cursor: "pointer" }} onClick={() => onMes(m.mes)}>
            <rect x={x} y={y} width={barW} height={bh} fill={ativo ? COR_LATAS : "#8fb7cc"} rx={4} />
            {m.latas > 0 && (
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#2a6f97">
                {m.latas}
              </text>
            )}
            <text x={padL + i * groupW + groupW / 2} y={h - 8} textAnchor="middle" fontSize="10" fill={ativo ? "#4a1c6b" : "#7a6a5a"} fontWeight={ativo ? 700 : 400}>
              {m.nome.slice(0, 3)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function BarrasEmpilhadas({ mes }: { mes: MesOperacao }) {
  const total = mes.custos;
  const partes = [
    { cor: COR_EXTRACAO, valor: mes.custoExtracao, nome: "Tirar o acai" },
    { cor: COR_CAMPO, valor: mes.custosCampo, nome: "Campo" },
    { cor: COR_MAO, valor: mes.maoObra, nome: "Mao de obra" },
  ];
  if (total <= 0) {
    return <p style={{ margin: "24px 0", opacity: 0.7 }}>Nenhum custo neste mes.</p>;
  }
  return (
    <div>
      <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
        {partes.map((p) => (
          <div key={p.nome} style={{ width: `${(p.valor / total) * 100}%`, background: p.cor, minWidth: p.valor > 0 ? 4 : 0 }} title={`${p.nome}: ${brl(p.valor)}`} />
        ))}
      </div>
      {partes.map((p) => (
        <div key={p.nome} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f0e8da" }}>
          <span>{p.nome}</span>
          <strong>{brl(p.valor)}</strong>
        </div>
      ))}
    </div>
  );
}
