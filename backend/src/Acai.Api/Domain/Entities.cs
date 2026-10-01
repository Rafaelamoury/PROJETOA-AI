namespace Acai.Api.Domain;

public class CaixaConfig
{
    public int Id { get; set; }
    public decimal SaldoInicial { get; set; }
}

public class ServicoMaoObra
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal Valor { get; set; }
}

public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public UnidadeProduto Unidade { get; set; } = UnidadeProduto.Unidade;
}

public class Lancamento
{
    public int Id { get; set; }
    public DateOnly Data { get; set; }
    public TipoLancamento Tipo { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public int? ServicoMaoObraId { get; set; }
    public ServicoMaoObra? ServicoMaoObra { get; set; }
    public int? ProducaoMensalId { get; set; }
    public ProducaoMensal? ProducaoMensal { get; set; }
    public int? DiasAtividade { get; set; }
    public string? PessoasDetalhe { get; set; }
    public int? ProdutoId { get; set; }
    public Produto? Produto { get; set; }
    public decimal? Quantidade { get; set; }
    public UnidadeProduto? UnidadeCompra { get; set; }
    public decimal? ValorUnitario { get; set; }
    public string? ProdutoNome { get; set; }
}

public class ProducaoMensal
{
    public int Id { get; set; }
    public int Ano { get; set; }
    public int Mes { get; set; }
    public int Dia { get; set; } = 1;
    public decimal QuantidadeLatas { get; set; }
    public decimal ValorLata { get; set; }
    public decimal CustosExtracao { get; set; }

    public decimal ValorBruto => QuantidadeLatas * ValorLata;
    public decimal ValorLiquido => ValorBruto - CustosExtracao;
    public decimal ValorProducao => ValorLiquido;
    public decimal? CustoPorLata => QuantidadeLatas > 0 ? CustosExtracao / QuantidadeLatas : null;
}

public class RetiradaCasa
{
    public int Id { get; set; }
    public int Ano { get; set; }
    public int Mes { get; set; }
    public int Dia { get; set; }
    public decimal Quantidade { get; set; }
    public string QuemTirou { get; set; } = string.Empty;
}

public class EstoquePlantas
{
    public int Id { get; set; }
    public int QuantidadePequeno { get; set; }
    public int QuantidadeMedio { get; set; }
    public int QuantidadeGrande { get; set; }
    public int QuantidadeJaProduzem { get; set; }
    public int CachosPorLata { get; set; }
    public int MesesParaMadurar { get; set; }
}

public class Usuario
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsAdmin { get; set; }
}

public class AtividadePlanejamento
{
    public int Id { get; set; }
    public int Ano { get; set; }
    public EscalaPlanejamento Escala { get; set; }
    public int Periodo { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Detalhe { get; set; }
}
