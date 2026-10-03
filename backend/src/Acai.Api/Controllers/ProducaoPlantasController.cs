using Acai.Api.Contracts;
using Acai.Api.Data;
using Acai.Api.Domain;
using Acai.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Controllers;

[ApiController]
[Route("api/producoes")]
public class ProducoesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProducaoResposta>>> List(CancellationToken ct)
    {
        var items = await db.ProducoesMensais.AsNoTracking()
            .OrderByDescending(p => p.Ano).ThenByDescending(p => p.Mes).ThenByDescending(p => p.Dia)
            .ToListAsync(ct);
        return items.Select(Map).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<ProducaoResposta>> Create(SalvarProducao body, CancellationToken ct)
    {
        if (body.Data.Year is < 2000 or > 2100) return BadRequest(new { erro = "Data invalida." });

        var e = new ProducaoMensal
        {
            Ano = body.Data.Year,
            Mes = body.Data.Month,
            Dia = body.Data.Day,
            QuantidadeLatas = body.QuantidadeLatas,
            ValorLata = body.ValorLata,
            CustosExtracao = body.CustosExtracao
        };
        db.ProducoesMensais.Add(e);
        await db.SaveChangesAsync(ct);
        ProducaoCaixa.GerarLancamentos(db, e);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(List), Map(e));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProducaoResposta>> Update(int id, SalvarProducao body, CancellationToken ct)
    {
        if (body.Data.Year is < 2000 or > 2100) return BadRequest(new { erro = "Data invalida." });
        if (body.QuantidadeLatas < 0 || body.ValorLata < 0 || body.CustosExtracao < 0)
            return BadRequest(new { erro = "Valores nao podem ser negativos." });

        var e = await db.ProducoesMensais.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (e is null) return NotFound();

        e.Ano = body.Data.Year;
        e.Mes = body.Data.Month;
        e.Dia = body.Data.Day;
        e.QuantidadeLatas = body.QuantidadeLatas;
        e.ValorLata = body.ValorLata;
        e.CustosExtracao = body.CustosExtracao;

        var lancamentos = await db.Lancamentos.Where(l => l.ProducaoMensalId == e.Id).ToListAsync(ct);
        ProducaoCaixa.AtualizarLancamentos(db, e, lancamentos);
        await db.SaveChangesAsync(ct);
        return Map(e);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var e = await db.ProducoesMensais.FindAsync([id], ct);
        if (e is null) return NotFound();
        db.ProducoesMensais.Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    internal static ProducaoResposta Map(ProducaoMensal p) =>
        new(p.Id, p.Ano, p.Mes, p.Dia, p.QuantidadeLatas, p.ValorLata, p.CustosExtracao, p.CustosExtracao,
            p.ValorBruto, p.ValorLiquido, p.ValorProducao, p.CustoPorLata);
}

[ApiController]
[Route("api/plantas")]
public class PlantasController(AppDbContext db) : ControllerBase
{
    private static readonly (int Meses, string Periodo)[] Horizontes =
    [
        (3, "Trimestre"),
        (6, "Semestre"),
        (9, "Nove meses"),
        (12, "Ano")
    ];

    [HttpGet]
    public async Task<ActionResult<PlantasResposta>> Get(CancellationToken ct)
    {
        var e = await db.EstoquesPlantas.AsNoTracking().FirstAsync(ct);
        return await Montar(e, ct);
    }

    [HttpPut]
    public async Task<ActionResult<PlantasResposta>> Put(SalvarPlantas body, CancellationToken ct)
    {
        if (body.QuantidadePequeno < 0 || body.QuantidadeMedio < 0 || body.QuantidadeGrande < 0 || body.QuantidadeJaProduzem < 0)
            return BadRequest(new { erro = "Quantidades nao podem ser negativas." });
        if (body.CachosPorLata < 0 || body.MesesParaMadurar < 0 || body.PalmeirasPorPe < 0 || body.PesComTresPalmeiras < 0 || body.MesesEntreCachos < 0)
            return BadRequest(new { erro = "Os numeros da conta nao podem ser negativos." });

        var e = await db.EstoquesPlantas.FirstAsync(ct);
        var mudou = e.QuantidadePequeno != body.QuantidadePequeno
            || e.QuantidadeMedio != body.QuantidadeMedio
            || e.QuantidadeGrande != body.QuantidadeGrande
            || e.QuantidadeJaProduzem != body.QuantidadeJaProduzem;
        e.QuantidadePequeno = body.QuantidadePequeno;
        e.QuantidadeMedio = body.QuantidadeMedio;
        e.QuantidadeGrande = body.QuantidadeGrande;
        e.QuantidadeJaProduzem = body.QuantidadeJaProduzem;
        var semHistoria = !await db.ContagensPlantas.AnyAsync(ct);
        e.CachosPorLata = body.CachosPorLata;
        e.ValorLataPrevisao = body.ValorLataPrevisao is > 0 ? body.ValorLataPrevisao : null;
        if (mudou || semHistoria)
        {
            db.ContagensPlantas.Add(new ContagemPlantas
            {
                Data = DateOnly.FromDateTime(DateTime.Today),
                Pequeno = body.QuantidadePequeno,
                Medio = body.QuantidadeMedio,
                Grande = body.QuantidadeGrande,
                JaProduzem = body.QuantidadeJaProduzem
            });
        }
        await db.SaveChangesAsync(ct);
        return await Montar(e, ct);
    }

    private async Task<PlantasResposta> Montar(EstoquePlantas e, CancellationToken ct)
    {
        var producoes = await db.ProducoesMensais.AsNoTracking().ToListAsync(ct);
        var casas = await db.RetiradasCasa.AsNoTracking().ToListAsync(ct);
        var historico = await db.ContagensPlantas.AsNoTracking()
            .OrderByDescending(c => c.Data).ThenByDescending(c => c.Id)
            .Take(12)
            .ToListAsync(ct);
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var pesos = PesosDaSafra(producoes, casas);
        var reparto = pesos.Count(p => p > 0) >= 3 && pesos.Distinct().Count() > 1;
        var ultima = producoes.OrderByDescending(Data).ThenByDescending(p => p.Id).FirstOrDefault();
        var preco = e.ValorLataPrevisao is > 0 ? e.ValorLataPrevisao : ultima?.ValorLata;
        var fonte = e.ValorLataPrevisao is > 0 ? "informado" : ultima is null ? "sem" : "ultima";
        var previsoes = Horizontes.Select(h => Prever(e, producoes, casas, pesos, hoje, preco, h.Meses, h.Periodo)).ToList();
        return new(
            e.QuantidadePequeno,
            e.QuantidadeMedio,
            e.QuantidadeGrande,
            e.QuantidadePequeno + e.QuantidadeMedio + e.QuantidadeGrande,
            e.QuantidadeJaProduzem,
            e.CachosPorLata,
            e.MesesParaMadurar,
            e.PalmeirasPorPe,
            e.PesComTresPalmeiras,
            e.MesesEntreCachos,
            Math.Max(0, e.QuantidadeJaProduzem),
            previsoes,
            reparto,
            e.ValorLataPrevisao,
            fonte,
            historico.Select(c => new ContagemPlantasResposta(c.Data, c.Pequeno, c.Medio, c.Grande, c.JaProduzem)).ToList());
    }

    private static PrevisaoPlantio Prever(
        EstoquePlantas e,
        IReadOnlyList<ProducaoMensal> producoes,
        IReadOnlyList<RetiradaCasa> casas,
        decimal[] pesos,
        DateOnly hoje,
        decimal? preco,
        int meses,
        string periodo)
    {
        var parte = Parte(pesos, hoje, meses);
        var plantas = Math.Max(0, e.QuantidadeJaProduzem);
        var baixa = DoAno(plantas, 6, parte, e.CachosPorLata);
        var alta = DoAno(plantas, 8, parte, e.CachosPorLata);
        var inicio = hoje.AddMonths(-meses);
        var tiradas = producoes.Where(p => Data(p) >= inicio && Data(p) <= hoje).Sum(p => p.QuantidadeLatas)
            + casas.Where(c => DataCasa(c) >= inicio && DataCasa(c) <= hoje).Sum(c => c.Quantidade);
        var precoRedondo = preco is null ? (decimal?)null : Math.Round(preco.Value, 2);
        var faturamento = precoRedondo is null ? (decimal?)null : Math.Round(baixa.LatasExatas * precoRedondo.Value, 2);
        var faturamentoMax = precoRedondo is null ? (decimal?)null : Math.Round(alta.LatasExatas * precoRedondo.Value, 2);
        return new(meses, periodo, baixa.Cachos, baixa.Latas, precoRedondo, faturamento, false, alta.Cachos, alta.Latas, faturamentoMax, Math.Round(tiradas, 2), Math.Round(parte, 4));
    }

    private static (decimal Cachos, decimal Latas, decimal LatasExatas) DoAno(int plantas, int cachosPorPalmeiraNoAno, decimal parte, int cachosPorLata)
    {
        var cachosExatos = plantas * cachosPorPalmeiraNoAno * parte;
        var latasExatas = cachosPorLata > 0 ? cachosExatos / cachosPorLata : 0m;
        return (Math.Round(cachosExatos, 2), Math.Round(latasExatas, 2), latasExatas);
    }

    private static decimal[] PesosDaSafra(IReadOnlyList<ProducaoMensal> producoes, IReadOnlyList<RetiradaCasa> casas)
    {
        var bruto = new decimal[12];
        foreach (var p in producoes) bruto[p.Mes - 1] += p.QuantidadeLatas;
        foreach (var c in casas) bruto[c.Mes - 1] += c.Quantidade;
        var mesesCom = bruto.Count(x => x > 0);
        if (mesesCom < 3)
            return Enumerable.Repeat(1m / 12m, 12).ToArray();
        var soma = bruto.Sum();
        return bruto.Select(x => soma == 0 ? 1m / 12m : x / soma).ToArray();
    }

    private static decimal Parte(decimal[] pesos, DateOnly hoje, int meses)
    {
        if (meses >= 12) return 1m;
        decimal soma = 0;
        for (var i = 0; i < meses; i++)
            soma += pesos[(hoje.Month - 1 + i) % 12];
        return soma;
    }

    private static DateOnly DataCasa(RetiradaCasa c)
    {
        var dia = Math.Clamp(c.Dia, 1, DateTime.DaysInMonth(c.Ano, c.Mes));
        return new DateOnly(c.Ano, c.Mes, dia);
    }

    private static DateOnly Data(ProducaoMensal p)
    {
        var dia = Math.Clamp(p.Dia, 1, DateTime.DaysInMonth(p.Ano, p.Mes));
        return new DateOnly(p.Ano, p.Mes, dia);
    }

}
