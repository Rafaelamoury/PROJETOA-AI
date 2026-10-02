using Acai.Api.Domain;

namespace Acai.Api.Contracts;

public record CaixaResposta(decimal SaldoInicial, decimal Entradas, decimal Saidas, decimal Saldo);
public record AtualizarSaldoInicial(decimal SaldoInicial);
public record PessoaMaoObraItem(string Nome, decimal Valor);
public record LancamentoResposta(
    int Id,
    DateOnly Data,
    TipoLancamento Tipo,
    string Descricao,
    decimal Valor,
    int? ServicoMaoObraId,
    string? ServicoNome,
    int? ProducaoMensalId,
    int? DiasAtividade,
    IReadOnlyList<PessoaMaoObraItem>? Pessoas,
    int? ProdutoId,
    string? ProdutoNome,
    decimal? Quantidade,
    UnidadeProduto? Unidade,
    decimal? ValorUnitario);
public record CriarLancamento(
    DateOnly Data,
    TipoLancamento Tipo,
    string Descricao,
    decimal Valor,
    int? ServicoMaoObraId,
    int? DiasAtividade = null,
    List<PessoaMaoObraItem>? Pessoas = null,
    int? ProdutoId = null,
    decimal? Quantidade = null,
    decimal? ValorUnitario = null);
public record ServicoResposta(int Id, string Nome, decimal Valor);
public record SalvarServico(string Nome, decimal Valor);
public record ProdutoResposta(int Id, string Nome, decimal Valor, UnidadeProduto Unidade);
public record SalvarProduto(string Nome, decimal Valor, UnidadeProduto Unidade);
public record FaixaAdubacao(
    string Tamanho,
    int Plantas,
    int? ProdutoId,
    string? ProdutoNome,
    UnidadeProduto? Unidade,
    decimal? ValorUnitario,
    decimal QuantidadePorPlanta,
    int AplicacoesNoAno,
    decimal TotalAno,
    decimal PorAplicacao,
    decimal PorPlantaNaAplicacao,
    decimal? GastoAplicacao,
    decimal? GastoAno);
public record AdubacaoResposta(
    FaixaAdubacao Pequeno,
    FaixaAdubacao Medio,
    FaixaAdubacao Grande,
    decimal? GastoAplicacao,
    decimal? GastoAno);
public record SalvarFaixaAdubacao(int? ProdutoId, decimal QuantidadePorPlanta, int AplicacoesNoAno);
public record SalvarAdubacao(SalvarFaixaAdubacao Pequeno, SalvarFaixaAdubacao Medio, SalvarFaixaAdubacao Grande);
public record ProducaoResposta(
    int Id,
    int Ano,
    int Mes,
    int Dia,
    decimal QuantidadeLatas,
    decimal ValorLata,
    decimal CustosExtracao,
    decimal CustoTotal,
    decimal ValorBruto,
    decimal ValorLiquido,
    decimal ValorProducao,
    decimal? CustoPorLata);
public record SalvarProducao(DateOnly Data, decimal QuantidadeLatas, decimal ValorLata, decimal CustosExtracao);
public record CasaResposta(int Id, int Ano, int Mes, int Dia, decimal Quantidade, string QuemTirou);
public record SalvarCasa(DateOnly Data, decimal Quantidade, string QuemTirou);
public record PrevisaoPlantio(
    int Meses,
    string Periodo,
    decimal Cachos,
    decimal Latas,
    decimal? ValorMedioLata,
    decimal? Faturamento,
    bool ValorDaMediaGeral);
public record PlantasResposta(
    int QuantidadePequeno,
    int QuantidadeMedio,
    int QuantidadeGrande,
    int Total,
    int QuantidadeJaProduzem,
    int CachosPorLata,
    int MesesParaMadurar,
    int PalmeirasPorPe,
    int PesComTresPalmeiras,
    int MesesEntreCachos,
    int Palmeiras,
    IReadOnlyList<PrevisaoPlantio> Previsoes);
public record SalvarPlantas(
    int QuantidadePequeno,
    int QuantidadeMedio,
    int QuantidadeGrande,
    int QuantidadeJaProduzem,
    int CachosPorLata,
    int MesesParaMadurar,
    int PalmeirasPorPe,
    int PesComTresPalmeiras,
    int MesesEntreCachos);
public record MesOperacaoResposta(
    int Mes,
    string Nome,
    decimal Latas,
    decimal Receita,
    decimal CustoExtracao,
    decimal CustosCampo,
    decimal MaoObra,
    decimal Custos,
    decimal Lucro,
    decimal? MargemPercentual,
    decimal? CustoPorLata);
public record PainelOperacaoResposta(
    int Ano,
    int Mes,
    IReadOnlyList<int> Anos,
    MesOperacaoResposta Destacado,
    MesOperacaoResposta AnoResumo,
    IReadOnlyList<MesOperacaoResposta> Meses);
public record LoginPedido(string Cpf, string Senha);
public record LoginResposta(string Token, string Nome, string Cpf, bool IsAdmin);
public record UsuarioResposta(int Id, string Nome, string Cpf, bool IsAdmin);
public record CriarUsuarioPedido(string Nome, string Cpf, string Senha, bool IsAdmin);
public record AlterarAdminPedido(bool IsAdmin);
public record AtividadePlanejamentoResposta(int Id, int Ano, EscalaPlanejamento Escala, int Periodo, string Titulo, string? Detalhe);
public record SalvarAtividadePlanejamento(int Ano, EscalaPlanejamento Escala, int Periodo, string Titulo, string? Detalhe);
