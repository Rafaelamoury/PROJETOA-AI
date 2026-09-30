export type Caixa = {
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldo: number;
};

export type Plantas = {
  quantidadePequeno: number;
  quantidadeMedio: number;
  quantidadeGrande: number;
  total: number;
  quantidadeJaProduzem: number;
};

export type Producao = {
  id: number;
  ano: number;
  mes: number;
  quantidadeLatas: number;
  valorLata: number;
  custosExtracao: number;
  custoTotal: number;
  valorBruto: number;
  valorLiquido: number;
  valorProducao: number;
  custoPorLata: number | null;
};

export type MesOperacao = {
  mes: number;
  nome: string;
  latas: number;
  receita: number;
  custoExtracao: number;
  custosCampo: number;
  maoObra: number;
  custos: number;
  lucro: number;
  margemPercentual: number | null;
  custoPorLata: number | null;
};

export type Painel = {
  ano: number;
  mes: number;
  anos: number[];
  destacado: MesOperacao;
  anoResumo: MesOperacao;
  meses: MesOperacao[];
};

export type Lancamento = {
  id: number;
  data: string;
  tipo: string;
  descricao: string;
  valor: number;
  servicoMaoObraId: number | null;
  servicoNome: string | null;
  producaoMensalId: number | null;
};

export type Servico = { id: number; nome: string; valor: number };
export type Produto = { id: number; nome: string; valor: number };
