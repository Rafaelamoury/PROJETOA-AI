"use server";

import { apiBase } from "@/lib/api-base";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API = apiBase();

async function authHeaders(): Promise<Record<string, string>> {
  const token = (await cookies()).get("acai_token")?.value;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function post(path: string, method: string, body?: unknown) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: await authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) redirect("/login");
  if (!res.ok && res.status !== 204) {
    let msg = "Falha ao salvar na API";
    try {
      const j = await res.json();
      msg = j.erro ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
}

export async function entrar(formData: FormData) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cpf: String(formData.get("cpf") ?? ""),
      senha: String(formData.get("senha") ?? ""),
    }),
  });
  if (!res.ok) {
    redirect("/login?erro=CPF+ou+senha+invalidos");
  }
  const data = (await res.json()) as { token: string };
  (await cookies()).set("acai_token", data.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/");
}

export async function sair() {
  (await cookies()).delete("acai_token");
  redirect("/login");
}

export async function criarUsuario(formData: FormData) {
  await post("/usuarios", "POST", {
    nome: String(formData.get("nome")),
    cpf: String(formData.get("cpf")),
    senha: String(formData.get("senha")),
    isAdmin: formData.get("isAdmin") === "true",
  });
  revalidatePath("/usuarios");
}

export async function alterarAdmin(formData: FormData) {
  await post(`/usuarios/${formData.get("id")}/admin`, "PUT", {
    isAdmin: formData.get("isAdmin") === "true",
  });
  revalidatePath("/usuarios");
}

export async function atualizarSaldo(formData: FormData) {
  await post("/caixa/saldo-inicial", "PUT", { saldoInicial: Number(formData.get("saldoInicial")) });
  revalidatePath("/caixa");
  revalidatePath("/custos");
  revalidatePath("/");
}

export async function criarLancamento(formData: FormData) {
  const tipo = String(formData.get("tipo"));
  const servico = String(formData.get("servicoMaoObraId") || "");
  const pessoasBruto = String(formData.get("pessoas") || "");
  const dias = String(formData.get("diasAtividade") || "");
  await post("/lancamentos", "POST", {
    data: String(formData.get("data")),
    tipo,
    descricao: String(formData.get("descricao") || ""),
    valor: Number(formData.get("valor")),
    servicoMaoObraId: servico ? Number(servico) : null,
    diasAtividade: dias ? Number(dias) : null,
    pessoas: pessoasBruto ? JSON.parse(pessoasBruto) : null,
    produtoId: formData.get("produtoId") ? Number(formData.get("produtoId")) : null,
    quantidade: formData.get("quantidade") ? Number(formData.get("quantidade")) : null,
    valorUnitario: formData.get("valorUnitario") ? Number(formData.get("valorUnitario")) : null,
  });
  revalidatePath("/caixa");
  revalidatePath("/custos");
  revalidatePath("/mao-obra");
  revalidatePath("/produtos");
  revalidatePath("/");
}

export async function excluirLancamento(formData: FormData) {
  await post(`/lancamentos/${formData.get("id")}`, "DELETE");
  revalidatePath("/caixa");
  revalidatePath("/custos");
  revalidatePath("/mao-obra");
  revalidatePath("/produtos");
  revalidatePath("/");
}

export async function salvarServico(formData: FormData) {
  const id = String(formData.get("id") || "");
  const body = { nome: String(formData.get("nome")), valor: Number(formData.get("valor")) };
  if (id) await post(`/servicos/${id}`, "PUT", body);
  else await post("/servicos", "POST", body);
  revalidatePath("/mao-obra");
}

export async function excluirServico(formData: FormData) {
  await post(`/servicos/${formData.get("id")}`, "DELETE");
  revalidatePath("/mao-obra");
}

export async function salvarProduto(formData: FormData) {
  const id = String(formData.get("id") || "");
  const body = {
    nome: String(formData.get("nome")),
    valor: Number(formData.get("valor")),
    unidade: String(formData.get("unidade") || "Unidade"),
  };
  if (id) await post(`/produtos/${id}`, "PUT", body);
  else await post("/produtos", "POST", body);
  revalidatePath("/produtos");
  revalidatePath("/adubacao");
}

export async function excluirProduto(formData: FormData) {
  await post(`/produtos/${formData.get("id")}`, "DELETE");
  revalidatePath("/produtos");
  revalidatePath("/adubacao");
}

