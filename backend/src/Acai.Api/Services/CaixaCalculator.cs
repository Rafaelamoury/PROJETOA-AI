using Acai.Api.Data;
using Acai.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Services;

public static class CaixaCalculator
{
    public static async Task<(decimal SaldoInicial, decimal Entradas, decimal Saidas, decimal Saldo)> CalcularAsync(
        AppDbContext db,
        CancellationToken cancellationToken = default)
    {
        var config = await db.CaixaConfigs.AsNoTracking().FirstAsync(cancellationToken);
        var lancamentos = await db.Lancamentos.AsNoTracking().ToListAsync(cancellationToken);

        var entradas = lancamentos.Where(l => l.Tipo == TipoLancamento.EntradaCaixa).Sum(l => l.Valor);
        var saidas = lancamentos
            .Where(l => l.Tipo is TipoLancamento.CustoOperacional or TipoLancamento.MaoObra)
            .Sum(l => l.Valor);

        return (config.SaldoInicial, entradas, saidas, config.SaldoInicial + entradas - saidas);
    }
}
