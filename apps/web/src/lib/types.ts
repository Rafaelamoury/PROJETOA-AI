export type Caixa = {
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldo: number;
};

export type PrevisaoPlantio = {
  meses: number;
  periodo: string;
  cachos: number;
  latas: number;
  valorMedioLata: number | null;
  faturamento: number | null;
  valorDaMediaGeral: boolean;
};

export type Plantas = {
  quantidadePequeno: number;
  quantidadeMedio: number;
  quantidadeGrande: number;
  total: number;
  quantidadeJaProduzem: number;
  cachosPorLata: number;
  mesesParaMadurar: number;
  palmeirasPorPe: number;
  pesComTresPalmeiras: number;
  mesesEntreCachos: number;
  palmeiras: number;
  previsoes: PrevisaoPlantio[];
};

export type Producao = {
  id: number;
  ano: number;
  mes: number;
  dia: number;
  quantidadeLatas: number;
  valorLata: number;
  custosExtracao: number;
  custoTotal: number;
  valorBruto: number;
  valorLiquido: number;
  valorProducao: number;
  custoPorLata: number | null;
};

export type RetiradaCasa = {
  id: number;
  ano: number;
  mes: number;
  dia: number;
  quantidade: number;
  quemTirou: string;
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

export type PessoaMaoObra = { nome: string; valor: number };

export type Lancamento = {
  id: number;
  data: string;
  tipo: string;
  descricao: string;
  valor: number;
  servicoMaoObraId: number | null;
  servicoNome: string | null;
  producaoMensalId: number | null;
  diasAtividade: number | null;
  pessoas: PessoaMaoObra[] | null;
  produtoId: number | null;
  produtoNome: string | null;
  quantidade: number | null;
  unidade: "Metro" | "Litro" | "Quilo" | "Unidade" | null;
  valorUnitario: number | null;
};

export type Servico = { id: number; nome: string; valor: number };
export type Produto = {
  id: number;
  nome: string;
  valor: number;
  unidade: "Metro" | "Litro" | "Quilo" | "Unidade";
};
