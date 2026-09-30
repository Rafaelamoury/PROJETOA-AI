using Acai.Api.Data;
using Acai.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Services;

public static class ProducaoCaixa
{
    public static void GerarLancamentos(AppDbContext db, ProducaoMensal p)
    {
        var data = new DateOnly(p.Ano, p.Mes, 1);
        var mes = $"{p.Mes:00}/{p.Ano}";
        db.Lancamentos.Add(new Lancamento
        {
            Data = data,
            Tipo = TipoLancamento.EntradaCaixa,
            Descricao = $"Producao {mes} - acai tirado (latas x valor lancado)",
            Valor = p.ValorBruto,
            ProducaoMensalId = p.Id
        });
        db.Lancamentos.Add(new Lancamento
        {
            Data = data,
            Tipo = TipoLancamento.CustoOperacional,
            Descricao = $"Producao {mes} - custo para tirar acai",
            Valor = p.CustosExtracao,
            ProducaoMensalId = p.Id
        });
    }

    public static async Task BackfillAsync(AppDbContext db, CancellationToken ct = default)
    {
        var producoes = await db.ProducoesMensais.ToListAsync(ct);
        foreach (var p in producoes)
        {
            var tem = await db.Lancamentos.AnyAsync(l => l.ProducaoMensalId == p.Id, ct);
            if (!tem)
                GerarLancamentos(db, p);
        }
        await db.SaveChangesAsync(ct);
    }
}
