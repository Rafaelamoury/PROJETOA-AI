const base = "/backend/api";

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = "Falha na API";
    try {
      const body = await res.json();
      msg = body.erro ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => fetch(`${base}${path}`).then((r) => parse<T>(r)),
  send: <T>(path: string, method: string, body?: unknown) =>
    fetch(`${base}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => parse<T>(r)),
};

export function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export function nomeMes(mes: number) {
  return MESES[mes - 1] ?? String(mes);
}

export function hojeLocal() {
  const now = new Date();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const dia = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${mes}-${dia}`;
}

export function dataBr(ano: number, mes: number, dia: number) {
  const d = String(dia || 1).padStart(2, "0");
  const m = String(mes).padStart(2, "0");
  return `${d}/${m}/${ano}`;
}

export function dataIsoBr(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}
