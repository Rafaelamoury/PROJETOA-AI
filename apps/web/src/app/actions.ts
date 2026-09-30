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

export async function atualizarSaldo(formData: FormData) {
  await post("/caixa/saldo-inicial", "PUT", { saldoInicial: Number(formData.get("saldoInicial")) });
  revalidatePath("/caixa");
  revalidatePath("/custos");
  revalidatePath("/");
}

export async function criarLancamento(formData: FormData) {
  const tipo = String(formData.get("tipo"));
  const servico = String(formData.get("servicoMaoObraId") || "");
  await post("/lancamentos", "POST", {
    data: String(formData.get("data")),
    tipo,
    descricao: String(formData.get("descricao")),
    valor: Number(formData.get("valor")),
    servicoMaoObraId: servico ? Number(servico) : null,
  });
  revalidatePath("/caixa");
  revalidatePath("/custos");
  revalidatePath("/");
}

export async function excluirLancamento(formData: FormData) {
  await post(`/lancamentos/${formData.get("id")}`, "DELETE");
  revalidatePath("/caixa");
  revalidatePath("/custos");
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
  const body = { nome: String(formData.get("nome")), valor: Number(formData.get("valor")) };
  if (id) await post(`/produtos/${id}`, "PUT", body);
  else await post("/produtos", "POST", body);
  revalidatePath("/produtos");
}

export async function excluirProduto(formData: FormData) {
  await post(`/produtos/${formData.get("id")}`, "DELETE");
  revalidatePath("/produtos");
}

export async function salvarProducao(formData: FormData) {
  await post("/producoes", "POST", {
    ano: Number(formData.get("ano")),
    mes: Number(formData.get("mes")),
    quantidadeLatas: Number(formData.get("quantidadeLatas")),
    valorLata: Number(formData.get("valorLata")),
    custosExtracao: Number(formData.get("custosExtracao")),
  });
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

export async function salvarPlantas(formData: FormData) {
  await post("/plantas", "PUT", {
    quantidadePequeno: Number(formData.get("quantidadePequeno")),
    quantidadeMedio: Number(formData.get("quantidadeMedio")),
    quantidadeGrande: Number(formData.get("quantidadeGrande")),
    quantidadeJaProduzem: Number(formData.get("quantidadeJaProduzem")),
  });
  revalidatePath("/plantas");
  revalidatePath("/");
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
