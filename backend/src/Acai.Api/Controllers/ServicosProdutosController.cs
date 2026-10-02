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
            .Select(p => new ProdutoResposta(p.Id, p.Nome, p.Valor, p.Unidade)).ToListAsync(ct);

    [HttpPost]
    public async Task<ActionResult<ProdutoResposta>> Create(SalvarProduto body, CancellationToken ct)
    {
        var erro = Validar(body);
        if (erro is not null) return BadRequest(new { erro });
        var e = new Produto { Nome = body.Nome.Trim(), Valor = body.Valor, Unidade = body.Unidade };
        db.Produtos.Add(e);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(List), new ProdutoResposta(e.Id, e.Nome, e.Valor, e.Unidade));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProdutoResposta>> Update(int id, SalvarProduto body, CancellationToken ct)
    {
        var erro = Validar(body);
        if (erro is not null) return BadRequest(new { erro });
        var e = await db.Produtos.FindAsync([id], ct);
        if (e is null) return NotFound();
        e.Nome = body.Nome.Trim();
        e.Valor = body.Valor;
        e.Unidade = body.Unidade;
        await db.SaveChangesAsync(ct);
        return new ProdutoResposta(e.Id, e.Nome, e.Valor, e.Unidade);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var e = await db.Produtos.FindAsync([id], ct);
        if (e is null) return NotFound();
        var ligados = await db.Lancamentos.Where(l => l.ProdutoId == id).ToListAsync(ct);
        foreach (var lancamento in ligados) lancamento.ProdutoId = null;
        var planos = await db.Adubacoes.ToListAsync(ct);
        foreach (var plano in planos)
        {
            if (plano.ProdutoIdPequeno == id) plano.ProdutoIdPequeno = null;
            if (plano.ProdutoIdMedio == id) plano.ProdutoIdMedio = null;
            if (plano.ProdutoIdGrande == id) plano.ProdutoIdGrande = null;
        }
        db.Produtos.Remove(e);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static string? Validar(SalvarProduto body)
    {
        if (string.IsNullOrWhiteSpace(body.Nome)) return "Informe o nome do produto.";
        if (body.Valor < 0) return "O valor nao pode ser negativo.";
        if (!Enum.IsDefined(body.Unidade)) return "Escolha a unidade: metro, litro, quilo ou unidade.";
        return null;
    }
}
