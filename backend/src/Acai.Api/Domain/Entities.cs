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
}

public class ProducaoMensal
{
    public int Id { get; set; }
    public int Ano { get; set; }
    public int Mes { get; set; }
    public decimal QuantidadeLatas { get; set; }
    public decimal ValorLata { get; set; }
    public decimal CustosExtracao { get; set; }

    public decimal ValorBruto => QuantidadeLatas * ValorLata;
    public decimal ValorLiquido => ValorBruto - CustosExtracao;
    public decimal ValorProducao => ValorLiquido;
    public decimal? CustoPorLata => QuantidadeLatas > 0 ? CustosExtracao / QuantidadeLatas : null;
}

public class EstoquePlantas
{
    public int Id { get; set; }
    public int QuantidadePequeno { get; set; }
    public int QuantidadeMedio { get; set; }
    public int QuantidadeGrande { get; set; }
    public int QuantidadeJaProduzem { get; set; }
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
