import { PainelOperacao } from "@/components/PainelOperacao";
import { fraseDoDia } from "@/lib/frase-do-dia";
import { apiGet } from "@/lib/server-api";
import type { Painel } from "@/lib/types";

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const ano = Number(sp.ano) || now.getFullYear();
  const mes = Number(sp.mes) || now.getMonth() + 1;
  let data: Painel;
  try {
    data = await apiGet<Painel>(`/painel?ano=${ano}&mes=${mes}`);
  } catch {
    return <p>Suba a API com: dotnet run --launch-profile http --project backend/src/Acai.Api</p>;
  }

  return <PainelOperacao data={data} frase={fraseDoDia()} />;
}
