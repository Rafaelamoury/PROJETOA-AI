using Acai.Api.Contracts;
using Acai.Api.Data;
using Acai.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Controllers;

[ApiController]
[Route("api/casa")]
public class CasaController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CasaResposta>>> List(CancellationToken ct)
    {
        var items = await db.RetiradasCasa.AsNoTracking()
            .OrderByDescending(p => p.Ano).ThenByDescending(p => p.Mes).ThenByDescending(p => p.Dia).ThenByDescending(p => p.Id)
            .ToListAsync(ct);
        return items.Select(Map).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<CasaResposta>> Create(SalvarCasa body, CancellationToken ct)
    {
        var erro = Validar(body);
        if (erro is not null) return BadRequest(new { erro });

        var e = new RetiradaCasa
        {
            Ano = body.Data.Year,
            Mes = body.Data.Month,
            Dia = body.Data.Day,
            Quantidade = body.Quantidade,
            QuemTirou = body.QuemTirou.Trim()
        };
        db.RetiradasCasa.Add(e);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(List), Map(e));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CasaResposta>> Update(int id, SalvarCasa body, CancellationToken ct)
    {
        var erro = Validar(body);
        if (erro is not null) return BadRequest(new { erro });

        var e = await db.RetiradasCasa.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (e is null) return NotFound();

        e.Ano = body.Data.Year;
        e.Mes = body.Data.Month;
        e.Dia = body.Data.Day;
        e.Quantidade = body.Quantidade;
        e.QuemTirou = body.QuemTirou.Trim();
        await db.SaveChangesAsync(ct);
        return Map(e);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var e = await db.RetiradasCasa.FindAsync([id], ct);
        if (e is null) return NotFound();
        db.RetiradasCasa.Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static string? Validar(SalvarCasa body)
    {
        if (body.Data.Year is < 2000 or > 2100) return "Data invalida.";
        if (body.Quantidade <= 0) return "Informe a quantidade tirada para casa.";
        if (string.IsNullOrWhiteSpace(body.QuemTirou)) return "Informe quem tirou.";
        if (body.QuemTirou.Trim().Length > 80) return "O nome de quem tirou esta longo demais.";
        return null;
    }

    private static CasaResposta Map(RetiradaCasa p) =>
        new(p.Id, p.Ano, p.Mes, p.Dia, p.Quantidade, p.QuemTirou);
}
