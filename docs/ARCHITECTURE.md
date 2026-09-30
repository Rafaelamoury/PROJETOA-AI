# Arquitetura

```
Navegador (Next.js :3000)
    |  /backend/*  (rewrite)
API ASP.NET (:5043)
    |  EF Core
SQLite (acai.db)
```

O app Expo chama a mesma API em `http://<ip-da-maquina>:5043/api/...`.

Camadas na API:

- `Controllers` — HTTP REST
- `Domain` — entidades
- `Data` — EF Core
- `Services/CaixaCalculator` — saldo = inicial + entradas − saídas (custos e mão de obra)

O saldo **não** é um campo solto na tela: é calculado no servidor para web e mobile não divergirem.
