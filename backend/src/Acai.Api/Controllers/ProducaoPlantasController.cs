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
        if (body.CachosPorLata < 0 || body.MesesParaMadurar < 0)
            return BadRequest(new { erro = "Cachos por lata e meses para madurar nao podem ser negativos." });

        var e = await db.EstoquesPlantas.FirstAsync(ct);
        e.QuantidadePequeno = body.QuantidadePequeno;
        e.QuantidadeMedio = body.QuantidadeMedio;
        e.QuantidadeGrande = body.QuantidadeGrande;
        e.QuantidadeJaProduzem = body.QuantidadeJaProduzem;
        e.CachosPorLata = body.CachosPorLata;
        e.MesesParaMadurar = body.MesesParaMadurar;
        await db.SaveChangesAsync(ct);
        return await Montar(e, ct);
    }

    private async Task<PlantasResposta> Montar(EstoquePlantas e, CancellationToken ct)
    {
        var producoes = await db.ProducoesMensais.AsNoTracking().ToListAsync(ct);
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var previsoes = Horizontes.Select(h => Prever(e, producoes, hoje, h.Meses, h.Periodo)).ToList();
        return new(
            e.QuantidadePequeno,
            e.QuantidadeMedio,
            e.QuantidadeGrande,
            e.QuantidadePequeno + e.QuantidadeMedio + e.QuantidadeGrande,
            e.QuantidadeJaProduzem,
            e.CachosPorLata,
            e.MesesParaMadurar,
            previsoes);
    }

    private static PrevisaoPlantio Prever(
        EstoquePlantas e,
        IReadOnlyList<ProducaoMensal> producoes,
        DateOnly hoje,
        int meses,
        string periodo)
    {
        var cachos = (decimal)e.QuantidadeJaProduzem * meses;
        var latas = e.CachosPorLata > 0 ? Math.Round(cachos / e.CachosPorLata, 2) : 0m;
        var inicio = hoje.AddMonths(-meses);
        var noPeriodo = producoes.Where(p => Data(p) >= inicio && Data(p) <= hoje).ToList();
        var doPeriodo = Media(noPeriodo);
        var geral = Media(producoes);
        var valor = doPeriodo ?? geral;
        var faturamento = valor is null ? (decimal?)null : Math.Round(latas * valor.Value, 2);
        return new(meses, periodo, cachos, latas, valor is null ? null : Math.Round(valor.Value, 2), faturamento, doPeriodo is null && geral is not null);
    }

    private static DateOnly Data(ProducaoMensal p)
    {
        var dia = Math.Clamp(p.Dia, 1, DateTime.DaysInMonth(p.Ano, p.Mes));
        return new DateOnly(p.Ano, p.Mes, dia);
    }

    private static decimal? Media(IReadOnlyList<ProducaoMensal> itens)
    {
        var quantidade = itens.Sum(p => p.QuantidadeLatas);
        if (quantidade <= 0) return null;
        return itens.Sum(p => p.QuantidadeLatas * p.ValorLata) / quantidade;
    }
}
