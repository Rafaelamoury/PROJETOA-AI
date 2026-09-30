using Acai.Api.Contracts;
using Acai.Api.Data;
using Acai.Api.Domain;
using Acai.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Controllers;

[ApiController]
[Route("api/caixa")]
public class CaixaController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CaixaResposta>> Get(CancellationToken ct)
    {
        var c = await CaixaCalculator.CalcularAsync(db, ct);
        return new CaixaResposta(c.SaldoInicial, c.Entradas, c.Saidas, c.Saldo);
    }

    [HttpPut("saldo-inicial")]
    public async Task<ActionResult<CaixaResposta>> PutSaldo(AtualizarSaldoInicial body, CancellationToken ct)
    {
        var config = await db.CaixaConfigs.FirstAsync(ct);
        config.SaldoInicial = body.SaldoInicial;
        await db.SaveChangesAsync(ct);
        var c = await CaixaCalculator.CalcularAsync(db, ct);
        return new CaixaResposta(c.SaldoInicial, c.Entradas, c.Saidas, c.Saldo);
    }
}

[ApiController]
[Route("api/lancamentos")]
public class LancamentosController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LancamentoResposta>>> List(CancellationToken ct)
    {
        var items = await db.Lancamentos.AsNoTracking()
            .Include(l => l.ServicoMaoObra)
            .OrderByDescending(l => l.Data)
            .ThenByDescending(l => l.Id)
            .ToListAsync(ct);

        return items.Select(l => new LancamentoResposta(
            l.Id, l.Data, l.Tipo, l.Descricao, l.Valor, l.ServicoMaoObraId, l.ServicoMaoObra?.Nome, l.ProducaoMensalId)).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<LancamentoResposta>> Create(CriarLancamento body, CancellationToken ct)
    {
        if (body.Valor < 0) return BadRequest(new { erro = "Valor nao pode ser negativo." });
        if (string.IsNullOrWhiteSpace(body.Descricao)) return BadRequest(new { erro = "Descricao obrigatoria." });

        var entity = new Lancamento
        {
            Data = body.Data,
            Tipo = body.Tipo,
            Descricao = body.Descricao.Trim(),
            Valor = body.Valor,
            ServicoMaoObraId = body.ServicoMaoObraId
        };

        if (body.Tipo == TipoLancamento.MaoObra && body.ServicoMaoObraId is int sid)
        {
            var servico = await db.ServicosMaoObra.FindAsync([sid], ct);
            if (servico is null) return BadRequest(new { erro = "Servico de mao de obra nao encontrado." });
            if (entity.Valor == 0) entity.Valor = servico.Valor;
        }

        db.Lancamentos.Add(entity);
        await db.SaveChangesAsync(ct);
        await db.Entry(entity).Reference(l => l.ServicoMaoObra).LoadAsync(ct);

        return CreatedAtAction(nameof(List), new LancamentoResposta(
            entity.Id, entity.Data, entity.Tipo, entity.Descricao, entity.Valor, entity.ServicoMaoObraId, entity.ServicoMaoObra?.Nome, entity.ProducaoMensalId));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var entity = await db.Lancamentos.FindAsync([id], ct);
        if (entity is null) return NotFound();
        if (entity.ProducaoMensalId is not null)
            return BadRequest(new { erro = "Este lancamento veio da producao. Exclua o mes em Producao." });
        db.Lancamentos.Remove(entity);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
