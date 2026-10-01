const frases = [
  "Cada cacho que nasce hoje é a lata de amanhã.",
  "O terreno responde a quem aparece todo dia.",
  "Safra boa se constrói no mês sem pressa.",
  "Um pé de cada vez, o açaizal fica inteiro.",
  "Quem anota o gasto enxerga o lucro.",
  "O cacho maduro não espera. O cuidado também não.",
  "Constância no campo vale mais que um dia de pressa.",
  "A terra devolve o que recebe com atenção.",
  "Hoje é um bom dia para deixar o sítio melhor do que encontrou.",
  "A média do ano nasce do que se faz neste mês.",
  "Pé que produz pede presença, não só espera.",
  "O caixa conta a verdade de quem lançou certo.",
  "Colher bem começa muito antes do dia da lata.",
  "O semestre se ganha nos dias comuns.",
  "Há fruto maduro para quem acompanhou o tempo.",
  "Trabalhar o plantio é cuidar do que ainda não se vê.",
  "Um lançamento honesto hoje evita surpresa no fim do mês.",
  "A chuva passa. O açaizal bem cuidado fica.",
  "Quem conhece cada fase do plantio decide melhor.",
  "O dia rende quando o serviço tem dono.",
  "Paciência com o cacho, firmeza com a rotina.",
  "O sítio cresce no ritmo de quem não abandona a tarefa.",
  "Valor justo da lata começa na conta certa.",
  "Cada mês bem fechado deixa o ano mais leve.",
  "O açaí não apressa. Quem cuida chega junto.",
  "Mão na terra, olho no caixa, coração no plantio.",
  "O que se planta com ordem se colhe com clareza.",
  "Hoje o campo pede o próximo passo, não o ano inteiro.",
  "Quem mede o cacho não se perde na lata.",
  "A safra agradece quem voltou no dia seguinte.",
  "Firme no serviço, o resultado aparece na conta.",
];

export function fraseDoDia(agora = new Date()) {
  const data = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
  const [ano, mes, dia] = data.split("-").map(Number);
  const ordinal = Math.floor((Date.UTC(ano, mes - 1, dia) - Date.UTC(ano, 0, 1)) / 86400000);
  return frases[ordinal % frases.length];
}
