import type { ReactNode } from "react";

export default function ComoUsarPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <p style={{ letterSpacing: "0.14em", fontSize: 12, color: "#4a1c6b", margin: 0 }}>AJUDA</p>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 32, margin: "6px 0 8px" }}>Como usar o RR Açaí</h2>
      <p style={{ margin: "0 0 28px", opacity: 0.8 }}>
        Um sistema só: o que um lança, o outro vê. Para incluir algo, use o botão roxo; abre uma aba pequena, preencha e
        clique em <strong>Adicionar</strong>.
      </p>

      <Bloco n="1" titulo="Entrar">
        Abra o link do RR Açaí. Digite CPF e senha. Só o administrador cria gente nova (menu Usuarios).
      </Bloco>

      <Bloco n="2" titulo="Ordem do dia a dia">
        Cadastre preços em <strong>Mão de obra</strong> e <strong>Produtos</strong>. Informe as plantas em{" "}
        <strong>Plantas</strong>. A adubação usa esses pés e o preço do produto. Aí lance o mês em <strong>Produção</strong> e os gastos em <strong>Custos</strong>. O{" "}
        <strong>Painel</strong> mostra o resultado. O <strong>Caixa</strong> é o dinheiro.
      </Bloco>

      <Bloco n="3" titulo="Painel">
        Escolha o ano e o mês. Em cima: só o açaí (latas, custo para tirar e líquido). Embaixo: a operação completa
        (campo + mão de obra). Os gráficos comparam o ano.
      </Bloco>

      <Bloco n="4" titulo="Caixa">
        Saldo único. Coloque o saldo inicial uma vez. <strong>+ Lançar entrada</strong> é dinheiro que entra (aporte,
        venda extra). Gastos não se lançam aqui — vão em Custos. Produção já mexe no caixa sozinha.
      </Bloco>

      <Bloco n="5" titulo="Custos">
        Combustível e outros gastos avulsos saem do caixa pelo valor informado. Compra de material usa o produto
        cadastrado: informe a quantidade e, se o preço mudou, o valor do metro, litro, quilo ou unidade desta compra. O
        total é a quantidade vezes esse valor. Mão
        de obra pede quem fez, quantos dias a atividade levou, quantas pessoas trabalharam e o valor de cada pessoa por
        dia.
      </Bloco>

      <Bloco n="6" titulo="Mão de obra e Produtos">
        Mão de obra cadastra o serviço e o valor. Produtos cadastra cano, mangueira, veneno, adubo e o que for por
        unidade, com um preço sugerido do metro, litro, quilo ou unidade. A compra é lançada em <strong>Custos</strong>,
        e o valor da unidade pode ser ajustado naquela compra. Alterar o preço do cadastro <strong>não muda</strong> o
        que já foi lançado antes. Em Produtos, o histórico lista cada compra, com a data, a quantidade e o valor daquela vez.
      </Bloco>

      <Bloco n="7" titulo="Produção">
        Escolha o ano e o mês no filtro: a lista mostra só aquele mês, e os doze meses ficam disponíveis para trocar.
        Informe o dia em que o açaí foi tirado, a quantidade de latas, o valor da lata e o custo de cada lata. O total
        gasto é a quantidade vezes esse custo. O caixa recebe o valor e o custo nessa data. Pode lançar quantas
        produções quiser no mesmo dia. Errou algum dado? Use alterar na linha: o caixa acompanha. Excluir apaga só aquela linha.
        <strong> Casa</strong> é o açaí tirado para beber em casa: quantidade, dia, mês e quem tirou. Esse lançamento
        não entra no caixa.
      </Bloco>

      <Bloco n="8" titulo="Plantas">
        Médio e grande entram como uma unidade cada. Em Já produzem você informa o número já com a sua conta, com as
        palmeiras dobradas e as que têm três. A tabela segue só esse número. Cada açaizeira entra com 6 a 8 cachos no
        ano, e esse total se divide em trimestre, semestre, nove meses e ano.
      </Bloco>

      <Bloco n="9" titulo="Adubação">
        Pequeno, médio e grande têm o próprio adubo. Para cada tamanho, escolha o produto, quanto cada pé recebe no ano
        e em quantas vezes isso se divide. A aba mostra o que comprar em cada aplicação e o gasto.
      </Bloco>

      <Bloco n="10" titulo="Planejamento">
        Escolha o ano e se a vista é trimestral, semestral ou anual. Adicione a atividade do terreno naquele período.
      </Bloco>

      <Bloco n="11" titulo="Usuarios (só admin)">
        Nome, CPF e senha da outra pessoa. Quem já existe pode virar administrador pelo botão na lista. Ela precisa sair
        e entrar de novo para o menu aparecer.
      </Bloco>
    </div>
  );
}

function Bloco({ n, titulo, children }: { n: string; titulo: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 22, paddingBottom: 18, borderBottom: "1px solid #e4d9c8" }}>
      <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, margin: "0 0 6px" }}>
        <span style={{ color: "#4a1c6b", marginRight: 8 }}>{n}.</span>
        {titulo}
      </h3>
      <p style={{ margin: 0, lineHeight: 1.55 }}>{children}</p>
    </section>
  );
}
