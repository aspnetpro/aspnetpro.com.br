/*
 * Textos e links da página de resultado do quiz Dev .NET IA.
 * Para trocar um link, edite só o objeto LINKS.
 * Versão 2 do quiz (2026-11-18): 4 perfis, blocos, alertas por motivo, inconsistências.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DiagnosticoConteudo = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // O resultado leva só ao workshop (decisão de 2026-11-17): o Dev .NET IA e a mentoria
  // são apresentados no workshop, não no quiz.
  var LINKS = {
    workshop: 'https://aspnetpro.com.br/workshop-dev-net-ia/',
    quiz: 'https://tally.so/r/bZqvge'
  };

  // Link de oferta com a origem do clique (o perfil que viu a oferta).
  function comUtm(href, perfilId) {
    return href + (href.indexOf('?') === -1 ? '?' : '&') +
      'utm_source=site&utm_medium=quiz&utm_campaign=dev-net-ia-dez26&utm_content=' + encodeURIComponent(perfilId);
  }

  // `max` é o limite superior de pontos do perfil. A página calcula o perfil pelos pontos
  // e nunca os exibe (decisão de 2026-11-18): mostra o perfil e as barras por bloco.
  var PERFIS = [
    { id: 'passageiro', nome: 'Passageiro', max: 17 },
    { id: 'piloto-sem-checklist', nome: 'Piloto sem checklist', max: 26 },
    { id: 'piloto-com-checklist', nome: 'Piloto com checklist', max: 32 },
    { id: 'comandante', nome: 'Comandante', max: 36 }
  ];

  var ROTULO_RESULTADO = '// seu resultado';
  var ROTULO_A_CONFIRMAR = '// resultado a confirmar';
  var ROTULO_PASSO = '// seu convite';

  // Linhas do workshop comuns a todas as telas.
  var WORKSHOP_MONO = '2 e 3 de dezembro · 20h · ao vivo · R$ 97';
  var WORKSHOP_NOTA = 'Os R$ 97 voltam como crédito se você seguir para o Dev .NET IA até 8 de dezembro. Na compra, o ebook Claude Code Essentials 2ª edição. Em 30 de novembro, o Kit Agêntico .NET com o projeto das aulas.';
  var WORKSHOP_CTA = { texto: 'Quero minha vaga no workshop · R$ 97', destino: 'workshop' };
  var WORKSHOP_PASSOS = [
    'Noite 1: defina os limites, dê o mapa e os instrumentos, e decole sem plano de voo',
    'Noite 2: trace o plano de voo e faça o checklist antes do pouso'
  ];

  // Uma tela por perfil.
  var TELAS = {
    'passageiro': {
      titulo: 'Você é Passageiro',
      texto: 'Você usa IA para consultar e gerar trechos de código. O agente ainda não trabalha com você do pedido até a entrega.',
      oferta: {
        convite: 'Saia do banco do passageiro. Venha pilotar.',
        texto: 'Em 2 noites ao vivo você troca o pede, cola e torce por um processo: você define os limites, a IA executa e você só aceita o que verificou. A mesma feature .NET duas vezes, no prompt solto e com SDD, e no fim você decide em qual assinaria embaixo.'
      }
    },
    'piloto-sem-checklist': {
      titulo: 'Você é Piloto sem checklist',
      texto: 'Você já usa o agente no dia a dia e entrega rápido. Falta processo: spec antes do código, testes que definem o pronto e revisão do que o agente fez.',
      oferta: {
        convite: 'O checklist que falta está no workshop.',
        texto: 'Você já pilota. Em 2 noites ao vivo você faz a mesma feature .NET duas vezes, no pede-e-ajusta e com SDD, e conta no repositório quantas decisões o agente tomou sozinho em cada uma.'
      }
    },
    'piloto-com-checklist': {
      titulo: 'Você é Piloto com checklist',
      texto: 'Você já tem processo: contexto, plano e revisão aparecem no seu trabalho com o agente. Só que ele ainda não cobre todas as etapas. As barras abaixo mostram onde ele afrouxa.',
      oferta: {
        convite: 'Checklist bom é o que você segue em todo voo.',
        texto: 'Em 2 noites ao vivo você faz a mesma feature .NET sem spec e com SDD (spec, plano, testes e verificação) e vê, decisão por decisão, onde o agente decide sozinho quando uma etapa fica de fora.'
      }
    },
    'comandante': {
      titulo: 'Você é Comandante',
      texto: 'Você conduz o agente com processo, do contexto à verificação. O próximo passo é levar esse padrão para o time: configuração versionada no repositório, o mesmo fluxo para todos e o CI barrando o que não passa.',
      oferta: {
        convite: 'Comandante também voa com checklist.',
        texto: 'Em 2 noites ao vivo você faz a mesma feature .NET sem spec e com SDD (spec, plano, testes e verificação) e compara as duas versões, decisão por decisão. Sai com os comandos /spec, /plano e /verificar do kit para usar no seu projeto.'
      }
    }
  };

  // Quem não usa agente (perfil_agente=nao): o perfil é uma projeção, nunca uma conquista.
  var SEM_AGENTE = {
    tituloPrefixo: 'Seu perfil projetado: ',
    texto: 'Você ainda não usa agente. O perfil mostra como você conduziria o trabalho, e o primeiro passo é colocar um agente num projeto real.'
  };

  // Blocos do quiz: máximo de pontos, nome de exibição, frase e ação para o bloco mais fraco.
  // A ordem do array é a prioridade de desempate (segurança primeiro).
  var BLOCOS = [
    { id: 'b_seguranca', max: 6, nome: 'Segurança e permissões',
      frase: 'O agente tem mais acesso do que precisa, ou o código dele passa sem checar autorização.',
      acao: 'Defina o que o agente roda livre e o que é proibido (secrets, produção, comandos destrutivos). Em todo endpoint com id, confira se o recurso pertence ao usuário logado.' },
    { id: 'b_verificacao', max: 6, nome: 'Verificação do que o agente entrega',
      frase: 'Você aceita o que o agente entrega pela palavra dele.',
      acao: 'No próximo diff, antes de commitar, procure teste alterado para passar, mock no lugar do que devia ser testado e exceção engolida.' },
    { id: 'b_especificacao', max: 9, nome: 'Especificação antes de pedir',
      frase: 'O agente decide a regra de negócio porque ela não estava escrita.',
      acao: 'Na próxima feature, escreva as regras, os casos de borda e os critérios de aceite, e peça um plano antes do código.' },
    { id: 'b_contexto', max: 9, nome: 'Contexto do agente',
      frase: 'O agente começa cada conversa sem saber do projeto, ou perde o fio quando a conversa cresce.',
      acao: 'Mantenha um arquivo de instruções no repositório com convenções, comandos de build e teste e o que nunca fazer. Quando a conversa crescer, registre o estado num arquivo e limpe o contexto.' },
    { id: 'b_arquitetura', max: 6, nome: 'Arquitetura e padronização',
      frase: 'Sem padrão documentado, o agente põe a regra onde achar.',
      acao: 'Documente as camadas e onde cada tipo de código fica. A tarefa que você repete toda semana vira um command ou uma skill.' }
  ];
  var ROTULO_BLOCOS = '// seus blocos';
  var ROTULO_GANHO = '// seu maior ganho está aqui';

  // Alertas por motivo (campo alerta_motivo do Tally). A ordem do objeto é a ordem de exibição.
  var ALERTAS = {
    permissao_total: 'Com tudo liberado, o agente pode mexer em secrets, produção e comandos destrutivos.',
    aprova_sem_ler: 'Aprovar sem ler equivale a deixar tudo liberado.',
    commit_sem_revisao: 'Commitar só porque o agente disse "testes passando" deixa passar teste alterado, mock no lugar errado e exceção engolida.',
    idor: '[Authorize] não basta. Sem checar se o pedido é do usuário logado, qualquer usuário lê o pedido de outro.',
    arquitetura_solta: 'Sem padrão documentado, a regra de negócio vai parar em qualquer camada.'
  };
  var ALERTA_GENERICO = 'Uma das suas respostas indica risco no uso do agente: acesso liberado demais ou código aceito sem revisão.';
  var ROTULO_ALERTA = '// atenção: risco no que você faz hoje';
  var ROTULO_ALERTA_SEM_AGENTE = '// atenção: quando você usar agente';
  var AVISO_TESTES = 'Sem testes, o "pronto" do agente é só a palavra dele. Comece pelo caminho principal da próxima feature que ele fizer.';

  var INCONSISTENCIA = 'Algumas respostas apontam para lados diferentes (por exemplo, configuração avançada sem uso de agente). Vale refazer pensando no seu dia a dia real. O último envio é o que vale.';
  var INCONSISTENCIA_LINK = 'Refazer o quiz';

  // Ponte entre a dor (P3 do quiz, campo `dor` na URL) e a oferta. Sem `dor` válida, a tela não mostra o bloco.
  var ROTULO_DOR = '// o que você respondeu';
  var DORES = {
    ordem: 'Você disse que estuda muito e não sabe o que falta nem em que ordem. Para trabalhar com agente, a ordem é curta: contexto do projeto, spec, testes e só então o código. É essa ordem que você vê aplicada, do começo ao fim, numa feature .NET.',
    nivel: 'Você disse que faz mais que o time e continua no mesmo nível. Velocidade com IA o time inteiro já tem. O que aparece numa revisão é o critério: o que você decidiu, o que o agente fez sozinho e como você verificou.',
    confianca: 'Você disse que não confia no código que o agente entrega. Faz sentido: sem spec e sem teste antes, ninguém sabe o que ele decidiu sozinho. O caminho é registrar a regra antes e verificar o diff depois.',
    prazo: 'Você disse que tem um projeto real travado e com prazo. Com prazo apertado, cada rodada de pede-e-ajusta custa mais caro. Spec e testes antes do código são o que evita refazer a mesma feature.'
  };

  // Complemento da oferta por projeto (P4) e por nível (P1). A oferta é sempre o workshop.
  var PROJETO = {
    nao: 'Não tem projeto real agora? O workshop usa o Kit Agêntico .NET, o projeto das aulas: você pratica guiado e leva o fluxo pronto para o primeiro projeto que aparecer.',
    com_prazo: 'Com prazo, o que você vê na primeira noite já serve para a próxima feature do seu projeto real.'
  };
  var NIVEL = {
    lead: 'Como tech lead, o ganho maior está no time: instruções e commands versionados no repositório, hooks que barram o que é proibido e verificação no CI.'
  };

  var DESTINO_DO_LINK = { workshop: 'workshop' };

  function ctaPronto(cta, perfilId) {
    return {
      texto: cta.texto,
      href: comUtm(LINKS[cta.destino], perfilId),
      destino: DESTINO_DO_LINK[cta.destino]
    };
  }

  function tem(obj, k) { return k != null && Object.prototype.hasOwnProperty.call(obj, k); }

  // Bloco mais fraco: menor percentual; empate resolvido pela ordem de BLOCOS.
  // Todos no máximo: não há "maior ganho".
  function blocosDe(valores) {
    if (!valores) return null;
    var lista = [];
    for (var i = 0; i < BLOCOS.length; i++) {
      var b = BLOCOS[i];
      var v = valores[b.id];
      if (typeof v !== 'number' || v < 0 || v > b.max) return null;
      var pct = Math.round(v * 100 / b.max);
      // Estado em palavra, para a barra não depender só da cor nem exibir número.
      lista.push({ id: b.id, nome: b.nome, pct: pct, estado: pct >= 80 ? 'sólido' : pct >= 50 ? 'em construção' : 'frágil' });
    }
    var fraco = null;
    for (var j = 0; j < lista.length; j++) if (lista[j].pct < 100 && (!fraco || lista[j].pct < fraco.pct)) fraco = lista[j];
    var ganho = null;
    if (fraco) {
      for (var k = 0; k < BLOCOS.length; k++) if (BLOCOS[k].id === fraco.id) ganho = { nome: BLOCOS[k].nome, frase: BLOCOS[k].frase, acao: BLOCOS[k].acao };
    }
    return { rotulo: ROTULO_BLOCOS, lista: lista, rotuloGanho: ROTULO_GANHO, ganho: ganho };
  }

  /*
   * Tela pronta para renderizar. Não recebe pontos, então não tem como exibi-los.
   * d: { perfilId, dor, alerta, motivos[], avisoTestes, inconsistencias, perfilAgente, blocos{}, nivel, projeto }
   * Todo campo de `d` já chega validado pelo core (ou null).
   */
  function telaDe(d) {
    var perfil = null;
    for (var i = 0; i < PERFIS.length; i++) if (PERFIS[i].id === d.perfilId) perfil = PERFIS[i];
    var t = TELAS[d.perfilId];
    var semAgente = d.perfilAgente === 'nao';
    var aConfirmar = d.inconsistencias != null && d.inconsistencias >= 2;

    var tela = {
      rotulo: aConfirmar ? ROTULO_A_CONFIRMAR : ROTULO_RESULTADO,
      titulo: semAgente ? SEM_AGENTE.tituloPrefixo + perfil.nome
        : aConfirmar ? 'Você parece ' + perfil.nome : t.titulo,
      texto: semAgente ? SEM_AGENTE.texto : t.texto,
      rotuloOferta: ROTULO_PASSO
    };

    if (d.inconsistencias != null && d.inconsistencias >= 1) {
      tela.inconsistencia = { texto: INCONSISTENCIA, link: { texto: INCONSISTENCIA_LINK, href: LINKS.quiz } };
    }

    var motivos = (d.motivos || []).filter(function (m) { return tem(ALERTAS, m); });
    if (motivos.length || d.alerta === 'sim') {
      tela.alerta = {
        rotulo: semAgente ? ROTULO_ALERTA_SEM_AGENTE : ROTULO_ALERTA,
        itens: motivos.length ? motivos.map(function (m) { return ALERTAS[m]; }) : [ALERTA_GENERICO]
      };
    }
    if (d.avisoTestes === 'sim') tela.avisoTestes = AVISO_TESTES;

    var blocos = blocosDe(d.blocos);
    if (blocos) tela.blocos = blocos;

    if (tem(DORES, d.dor)) {
      tela.rotuloDor = ROTULO_DOR;
      tela.dor = DORES[d.dor];
    }

    var extras = [];
    if (tem(PROJETO, d.projeto)) extras.push(PROJETO[d.projeto]);
    if (tem(NIVEL, d.nivel)) extras.push(NIVEL[d.nivel]);

    tela.oferta = {
      titulo: 'Workshop Dev .NET IA', convite: t.oferta.convite, passos: WORKSHOP_PASSOS.slice(),
      texto: t.oferta.texto, extras: extras, linhaMono: WORKSHOP_MONO, nota: WORKSHOP_NOTA,
      cta: ctaPronto(WORKSHOP_CTA, d.perfilId)
    };
    return tela;
  }

  var SEM_RESULTADO = {
    rotulo: '// diagnóstico de engenharia agêntica',
    titulo: 'Não encontrei o seu resultado',
    texto: 'O link pode ter sido cortado ou alterado. Faça o quiz para ver o seu perfil. Leva uns 5 minutos.',
    cta: { texto: 'Fazer o quiz', href: LINKS.quiz },
    secundario: { texto: 'Ou veja direto o Workshop Dev .NET IA, 2 e 3 de dezembro', href: comUtm(LINKS.workshop, 'sem-resultado') }
  };

  return {
    LINKS: LINKS, PERFIS: PERFIS, TELAS: TELAS, BLOCOS: BLOCOS, ALERTAS: ALERTAS, ALERTA_GENERICO: ALERTA_GENERICO,
    AVISO_TESTES: AVISO_TESTES, INCONSISTENCIA: INCONSISTENCIA, DORES: DORES, PROJETO: PROJETO, NIVEL: NIVEL,
    SEM_AGENTE: SEM_AGENTE, SEM_RESULTADO: SEM_RESULTADO,
    telaDe: telaDe, comUtm: comUtm
  };
});