export async function salvarProducao(formData: FormData) {
  const id = String(formData.get("id") || "");
  const quantidadeLatas = Number(formData.get("quantidadeLatas"));
  const custoPorLata = Number(formData.get("custoPorLata"));
  const body = {
    data: String(formData.get("data")),
    quantidadeLatas,
    valorLata: Number(formData.get("valorLata")),
    custosExtracao: Math.round(quantidadeLatas * custoPorLata * 100) / 100,
  };
  if (id) await post(`/producoes/${id}`, "PUT", body);
  else await post("/producoes", "POST", body);
  revalidatePath("/producao");
  revalidatePath("/caixa");
  revalidatePath("/custos");
  revalidatePath("/");
}

export async function excluirProducao(formData: FormData) {
  await post(`/producoes/${formData.get("id")}`, "DELETE");
  revalidatePath("/producao");
  revalidatePath("/caixa");
  revalidatePath("/custos");
  revalidatePath("/");
}

export async function salvarCasa(formData: FormData) {
  const id = String(formData.get("id") || "");
  const body = {
    data: String(formData.get("data")),
    quantidade: Number(formData.get("quantidade")),
    quemTirou: String(formData.get("quemTirou") ?? "").trim(),
  };
  if (id) await post(`/casa/${id}`, "PUT", body);
  else await post("/casa", "POST", body);
  revalidatePath("/producao");
}

export async function excluirCasa(formData: FormData) {
  await post(`/casa/${formData.get("id")}`, "DELETE");
  revalidatePath("/producao");
}

export async function salvarPlantas(formData: FormData) {
  await post("/plantas", "PUT", {
    quantidadePequeno: Number(formData.get("quantidadePequeno")),
    quantidadeMedio: Number(formData.get("quantidadeMedio")),
    quantidadeGrande: Number(formData.get("quantidadeGrande")),
    quantidadeJaProduzem: Number(formData.get("quantidadeJaProduzem")),
    cachosPorLata: Number(formData.get("cachosPorLata") || 0),
    cachosPorPalmeiraNoAno: Number(formData.get("cachosPorPalmeiraNoAno") || 0),
    mesesAteProntoDe: Number(formData.get("mesesAteProntoDe") || 0),
    mesesAteProntoAte: Number(formData.get("mesesAteProntoAte") || 0),
    mesesParaMadurar: 0,
    palmeirasPorPe: 0,
    pesComTresPalmeiras: 0,
    mesesEntreCachos: 0,
    valorLataPrevisao: Number(formData.get("valorLataPrevisao") || 0) || null,
  });
  revalidatePath("/plantas");
  revalidatePath("/adubacao");
  revalidatePath("/");
}

export async function salvarAdubacao(formData: FormData) {
  const faixa = (nome: string) => {
    const produto = String(formData.get(`produto${nome}`) || "");
    return {
      produtoId: produto ? Number(produto) : null,
      quantidadePorPlanta: Number(formData.get(`quantidade${nome}`) || 0),
      aplicacoesNoAno: Number(formData.get(`aplicacoes${nome}`) || 0),
    };
  };
  await post("/adubacao", "PUT", {
    pequeno: faixa("Pequeno"),
    medio: faixa("Medio"),
    grande: faixa("Grande"),
  });
  revalidatePath("/adubacao");
}

export async function criarAtividadePlanejamento(formData: FormData) {
  await post("/planejamento", "POST", {
    ano: Number(formData.get("ano")),
    escala: String(formData.get("escala")),
    periodo: Number(formData.get("periodo")),
    titulo: String(formData.get("titulo")),
    detalhe: String(formData.get("detalhe") || "") || null,
  });
  revalidatePath("/planejamento");
}

export async function alterarAtividadePlanejamento(formData: FormData) {
  const id = String(formData.get("id"));
  await post(`/planejamento/${id}`, "PUT", {
    ano: Number(formData.get("ano")),
    escala: String(formData.get("escala")),
    periodo: Number(formData.get("periodo")),
    titulo: String(formData.get("titulo")),
    detalhe: String(formData.get("detalhe") || "") || null,
  });
  revalidatePath("/planejamento");
}

export async function excluirAtividadePlanejamento(formData: FormData) {
  await post(`/planejamento/${formData.get("id")}`, "DELETE");
  revalidatePath("/planejamento");
}
