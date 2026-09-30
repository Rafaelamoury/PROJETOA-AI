using Acai.Api.Contracts;
using Acai.Api.Data;
using Acai.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Controllers;

[ApiController]
[Route("api/planejamento")]
public class PlanejamentoController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AtividadePlanejamentoResposta>>> List(
        [FromQuery] int ano,
        [FromQuery] EscalaPlanejamento escala,
        CancellationToken ct)
    {
        if (ano is < 2000 or > 2100) return BadRequest(new { erro = "Ano invalido." });
        var items = await db.AtividadesPlanejamento.AsNoTracking()
            .Where(a => a.Ano == ano && a.Escala == escala)
            .OrderBy(a => a.Periodo)
            .ThenBy(a => a.Id)
            .ToListAsync(ct);
        return items.Select(Map).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<AtividadePlanejamentoResposta>> Create(SalvarAtividadePlanejamento body, CancellationToken ct)
    {
        var erro = Validar(body);
        if (erro is not null) return BadRequest(new { erro });

        var e = new AtividadePlanejamento
        {
            Ano = body.Ano,
            Escala = body.Escala,
            Periodo = body.Escala == EscalaPlanejamento.Anual ? 1 : body.Periodo,
            Titulo = body.Titulo.Trim(),
            Detalhe = string.IsNullOrWhiteSpace(body.Detalhe) ? null : body.Detalhe.Trim()
        };
        db.AtividadesPlanejamento.Add(e);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(List), new { ano = e.Ano, escala = e.Escala }, Map(e));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AtividadePlanejamentoResposta>> Update(int id, SalvarAtividadePlanejamento body, CancellationToken ct)
    {
        var erro = Validar(body);
        if (erro is not null) return BadRequest(new { erro });
        var e = await db.AtividadesPlanejamento.FindAsync([id], ct);
        if (e is null) return NotFound();
        e.Ano = body.Ano;
        e.Escala = body.Escala;
        e.Periodo = body.Escala == EscalaPlanejamento.Anual ? 1 : body.Periodo;
        e.Titulo = body.Titulo.Trim();
        e.Detalhe = string.IsNullOrWhiteSpace(body.Detalhe) ? null : body.Detalhe.Trim();
        await db.SaveChangesAsync(ct);
        return Map(e);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var e = await db.AtividadesPlanejamento.FindAsync([id], ct);
        if (e is null) return NotFound();
        db.AtividadesPlanejamento.Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static string? Validar(SalvarAtividadePlanejamento body)
    {
        if (body.Ano is < 2000 or > 2100) return "Ano invalido.";
        if (string.IsNullOrWhiteSpace(body.Titulo)) return "Titulo obrigatorio.";
        return body.Escala switch
        {
            EscalaPlanejamento.Trimestral when body.Periodo is < 1 or > 4 => "Trimestre deve ser 1 a 4.",
            EscalaPlanejamento.Semestral when body.Periodo is < 1 or > 2 => "Semestre deve ser 1 ou 2.",
            EscalaPlanejamento.Anual => null,
            EscalaPlanejamento.Trimestral or EscalaPlanejamento.Semestral => null,
            _ => "Escala invalida."
        };
    }

    private static AtividadePlanejamentoResposta Map(AtividadePlanejamento a) =>
        new(a.Id, a.Ano, a.Escala, a.Periodo, a.Titulo, a.Detalhe);
}
