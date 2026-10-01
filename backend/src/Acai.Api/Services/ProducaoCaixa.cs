using Acai.Api.Data;
using Acai.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Services;

public static class ProducaoCaixa
{
    public static DateOnly DataDaProducao(ProducaoMensal p)
    {
        var ultimo = DateTime.DaysInMonth(p.Ano, p.Mes);
        var dia = p.Dia < 1 ? 1 : Math.Min(p.Dia, ultimo);
        return new DateOnly(p.Ano, p.Mes, dia);
    }

    public static void GerarLancamentos(AppDbContext db, ProducaoMensal p)
    {
        var data = DataDaProducao(p);
        var quando = data.ToString("dd/MM/yyyy");
        db.Lancamentos.Add(new Lancamento
        {
            Data = data,
            Tipo = TipoLancamento.EntradaCaixa,
            Descricao = $"Producao {quando} - acai tirado (latas x valor lancado)",
            Valor = p.ValorBruto,
            ProducaoMensalId = p.Id
        });
        db.Lancamentos.Add(new Lancamento
        {
            Data = data,
            Tipo = TipoLancamento.CustoOperacional,
            Descricao = $"Producao {quando} - custo para tirar acai",
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
