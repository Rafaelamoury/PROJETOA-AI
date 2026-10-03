import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { getSessao, versaoDaApi } from "@/lib/server-api";
import { VERSAO } from "@/lib/versao";

export const metadata: Metadata = {
  title: "RR Açaí | Gestão do plantio",
  description: "Caixa, custos, mão de obra, produção e plantas",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, versaoApi] = await Promise.all([getSessao(), versaoDaApi()]);
  return (
    <html lang="pt-BR">
      <body>
        <Shell user={user} contaDefasada={versaoApi != null && versaoApi !== VERSAO}>{children}</Shell>
      </body>
    </html>
  );
}
