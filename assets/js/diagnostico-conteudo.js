/*
 * Textos e links da página de resultado do quiz Dev .NET IA.
 * Para trocar um link, edite só o objeto LINKS.
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

  // `max` é o limite superior da faixa de pontos.
  var PERFIS = [
    { id: 'passageiro', nome: 'Passageiro', max: 14 },
    { id: 'piloto-sem-checklist', nome: 'Piloto sem checklist', max: 27 },
    { id: 'comandante', nome: 'Comandante', max: 36 }
  ];

  var ROTULO_RESULTADO = '// seu resultado';
  var ROTULO_PASSO = '// seu próximo passo';

  // Linhas do workshop comuns a todas as telas que oferecem o workshop.
  var WORKSHOP_MONO = '2 e 3 de dezembro · 20h · ao vivo · R$ 97';
  var WORKSHOP_NOTA = 'Os R$ 97 voltam como crédito se você seguir para o Dev .NET IA até 8 de dezembro. Na compra, o ebook Claude Code Essentials 2ª edição. Em 30 de novembro, o Kit Agêntico .NET com o projeto das aulas.';
  var WORKSHOP_CTA = { texto: 'Garantir minha vaga por R$ 97', destino: 'workshop' };

  // Ponte entre a dor (P3 do quiz, campo `dor` na URL) e a oferta. Sem `dor` válida, a tela não mostra o bloco.
  var ROTULO_DOR = '// o que você respondeu';
  var DORES = {
    ordem: 'Você disse que estuda muito e não sabe o que falta nem em que ordem. Para trabalhar com agente, a ordem é curta: contexto do projeto, spec, testes e só então o código. É essa ordem que você vê aplicada, do começo ao fim, numa feature .NET.',
    nivel: 'Você disse que faz mais que o time e continua no mesmo nível. Velocidade com IA o time inteiro já tem. O que aparece numa revisão é o critério: o que você decidiu, o que o agente fez sozinho e como você verificou.',
    confianca: 'Você disse que não confia no código que o agente entrega. Faz sentido: sem spec e sem teste antes, ninguém sabe o que ele decidiu sozinho. O caminho é registrar a regra antes e verificar o diff depois.',
    prazo: 'Você disse que tem um projeto real travado e com prazo. Com prazo apertado, cada rodada de pede-e-ajusta custa mais caro. Spec e testes antes do código são o que evita refazer a mesma feature.'
  };

  // Uma tela por chave. O link de cada CTA é montado em telaDe(), com a UTM do perfil.
  var TELAS = {
    passageiro: {
      rotulo: ROTULO_RESULTADO,
      titulo: 'Você é Passageiro',
      texto: 'Você usa IA para consultar e gerar trechos de código. O agente ainda não trabalha com você do pedido até a entrega.',
      rotuloOferta: ROTULO_PASSO,
      oferta: {
        titulo: 'Workshop Dev .NET IA',
        texto: 'Em 2 noites ao vivo você faz a mesma feature .NET duas vezes: primeiro no prompt solto, depois com spec, plano, testes e verificação. No fim, compara as duas versões, decisão por decisão.',
        linhaMono: WORKSHOP_MONO,
        nota: WORKSHOP_NOTA,
        cta: WORKSHOP_CTA
      }
    },
    piloto: {
      rotulo: ROTULO_RESULTADO,
      titulo: 'Você é Piloto sem checklist',
      texto: 'Você já usa o agente no dia a dia e entrega rápido. Falta processo: spec antes do código, testes que definem o pronto e revisão do que o agente fez.',
      rotuloOferta: ROTULO_PASSO,
      oferta: {
        titulo: 'Workshop Dev .NET IA',
        texto: 'Você já sabe pedir. Em 2 noites ao vivo você faz a mesma feature .NET duas vezes, no pede-e-ajusta e com SDD, e conta no repositório quantas decisões o agente tomou sozinho em cada uma.',
        linhaMono: WORKSHOP_MONO,
        nota: WORKSHOP_NOTA,
        cta: WORKSHOP_CTA
      }
    },
    comandante: {
      rotulo: ROTULO_RESULTADO,
      titulo: 'Você é Comandante',
      texto: 'Você conduz o agente com processo. O que falta é medir: comparar o seu jeito com um processo completo, na mesma feature, e ver onde o agente ainda decide sozinho.',
      rotuloOferta: ROTULO_PASSO,
      oferta: {
        titulo: 'Workshop Dev .NET IA',
        texto: 'Em 2 noites ao vivo você faz a mesma feature .NET sem spec e com SDD (spec, plano, testes e verificação) e compara as duas versões, decisão por decisão. Sai com os comandos /spec, /plano e /verificar do kit para usar no seu projeto.',
        linhaMono: WORKSHOP_MONO,
        nota: WORKSHOP_NOTA,
        cta: WORKSHOP_CTA
      }
    }
  };

  // Destino lógico (tracking) de cada link de oferta.
  var DESTINO_DO_LINK = { workshop: 'workshop' };

  function ctaPronto(cta, perfilId) {
    return {
      texto: cta.texto,
      href: comUtm(LINKS[cta.destino], perfilId),
      destino: DESTINO_DO_LINK[cta.destino]
    };
  }

  // Tela pronta para renderizar: textos + links já com UTM. Não recebe pontos, então não tem como exibi-los.
  // `dor` é a chave de DORES vinda da URL; qualquer outro valor é ignorado.
  function telaDe(chave, perfilId, dor) {
    var t = TELAS[chave];
    var o = t.oferta;
    var oferta = {
      titulo: o.titulo, texto: o.texto, linhaMono: o.linhaMono, nota: o.nota,
      cta: ctaPronto(o.cta, perfilId)
    };
    if (o.secundario) oferta.secundario = ctaPronto(o.secundario, perfilId);
    var tela = {
      rotulo: t.rotulo, titulo: t.titulo, texto: t.texto,
      rotuloOferta: t.rotuloOferta, oferta: oferta
    };
    if (dor && Object.prototype.hasOwnProperty.call(DORES, dor)) {
      tela.rotuloDor = ROTULO_DOR;
      tela.dor = DORES[dor];
    }
    return tela;
  }

  var SEM_RESULTADO = {
    rotulo: '// diagnóstico de engenharia agêntica',
    titulo: 'Não encontrei o seu resultado',
    texto: 'O link pode ter sido cortado ou alterado. Faça o quiz para ver o seu perfil. Leva uns 5 minutos.',
    cta: { texto: 'Fazer o quiz', href: LINKS.quiz }
  };

  return {
    LINKS: LINKS, PERFIS: PERFIS, TELAS: TELAS, DORES: DORES, SEM_RESULTADO: SEM_RESULTADO,
    telaDe: telaDe, comUtm: comUtm
  };
});
