using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Data;

public static class SchemaPatch
{
    public static async Task ApplyAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();
        await TryAlter("ALTER TABLE EstoquesPlantas ADD COLUMN QuantidadeJaProduzem INTEGER NOT NULL DEFAULT 0");
        await TryAlter("ALTER TABLE Lancamentos ADD COLUMN ProducaoMensalId INTEGER NULL");
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                """
                CREATE TABLE IF NOT EXISTS "Usuarios" (
                    "Id" INTEGER NOT NULL CONSTRAINT "PK_Usuarios" PRIMARY KEY AUTOINCREMENT,
                    "Nome" TEXT NOT NULL,
                    "Cpf" TEXT NOT NULL,
                    "PasswordHash" TEXT NOT NULL,
                    "IsAdmin" INTEGER NOT NULL
                );
                """);
            await db.Database.ExecuteSqlRawAsync(
                """CREATE UNIQUE INDEX IF NOT EXISTS "IX_Usuarios_Cpf" ON "Usuarios" ("Cpf");""");
            await db.Database.ExecuteSqlRawAsync(
                """
                CREATE TABLE IF NOT EXISTS "AtividadesPlanejamento" (
                    "Id" INTEGER NOT NULL CONSTRAINT "PK_AtividadesPlanejamento" PRIMARY KEY AUTOINCREMENT,
                    "Ano" INTEGER NOT NULL,
                    "Escala" INTEGER NOT NULL,
                    "Periodo" INTEGER NOT NULL,
                    "Titulo" TEXT NOT NULL,
                    "Detalhe" TEXT NULL
                );
                """);
        }
        catch
        {
            // tabela já existe
        }

        async Task TryAlter(string sql)
        {
            try
            {
                await db.Database.ExecuteSqlRawAsync(sql);
            }
            catch
            {
                // coluna já existe
            }
        }
    }
}
