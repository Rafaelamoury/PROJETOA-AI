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
            .OrderByDescending(p => p.Ano).ThenByDescending(p => p.Mes)
            .ToListAsync(ct);
        return items.Select(Map).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<ProducaoResposta>> Create(SalvarProducao body, CancellationToken ct)
    {
        if (body.Mes is < 1 or > 12) return BadRequest(new { erro = "Mes invalido." });
        var exists = await db.ProducoesMensais.AnyAsync(p => p.Ano == body.Ano && p.Mes == body.Mes, ct);
        if (exists) return Conflict(new { erro = "Ja existe producao para este mes." });

        var e = new ProducaoMensal
        {
            Ano = body.Ano,
            Mes = body.Mes,
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
    public IActionResult Update() =>
        BadRequest(new { erro = "Producao ja lancada nao se altera. Exclua o mes e lance de novo para nao reescrever o caixa antigo." });

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
        new(p.Id, p.Ano, p.Mes, p.QuantidadeLatas, p.ValorLata, p.CustosExtracao, p.CustosExtracao,
            p.ValorBruto, p.ValorLiquido, p.ValorProducao, p.CustoPorLata);
}

[ApiController]
[Route("api/plantas")]
public class PlantasController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PlantasResposta>> Get(CancellationToken ct)
    {
        var e = await db.EstoquesPlantas.AsNoTracking().FirstAsync(ct);
        return Map(e);
    }

    [HttpPut]
    public async Task<ActionResult<PlantasResposta>> Put(SalvarPlantas body, CancellationToken ct)
    {
        if (body.QuantidadePequeno < 0 || body.QuantidadeMedio < 0 || body.QuantidadeGrande < 0 || body.QuantidadeJaProduzem < 0)
            return BadRequest(new { erro = "Quantidades nao podem ser negativas." });

        var e = await db.EstoquesPlantas.FirstAsync(ct);
        e.QuantidadePequeno = body.QuantidadePequeno;
        e.QuantidadeMedio = body.QuantidadeMedio;
        e.QuantidadeGrande = body.QuantidadeGrande;
        e.QuantidadeJaProduzem = body.QuantidadeJaProduzem;
        await db.SaveChangesAsync(ct);
        return Map(e);
    }

    internal static PlantasResposta Map(EstoquePlantas e) =>
        new(e.QuantidadePequeno, e.QuantidadeMedio, e.QuantidadeGrande,
            e.QuantidadePequeno + e.QuantidadeMedio + e.QuantidadeGrande, e.QuantidadeJaProduzem);
}
