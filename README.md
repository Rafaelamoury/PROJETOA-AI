# RR Açaí — gestão do plantio

Sistema para o cliente acompanhar **caixa**, **custos operacionais**, **mão de obra**, **produção (lata)**, **preços de produtos** e **plantas pequeno / médio / grande**.

## Como um programador novo começa

1. Ler este README e [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. Vocabulário do negócio: [docs/DOMAIN.md](docs/DOMAIN.md)
3. Decisões técnicas: [docs/DECISIONS.md](docs/DECISIONS.md)
4. Onde colocar código: [CONTRIBUTING.md](CONTRIBUTING.md)

## Mapa do repositório

- `backend/src/Acai.Api` — API REST ASP.NET Core (C#), fonte da verdade
- `apps/web` — frontend Next.js (o que o cliente usa no navegador)
- `apps/mobile` — app React Native (Expo), mesma API
- `docs/` — documentação para o time

## Como rodar (desenvolvimento)

**API** (porta 5043):

```bash
cd backend/src/Acai.Api
dotnet run --launch-profile http
```

**Web** (porta 3000 — o Next encaminha `/backend/*` para a API):

```bash
cd apps/web
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Entre com **CPF e senha**. O admin (Rafael) já vem cadastrado, **sem lançamentos**. Outros usuários se criam no menu **Usuarios**.

Banco local: SQLite `acai.db` na pasta da API (criado na primeira execução, vazio de operação).

## Módulos na tela

| Menu | O que faz |
| --- | --- |
| Painel | Produção, custos e lucro do mês e do ano |
| Caixa | Saldo, entradas e extrato |
| Custos | Lançamentos de custos operacionais e mão de obra paga |
| Mão de obra | Valor de cada serviço |
| Produção | Latas no mês, valor da lata, custos de extração, valor da produção |
| Produtos | Tabela de preços |
| Plantas | Quantidade pequeno, médio, grande e as que já produzem |
| Planejamento | Atividades do sítio por ano: trimestral, semestral e anual |

## Publicar para outras pessoas (Vercel + Railway)

O site (Next.js) sobe **de graça** na [Vercel Hobby](https://vercel.com). A API em C# e o banco **não** ficam bem na Vercel (o SQLite some a cada restart). Por isso a API vai na [Railway](https://railway.com):

| Onde | O que | Custo real |
| --- | --- | --- |
| **Vercel** | tela do RR Açaí (`apps/web`) | grátis no Hobby (uso pessoal / pequeno) |
| **Railway** | API + arquivo do banco (`backend/src/Acai.Api`) | **Free Trial** US$ 5 por 30 dias (sem cartão). Depois: plano **Free** US$ 1/mês (pode desligar se passar do crédito) ou **Hobby** US$ 5/mês para ficar no ar o mês todo |

### 1. API na Railway

1. Entre em https://railway.com com GitHub (`Rafaelamoury/PROJETOA-AI`).
2. New Project → Deploy from GitHub → este repositório.
3. Root directory: `backend/src/Acai.Api`.
4. Settings → Networking → Generate domain (fica algo como `https://xxxx.up.railway.app`).
5. Adicione um **Volume** montado em `/data` (Free Trial/Free: até 500 MB).
6. Variables:
   - `Jwt__Key` = uma frase longa (mais de 32 caracteres), só sua
   - `Jwt__Issuer` = `Acai.Api`
   - `ASPNETCORE_ENVIRONMENT` = `Production`

Teste no navegador: `https://SEU-DOMINIO.up.railway.app/api/health` deve responder `{"status":"ok"...}`.

### 2. Site na Vercel

1. Entre em https://vercel.com com o mesmo GitHub.
2. Import `Rafaelamoury/PROJETOA-AI`.
3. Root Directory: `apps/web`.
4. Environment variable **`API_URL`** = `https://SEU-DOMINIO.up.railway.app/api` (o domínio da Railway, com `/api` no final).
5. Deploy. O link da Vercel (ex. `https://rr-acai.vercel.app`) é o que você manda para a outra pessoa.

Ela abre o link, entra com CPF e senha que você criou em **Usuarios**.

