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
