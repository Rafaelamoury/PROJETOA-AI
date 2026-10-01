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
        <strong>Plantas</strong>. Aí lance o mês em <strong>Produção</strong> e os gastos em <strong>Custos</strong>. O{" "}
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
        Combustível, adubo, diária. Escolha custo operacional ou mão de obra (aí aparece o serviço cadastrado). O valor
        sai do caixa na hora.
      </Bloco>

      <Bloco n="6" titulo="Mão de obra e Produtos">
        Incluir, alterar ou excluir o cadastro. Alterar o preço <strong>não muda</strong> o que já foi lançado antes.
      </Bloco>

      <Bloco n="7" titulo="Produção">
        Informe o dia em que o açaí foi tirado, a quantidade de latas, o valor da lata e o custo total. O caixa recebe o
        valor e o custo nessa data. Pode lançar vários dias no mesmo mês. Errou algum dado? Use alterar na linha: o caixa
        acompanha. Excluir apaga o lançamento daquele dia.
      </Bloco>

      <Bloco n="8" titulo="Plantas">
        Quantos pés pequeno, médio e grande, e quantos já produzem. Não é fruta colhida — é o campo.
      </Bloco>

      <Bloco n="9" titulo="Planejamento">
        Escolha o ano e se a vista é trimestral, semestral ou anual. Adicione a atividade do terreno naquele período.
      </Bloco>

      <Bloco n="10" titulo="Usuarios (só admin)">
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
