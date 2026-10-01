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
        db.Lancamentos.Add(Novo(p, data, quando, TipoLancamento.EntradaCaixa, p.ValorBruto, "acai tirado (latas x valor lancado)"));
        db.Lancamentos.Add(Novo(p, data, quando, TipoLancamento.CustoOperacional, p.CustosExtracao, "custo para tirar acai"));
    }

    public static void AtualizarLancamentos(AppDbContext db, ProducaoMensal p, IReadOnlyList<Lancamento> atuais)
    {
        var data = DataDaProducao(p);
        var quando = data.ToString("dd/MM/yyyy");
        AtualizarOuCriar(db, p, atuais, data, quando, TipoLancamento.EntradaCaixa, p.ValorBruto, "acai tirado (latas x valor lancado)");
        AtualizarOuCriar(db, p, atuais, data, quando, TipoLancamento.CustoOperacional, p.CustosExtracao, "custo para tirar acai");
    }

    private static void AtualizarOuCriar(
        AppDbContext db,
        ProducaoMensal p,
        IReadOnlyList<Lancamento> atuais,
        DateOnly data,
        string quando,
        TipoLancamento tipo,
        decimal valor,
        string detalhe)
    {
        var existente = atuais.FirstOrDefault(l => l.Tipo == tipo);
        if (existente is null)
        {
            db.Lancamentos.Add(Novo(p, data, quando, tipo, valor, detalhe));
            return;
        }

        existente.Data = data;
        existente.Valor = valor;
        existente.Descricao = $"Producao {quando} - {detalhe}";
    }

    private static Lancamento Novo(ProducaoMensal p, DateOnly data, string quando, TipoLancamento tipo, decimal valor, string detalhe) =>
        new()
        {
            Data = data,
            Tipo = tipo,
            Descricao = $"Producao {quando} - {detalhe}",
            Valor = valor,
            ProducaoMensalId = p.Id
        };

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
