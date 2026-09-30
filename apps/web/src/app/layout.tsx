import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { getSessao } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "RR Açaí | Gestão do plantio",
  description: "Caixa, custos, mão de obra, produção e plantas",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessao();
  return (
    <html lang="pt-BR">
      <body>
        <Shell user={user}>{children}</Shell>
      </body>
    </html>
  );
}
