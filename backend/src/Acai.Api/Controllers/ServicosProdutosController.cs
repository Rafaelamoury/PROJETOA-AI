using Acai.Api.Contracts;
using Acai.Api.Data;
using Acai.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Controllers;

[ApiController]
[Route("api/servicos")]
public class ServicosController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServicoResposta>>> List(CancellationToken ct) =>
        await db.ServicosMaoObra.AsNoTracking().OrderBy(s => s.Nome)
            .Select(s => new ServicoResposta(s.Id, s.Nome, s.Valor)).ToListAsync(ct);

    [HttpPost]
    public async Task<ActionResult<ServicoResposta>> Create(SalvarServico body, CancellationToken ct)
    {
        var e = new ServicoMaoObra { Nome = body.Nome.Trim(), Valor = body.Valor };
        db.ServicosMaoObra.Add(e);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(List), new ServicoResposta(e.Id, e.Nome, e.Valor));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ServicoResposta>> Update(int id, SalvarServico body, CancellationToken ct)
    {
        var e = await db.ServicosMaoObra.FindAsync([id], ct);
        if (e is null) return NotFound();
        e.Nome = body.Nome.Trim();
        e.Valor = body.Valor;
        await db.SaveChangesAsync(ct);
        return new ServicoResposta(e.Id, e.Nome, e.Valor);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var e = await db.ServicosMaoObra.FindAsync([id], ct);
        if (e is null) return NotFound();
        db.ServicosMaoObra.Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

[ApiController]
[Route("api/produtos")]
public class ProdutosController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProdutoResposta>>> List(CancellationToken ct) =>
        await db.Produtos.AsNoTracking().OrderBy(p => p.Nome)
            .Select(p => new ProdutoResposta(p.Id, p.Nome, p.Valor)).ToListAsync(ct);

    [HttpPost]
    public async Task<ActionResult<ProdutoResposta>> Create(SalvarProduto body, CancellationToken ct)
    {
        var e = new Produto { Nome = body.Nome.Trim(), Valor = body.Valor };
        db.Produtos.Add(e);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(List), new ProdutoResposta(e.Id, e.Nome, e.Valor));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProdutoResposta>> Update(int id, SalvarProduto body, CancellationToken ct)
    {
        var e = await db.Produtos.FindAsync([id], ct);
        if (e is null) return NotFound();
        e.Nome = body.Nome.Trim();
        e.Valor = body.Valor;
        await db.SaveChangesAsync(ct);
        return new ProdutoResposta(e.Id, e.Nome, e.Valor);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var e = await db.Produtos.FindAsync([id], ct);
        if (e is null) return NotFound();
        db.Produtos.Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
