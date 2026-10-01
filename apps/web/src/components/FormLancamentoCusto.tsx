"use client";

import { useState, type FormEvent } from "react";
import { criarLancamento } from "@/app/actions";
import { brl, hojeLocal, unidadeDe } from "@/lib/api";
import type { Produto, Servico } from "@/lib/types";
import { botaoAdicionar, campo, inputCampo } from "@/components/LancarModal";

type Pessoa = { nome: string; valor: string };

export function FormLancamentoCusto({ servicos, produtos }: { servicos: Servico[]; produtos: Produto[] }) {
  const [tipo, setTipo] = useState("CustoOperacional");
  const [servicoId, setServicoId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [dias, setDias] = useState("1");
  const [pessoas, setPessoas] = useState<Pessoa[]>([{ nome: "", valor: "" }]);
  const mao = tipo === "MaoObra";
  const produto = produtos.find((p) => String(p.id) === produtoId);
  const unidade = produto ? unidadeDe(produto.unidade) : null;
  const qtdNum = Math.max(0, Number(quantidade) || 0);
  const totalProduto = produto ? Math.round(qtdNum * produto.valor * 100) / 100 : 0;
  const diasNum = Math.max(0, Number(dias) || 0);
  const somaDia = pessoas.reduce((s, p) => s + (Number(p.valor) || 0), 0);
  const total = Math.round(somaDia * (diasNum || 0) * 100) / 100;

  function valorDoServico(id: string) {
    return servicos.find((s) => String(s.id) === id)?.valor;
  }

  function escolherServico(id: string) {
    setServicoId(id);
    const sugerido = valorDoServico(id);
    if (sugerido == null) return;
    setPessoas((atual) => atual.map((p) => (p.valor === "" ? { ...p, valor: String(sugerido) } : p)));
  }

  function ajustarQuantidade(quantidade: number) {
    const n = Math.min(30, Math.max(1, quantidade || 1));
    const sugerido = valorDoServico(servicoId);
    setPessoas((atual) => {
      const next = atual.slice(0, n);
      while (next.length < n) next.push({ nome: "", valor: sugerido != null ? String(sugerido) : "" });
      return next;
    });
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = new FormData(form);
    if (mao) {
      dados.set(
        "pessoas",
        JSON.stringify(pessoas.map((p) => ({ nome: p.nome.trim(), valor: Number(p.valor) }))),
      );
      dados.set("diasAtividade", String(diasNum));
      dados.set("valor", String(total));
      dados.delete("produtoId");
      dados.delete("quantidade");
      const descricao = String(dados.get("descricao") || "").trim();
      if (!descricao) dados.set("descricao", pessoas.map((p) => p.nome.trim()).filter(Boolean).join(", "));
    } else if (produto) {
      dados.set("produtoId", String(produto.id));
      dados.set("quantidade", String(qtdNum));
      dados.set("valor", String(totalProduto));
      const descricao = String(dados.get("descricao") || "").trim();
      if (!descricao) dados.set("descricao", `${produto.nome}: ${qtdNum} ${unidade?.curto ?? ""}`.trim());
    }
    await criarLancamento(dados);
    if (mao) {
      const sugerido = valorDoServico(servicoId);
      setPessoas([{ nome: "", valor: sugerido != null ? String(sugerido) : "" }]);
      setDias("1");
    }
    if (produto) setQuantidade("");
    const valor = form.elements.namedItem("valor");
    if (valor instanceof HTMLInputElement) valor.value = "";
    const descricao = form.elements.namedItem("descricao");
    if (descricao instanceof HTMLInputElement) descricao.value = "";
  }

  return (
    <form onSubmit={enviar} style={{ display: "grid", gap: 12 }}>
      <input type="hidden" name="tipo" value={tipo} />
      <label style={campo}>
        Data
        <input type="date" name="data" defaultValue={hojeLocal()} required style={inputCampo} />
      </label>
      <label style={campo}>
        Tipo
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputCampo}>
          <option value="CustoOperacional">Custo operacional</option>
          <option value="MaoObra">Mão de obra</option>
        </select>
      </label>
      {mao ? (
        <>
          <label style={campo}>
            Serviço
            <select name="servicoMaoObraId" value={servicoId} onChange={(e) => escolherServico(e.target.value)} style={inputCampo}>
              <option value="">Nenhum</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {brl(s.valor)} por pessoa/dia
                </option>
              ))}
            </select>
          </label>
          <label style={campo}>
            Quantos dias a atividade levou
            <input
              type="number"
              min={1}
              max={366}
              value={dias}
              required
              onChange={(e) => setDias(e.target.value)}
              style={inputCampo}
            />
          </label>
          <label style={campo}>
            Quantas pessoas fizeram
            <input
              type="number"
              min={1}
              max={30}
              value={pessoas.length}
              required
              onChange={(e) => ajustarQuantidade(Number(e.target.value))}
              style={inputCampo}
            />
          </label>
          {pessoas.map((pessoa, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 8 }}>
              <label style={campo}>
                {pessoas.length > 1 ? `Quem fez (${i + 1})` : "Quem fez o serviço"}
                <input
                  value={pessoa.nome}
                  required
                  maxLength={80}
                  onChange={(e) =>
                    setPessoas((atual) => atual.map((p, idx) => (idx === i ? { ...p, nome: e.target.value } : p)))
                  }
                  style={inputCampo}
                />
              </label>
              <label style={campo}>
                Valor por pessoa/dia
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={pessoa.valor}
                  required
                  onChange={(e) =>
                    setPessoas((atual) => atual.map((p, idx) => (idx === i ? { ...p, valor: e.target.value } : p)))
                  }
                  style={inputCampo}
                />
              </label>
            </div>
          ))}
          <p style={{ margin: 0, color: "#5c4a32" }}>
            {pessoas.length > 1
              ? "Cada pessoa tem o próprio valor. "
              : "Com mais de uma pessoa, o valor é informado para cada uma. "}
            Total que sai do caixa: <strong>{brl(total)}</strong>
            {diasNum > 0 ? ` (${brl(somaDia)} por dia × ${diasNum} ${diasNum === 1 ? "dia" : "dias"})` : ""}
          </p>
          <label style={campo}>
            Observação
            <input name="descricao" placeholder="Opcional" style={inputCampo} />
          </label>
        </>
      ) : (
        <>
          <label style={campo}>
            Produto cadastrado
            <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)} style={inputCampo}>
              <option value="">Nenhum — gasto avulso</option>
              {produtos.map((p) => {
                const u = unidadeDe(p.unidade);
                return (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {brl(p.valor)} {u.por}
                  </option>
                );
              })}
            </select>
          </label>
          {produto && unidade ? (
            <>
              <label style={campo}>
                Quantidade ({unidade.nome.toLowerCase()})
                <input
                  type="number"
                  step="0.01"
                  min={0.01}
                  value={quantidade}
                  required
                  onChange={(e) => setQuantidade(e.target.value)}
                  style={inputCampo}
                />
              </label>
              <p style={{ margin: 0, color: "#5c4a32" }}>
                {brl(produto.valor)} {unidade.por}
                {qtdNum > 0 ? ` × ${qtdNum.toLocaleString("pt-BR")} ${unidade.curto}` : ""}. Total que sai do caixa:{" "}
                <strong>{brl(totalProduto)}</strong>
              </p>
              <label style={campo}>
                Observação
                <input name="descricao" placeholder="Opcional" style={inputCampo} />
              </label>
            </>
          ) : (
            <>
              <label style={campo}>
                Valor
                <input type="number" step="0.01" min={0} name="valor" required style={inputCampo} />
              </label>
              <label style={campo}>
                Descrição
                <input name="descricao" required style={inputCampo} />
              </label>
            </>
          )}
        </>
      )}
      <button type="submit" style={botaoAdicionar}>
        Adicionar
      </button>
    </form>
  );
}
