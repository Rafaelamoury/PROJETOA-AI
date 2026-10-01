using System.Text.Json;
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
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LancamentoResposta>>> List(CancellationToken ct)
    {
        var items = await db.Lancamentos.AsNoTracking()
            .Include(l => l.ServicoMaoObra)
            .OrderByDescending(l => l.Data)
            .ThenByDescending(l => l.Id)
            .ToListAsync(ct);

        return items.Select(Map).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<LancamentoResposta>> Create(CriarLancamento body, CancellationToken ct)
    {
        if (body.Valor < 0) return BadRequest(new { erro = "Valor nao pode ser negativo." });

        ServicoMaoObra? servico = null;
        if (body.ServicoMaoObraId is int sid)
        {
            servico = await db.ServicosMaoObra.FindAsync([sid], ct);
            if (servico is null) return BadRequest(new { erro = "Servico de mao de obra nao encontrado." });
        }

        var entity = new Lancamento
        {
            Data = body.Data,
            Tipo = body.Tipo,
            ServicoMaoObraId = body.ServicoMaoObraId
        };

        if (body.Tipo == TipoLancamento.MaoObra)
        {
            var erro = PrepararMaoObra(body, entity, servico?.Nome);
            if (erro is not null) return BadRequest(new { erro });
        }
        else if (body.ProdutoId is int produtoId)
        {
            var produto = await db.Produtos.FindAsync([produtoId], ct);
            if (produto is null) return BadRequest(new { erro = "Produto nao encontrado." });
            var erro = PrepararCompra(body, entity, produto);
            if (erro is not null) return BadRequest(new { erro });
        }
        else
        {
            if (string.IsNullOrWhiteSpace(body.Descricao)) return BadRequest(new { erro = "Descricao obrigatoria." });
            entity.Descricao = body.Descricao.Trim();
            entity.Valor = body.Valor;
        }

        db.Lancamentos.Add(entity);
        await db.SaveChangesAsync(ct);
        entity.ServicoMaoObra = servico;

        return CreatedAtAction(nameof(List), Map(entity));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var entity = await db.Lancamentos.FindAsync([id], ct);
        if (entity is null) return NotFound();
        if (entity.ProducaoMensalId is not null)
            return BadRequest(new { erro = "Este lancamento veio da producao. Exclua a data em Producao." });
        db.Lancamentos.Remove(entity);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static string? PrepararMaoObra(CriarLancamento body, Lancamento entity, string? servicoNome)
    {
        if (body.DiasAtividade is null or < 1 or > 366)
            return "Informe quantos dias a atividade levou.";
        if (body.Pessoas is null || body.Pessoas.Count is < 1 or > 30)
            return "Informe quantas pessoas fizeram o servico.";

        var pessoas = new List<PessoaMaoObraItem>();
        foreach (var pessoa in body.Pessoas)
        {
            var nome = pessoa.Nome?.Trim() ?? "";
            if (nome.Length is < 1 or > 80) return "Informe o nome de quem fez o servico.";
            if (pessoa.Valor < 0) return "O valor por pessoa nao pode ser negativo.";
            pessoas.Add(new PessoaMaoObraItem(nome, pessoa.Valor));
        }

        var dias = body.DiasAtividade.Value;
        entity.DiasAtividade = dias;
        entity.PessoasDetalhe = JsonSerializer.Serialize(pessoas, Json);
        entity.Valor = Math.Round(pessoas.Sum(p => p.Valor) * dias, 2);
        if (string.IsNullOrWhiteSpace(body.Descricao))
        {
            var atividade = string.IsNullOrWhiteSpace(servicoNome) ? "Mao de obra" : servicoNome.Trim();
            entity.Descricao = $"{atividade}: {string.Join(", ", pessoas.Select(p => p.Nome))}";
        }
        else
        {
            entity.Descricao = body.Descricao.Trim();
        }

        return null;
    }

    private static string? PrepararCompra(CriarLancamento body, Lancamento entity, Produto produto)
    {
        if (body.Tipo != TipoLancamento.CustoOperacional)
            return "A compra de produto entra como custo operacional.";
        if (body.Quantidade is null or <= 0) return "Informe a quantidade comprada.";
        var unitario = body.ValorUnitario ?? produto.Valor;
        if (unitario < 0) return "O valor da unidade nao pode ser negativo.";

        var quantidade = body.Quantidade.Value;
        entity.ProdutoId = produto.Id;
        entity.ProdutoNome = produto.Nome;
        entity.Quantidade = quantidade;
        entity.UnidadeCompra = produto.Unidade;
        entity.ValorUnitario = unitario;
        entity.Valor = Math.Round(quantidade * unitario, 2);
        entity.Descricao = string.IsNullOrWhiteSpace(body.Descricao)
            ? $"{produto.Nome}: {quantidade.ToString("0.##", System.Globalization.CultureInfo.GetCultureInfo("pt-BR"))} {NomeUnidade(produto.Unidade)}"
            : body.Descricao.Trim();
        return null;
    }

    private static string NomeUnidade(UnidadeProduto unidade) => unidade switch
    {
        UnidadeProduto.Metro => "m",
        UnidadeProduto.Litro => "L",
        UnidadeProduto.Quilo => "kg",
        _ => "un"
    };

    private static LancamentoResposta Map(Lancamento l) =>
        new(l.Id, l.Data, l.Tipo, l.Descricao, l.Valor, l.ServicoMaoObraId, l.ServicoMaoObra?.Nome, l.ProducaoMensalId,
            l.DiasAtividade, LerPessoas(l.PessoasDetalhe), l.ProdutoId, l.ProdutoNome, l.Quantidade, l.UnidadeCompra, l.ValorUnitario);

    private static List<PessoaMaoObraItem>? LerPessoas(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        try
        {
            return JsonSerializer.Deserialize<List<PessoaMaoObraItem>>(json, Json);
        }
        catch (JsonException)
        {
            return null;
        }
    }
}
