using Acai.Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        if (!await db.CaixaConfigs.AnyAsync())
        {
            db.CaixaConfigs.Add(new CaixaConfig { SaldoInicial = 0m });
        }

        if (!await db.EstoquesPlantas.AnyAsync())
        {
            db.EstoquesPlantas.Add(new EstoquePlantas
            {
                QuantidadePequeno = 0,
                QuantidadeMedio = 0,
                QuantidadeGrande = 0,
                QuantidadeJaProduzem = 0
            });
        }

        if (!await db.Adubacoes.AnyAsync())
            db.Adubacoes.Add(new Adubacao());

        await db.SaveChangesAsync();
        await SeedAdminAsync(db);
    }

    private static async Task SeedAdminAsync(AppDbContext db)
    {
        const string cpf = "02809882223";
        if (await db.Usuarios.AnyAsync(u => u.Cpf == cpf)) return;

        var user = new Usuario
        {
            Nome = "Rafael Amoury",
            Cpf = cpf,
            IsAdmin = true
        };
        var hasher = new PasswordHasher<Usuario>();
        user.PasswordHash = hasher.HashPassword(user, "311908rr");
        db.Usuarios.Add(user);
        await db.SaveChangesAsync();
    }
}
