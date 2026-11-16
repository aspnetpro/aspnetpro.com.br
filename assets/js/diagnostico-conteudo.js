/*
 * Textos e links da página de resultado do quiz Dev .NET IA.
 * Para trocar um link, edite só o objeto LINKS.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DiagnosticoConteudo = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LINKS = {
    workshop: 'https://aspnetpro.com.br/workshop-dev-net-ia/',
    devnetia: 'https://aspnetpro.com.br/dev-net-ia/',
    // Abre a página com o formulário de aplicação (Tally jeoPB1).
    aplicacao: 'https://aspnetpro.com.br/mentoria-dev-net-ia/',
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

  var OFERTA_DEVNETIA = {
    titulo: 'Dev .NET IA',
    texto: '8 encontros ao vivo. Você aprende os recursos do Claude Code e o SDD e constrói um app ASP.NET Core completo, com login, do zero até produção.',
    linhaMono: 'Turma 1 começa em 9 de dezembro · R$ 697',
    nota: 'Bônus: os ebooks Claude Code para Desenvolvedores .NET e Claude Code Essentials 2ª edição + biblioteca de skills e MCPs.',
    cta: { texto: 'Entrar na turma 1', destino: 'devnetia' },
    secundario: { texto: 'Quer ver o método funcionando antes? Workshop, 2 e 3 de dezembro, R$ 97.', destino: 'workshop' }
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
        texto: 'Em 2 noites ao vivo você vê o fluxo completo funcionando num projeto .NET: o agente com contexto, o plano antes do código, os testes e o deploy.',
        linhaMono: '2 e 3 de dezembro · 20h · ao vivo · R$ 97',
        nota: 'Na área de membros: o ebook Claude Code Essentials 2ª edição e o Kit Agêntico .NET, o projeto das aulas.',
        cta: { texto: 'Garantir minha vaga no workshop', destino: 'workshop' }
      }
    },
    piloto: {
      rotulo: ROTULO_RESULTADO,
      titulo: 'Você é Piloto sem checklist',
      texto: 'Você já usa o agente no dia a dia e entrega rápido. Falta processo: spec antes do código, testes que definem o pronto e revisão do que o agente fez.',
      rotuloOferta: ROTULO_PASSO,
      oferta: OFERTA_DEVNETIA
    },
    comandanteSemProjeto: {
      rotulo: ROTULO_RESULTADO,
      titulo: 'Você é Comandante',
      texto: 'Você conduz o agente com processo. A mentoria acontece no projeto real de cada aluno, e você respondeu que não tem um agora. No Dev .NET IA o projeto vem pronto para você aplicar tudo.',
      rotuloOferta: ROTULO_PASSO,
      oferta: OFERTA_DEVNETIA
    },
    comandante: {
      rotulo: ROTULO_RESULTADO,
      titulo: 'Você é Comandante',
      texto: 'Você conduz o agente com processo. O próximo passo é levar isso para o seu projeto real e para o seu time.',
      rotuloOferta: ROTULO_PASSO,
      oferta: {
        titulo: 'Mentoria Dev .NET IA',
        texto: 'Acompanhamento individual, no seu projeto real, comigo do lado.',
        linhaMono: 'Entrada por aplicação',
        nota: 'Não tem botão de compra: você responde a aplicação e eu te retorno.',
        cta: { texto: 'Responder a aplicação', destino: 'aplicacao' }
      }
    }
  };

  // Destino lógico (tracking) de cada link de oferta.
  var DESTINO_DO_LINK = { workshop: 'workshop', devnetia: 'devnetia', aplicacao: 'mentoria' };

  function ctaPronto(cta, perfilId) {
    return {
      texto: cta.texto,
      href: comUtm(LINKS[cta.destino], perfilId),
      destino: DESTINO_DO_LINK[cta.destino]
    };
  }

  // Tela pronta para renderizar: textos + links já com UTM. Não recebe pontos, então não tem como exibi-los.
  function telaDe(chave, perfilId) {
    var t = TELAS[chave];
    var o = t.oferta;
    var oferta = {
      titulo: o.titulo, texto: o.texto, linhaMono: o.linhaMono, nota: o.nota,
      cta: ctaPronto(o.cta, perfilId)
    };
    if (o.secundario) oferta.secundario = ctaPronto(o.secundario, perfilId);
    return {
      rotulo: t.rotulo, titulo: t.titulo, texto: t.texto,
      rotuloOferta: t.rotuloOferta, oferta: oferta
    };
  }

  var SEM_RESULTADO = {
    rotulo: '// diagnóstico de engenharia agêntica',
    titulo: 'Não encontrei o seu resultado',
    texto: 'O link pode ter sido cortado ou alterado. Faça o quiz para ver o seu perfil. Leva uns 5 minutos.',
    cta: { texto: 'Fazer o quiz', href: LINKS.quiz }
  };

  return {
    LINKS: LINKS, PERFIS: PERFIS, TELAS: TELAS, SEM_RESULTADO: SEM_RESULTADO,
    telaDe: telaDe, comUtm: comUtm
  };
});
