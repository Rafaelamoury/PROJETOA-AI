using Acai.Api.Contracts;
using Acai.Api.Data;
using Acai.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Acai.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok", servico = "Acai.Api" });
}

[ApiController]
[Route("api/painel")]
public class PainelController(AppDbContext db) : ControllerBase
{
    private static readonly string[] NomesMes =
    [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    [HttpGet]
    public async Task<ActionResult<PainelOperacaoResposta>> Get([FromQuery] int? ano, [FromQuery] int? mes, CancellationToken ct)
    {
        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var y = ano is > 2000 and < 2100 ? ano.Value : hoje.Year;
        var m = mes is >= 1 and <= 12 ? mes.Value : hoje.Month;

        var lancamentos = await db.Lancamentos.AsNoTracking()
            .Where(l => l.Data.Year == y)
            .ToListAsync(ct);
        var producoes = await db.ProducoesMensais.AsNoTracking()
            .Where(p => p.Ano == y)
            .ToListAsync(ct);

        var meses = Enumerable.Range(1, 12).Select(mesNum =>
        {
            var prod = producoes.FirstOrDefault(p => p.Mes == mesNum);
            var doMes = lancamentos.Where(l => l.Data.Month == mesNum).ToList();
            var latas = prod?.QuantidadeLatas ?? 0;
            var receita = prod?.ValorBruto ?? 0;
            var extracao = prod?.CustosExtracao ?? 0;
            var campo = doMes
                .Where(l => l.Tipo == TipoLancamento.CustoOperacional && l.ProducaoMensalId == null)
                .Sum(l => l.Valor);
            var mao = doMes.Where(l => l.Tipo == TipoLancamento.MaoObra).Sum(l => l.Valor);
            var custos = extracao + campo + mao;
            var lucro = receita - custos;
            decimal? margem = receita > 0 ? Math.Round(lucro / receita * 100, 1) : null;
            decimal? custoLata = latas > 0 ? Math.Round(custos / latas, 2) : null;
            return new MesOperacaoResposta(mesNum, NomesMes[mesNum - 1], latas, receita, extracao, campo, mao, custos, lucro, margem, custoLata);
        }).ToList();

        var destacado = meses[m - 1];
        var anoResumo = Somar(meses, y);
        var anos = await AnosDisponiveis(db, hoje.Year, ct);

        return new PainelOperacaoResposta(y, m, anos, destacado, anoResumo, meses);
    }

    private static MesOperacaoResposta Somar(List<MesOperacaoResposta> meses, int ano)
    {
        var latas = meses.Sum(x => x.Latas);
        var receita = meses.Sum(x => x.Receita);
        var extracao = meses.Sum(x => x.CustoExtracao);
        var campo = meses.Sum(x => x.CustosCampo);
        var mao = meses.Sum(x => x.MaoObra);
        var custos = extracao + campo + mao;
        var lucro = receita - custos;
        decimal? margem = receita > 0 ? Math.Round(lucro / receita * 100, 1) : null;
        decimal? custoLata = latas > 0 ? Math.Round(custos / latas, 2) : null;
        return new MesOperacaoResposta(0, $"Ano {ano}", latas, receita, extracao, campo, mao, custos, lucro, margem, custoLata);
    }

    private static async Task<List<int>> AnosDisponiveis(AppDbContext db, int anoAtual, CancellationToken ct)
    {
        var deProducao = await db.ProducoesMensais.Select(p => p.Ano).Distinct().ToListAsync(ct);
        var deLanc = await db.Lancamentos.Select(l => l.Data.Year).Distinct().ToListAsync(ct);
        return deProducao.Concat(deLanc).Append(anoAtual).Distinct().OrderByDescending(x => x).ToList();
    }
}
