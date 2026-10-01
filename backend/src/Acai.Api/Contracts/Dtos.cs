using Acai.Api.Domain;

namespace Acai.Api.Contracts;

public record CaixaResposta(decimal SaldoInicial, decimal Entradas, decimal Saidas, decimal Saldo);
public record AtualizarSaldoInicial(decimal SaldoInicial);
public record LancamentoResposta(int Id, DateOnly Data, TipoLancamento Tipo, string Descricao, decimal Valor, int? ServicoMaoObraId, string? ServicoNome, int? ProducaoMensalId);
public record CriarLancamento(DateOnly Data, TipoLancamento Tipo, string Descricao, decimal Valor, int? ServicoMaoObraId);
public record ServicoResposta(int Id, string Nome, decimal Valor);
public record SalvarServico(string Nome, decimal Valor);
public record ProdutoResposta(int Id, string Nome, decimal Valor);
public record SalvarProduto(string Nome, decimal Valor);
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
public record PlantasResposta(int QuantidadePequeno, int QuantidadeMedio, int QuantidadeGrande, int Total, int QuantidadeJaProduzem);
public record SalvarPlantas(int QuantidadePequeno, int QuantidadeMedio, int QuantidadeGrande, int QuantidadeJaProduzem);
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
