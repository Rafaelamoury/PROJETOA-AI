using Acai.Api.Contracts;
using Acai.Api.Data;
using Acai.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Controllers;

[ApiController]
[Route("api/adubacao")]
public class AdubacaoController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<AdubacaoResposta>> Get(CancellationToken ct)
    {
        var plano = await db.Adubacoes.FirstAsync(ct);
        return await Montar(plano, ct);
    }

    [HttpPut]
    public async Task<ActionResult<AdubacaoResposta>> Put(SalvarAdubacao body, CancellationToken ct)
    {
        if (Negativo(body.Pequeno) || Negativo(body.Medio) || Negativo(body.Grande))
            return BadRequest(new { erro = "A quantidade e o numero de adubacoes nao podem ser negativos." });

        var pequeno = await ProdutoDaFaixa(body.Pequeno, ct);
        var medio = await ProdutoDaFaixa(body.Medio, ct);
        var grande = await ProdutoDaFaixa(body.Grande, ct);
        if (pequeno.erro is not null) return BadRequest(new { erro = pequeno.erro });
        if (medio.erro is not null) return BadRequest(new { erro = medio.erro });
        if (grande.erro is not null) return BadRequest(new { erro = grande.erro });

        var plano = await db.Adubacoes.FirstAsync(ct);
        plano.ProdutoIdPequeno = pequeno.produto?.Id;
        plano.QuantidadePorPlantaPequeno = body.Pequeno.QuantidadePorPlanta;
        plano.AplicacoesPequeno = body.Pequeno.AplicacoesNoAno;
        plano.ProdutoIdMedio = medio.produto?.Id;
        plano.QuantidadePorPlantaMedio = body.Medio.QuantidadePorPlanta;
        plano.AplicacoesMedio = body.Medio.AplicacoesNoAno;
        plano.ProdutoIdGrande = grande.produto?.Id;
        plano.QuantidadePorPlantaGrande = body.Grande.QuantidadePorPlanta;
        plano.AplicacoesGrande = body.Grande.AplicacoesNoAno;
        await db.SaveChangesAsync(ct);
        return await Montar(plano, ct);
    }

    private async Task<AdubacaoResposta> Montar(Adubacao plano, CancellationToken ct)
    {
        var plantas = await db.EstoquesPlantas.AsNoTracking().FirstAsync(ct);
        var produtos = await db.Produtos.AsNoTracking().ToListAsync(ct);
        var pequeno = Faixa("Pequeno", plantas.QuantidadePequeno, plano.ProdutoIdPequeno, plano.QuantidadePorPlantaPequeno, plano.AplicacoesPequeno, produtos);
        var medio = Faixa("Médio", plantas.QuantidadeMedio, plano.ProdutoIdMedio, plano.QuantidadePorPlantaMedio, plano.AplicacoesMedio, produtos);
        var grande = Faixa("Grande", plantas.QuantidadeGrande, plano.ProdutoIdGrande, plano.QuantidadePorPlantaGrande, plano.AplicacoesGrande, produtos);
        return new(pequeno, medio, grande, Somar(pequeno.GastoAplicacao, medio.GastoAplicacao, grande.GastoAplicacao), Somar(pequeno.GastoAno, medio.GastoAno, grande.GastoAno));
    }

    private static FaixaAdubacao Faixa(string tamanho, int plantas, int? produtoId, decimal quantidadePorPlanta, int aplicacoes, List<Produto> produtos)
    {
        var produto = produtoId is int id ? produtos.FirstOrDefault(p => p.Id == id) : null;
        var pes = Math.Max(0, plantas);
        var porPlanta = Math.Max(0, quantidadePorPlanta);
        var vezes = Math.Max(0, aplicacoes);
        var totalAno = pes * porPlanta;
        var porAplicacao = vezes > 0 ? Math.Round(totalAno / vezes, 2) : 0m;
        var porPlantaNaAplicacao = vezes > 0 ? Math.Round(porPlanta / vezes, 2) : 0m;
        decimal? gastoAplicacao = produto is null ? null : Math.Round(porAplicacao * produto.Valor, 2);
        decimal? gastoAno = produto is null ? null : Math.Round(totalAno * produto.Valor, 2);
        return new(
            tamanho,
            pes,
            produto?.Id,
            produto?.Nome,
            produto?.Unidade,
            produto?.Valor,
            porPlanta,
            vezes,
            totalAno,
            porAplicacao,
            porPlantaNaAplicacao,
            gastoAplicacao,
            gastoAno);
    }

    private async Task<(Produto? produto, string? erro)> ProdutoDaFaixa(SalvarFaixaAdubacao faixa, CancellationToken ct)
    {
        if (faixa.ProdutoId is not int id) return (null, null);
        var produto = await db.Produtos.FindAsync([id], ct);
        return produto is null ? (null, "Produto nao encontrado.") : (produto, null);
    }

    private static bool Negativo(SalvarFaixaAdubacao faixa) => faixa.QuantidadePorPlanta < 0 || faixa.AplicacoesNoAno < 0;

    private static decimal? Somar(params decimal?[] valores)
    {
        if (valores.All(v => v is null)) return null;
        return Math.Round(valores.Sum(v => v ?? 0m), 2);
    }
}
