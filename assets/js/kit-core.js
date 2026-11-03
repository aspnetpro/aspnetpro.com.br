/*
 * Página do kit "Seu primeiro ciclo agêntico em .NET": configuração e lógica pura.
 * Para trocar links ou publicar o vídeo, edite só o objeto CONFIG.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KitCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CONFIG = {
    LINK_REPO: 'https://github.com/aspnetpro/kit-agentico-dotnet',
    YOUTUBE_VIDEO_ID: '', // só o ID (ex.: dQw4w9WgXcQ). Vazio = placeholder "em gravação".
    LINK_WORKSHOP: 'https://aspnetpro.com.br/workshop-dev-net-ia-10x/',
    LINK_QUIZ: '/quiz-dev-net-ia-10x/'
  };

  // Mapa gargalo -> passos destacados e texto da faixa.
  var GARGALOS = {
    contexto: { rotulo: 'Contexto', passos: [1], faixa: 'Seu gargalo é Contexto. Comece prestando atenção no passo 1 e no CLAUDE.md comentado.' },
    workflow: { rotulo: 'Workflow', passos: [4, 5], faixa: 'Seu gargalo é Workflow. Os passos 4 e 5 mostram como trabalhar por plano e por etapas.' },
    spec: { rotulo: 'Spec', passos: [3], faixa: 'Seu gargalo é Spec. O passo 3 é o centro do kit pra você.' },
    verificacao: { rotulo: 'Verificação', passos: [6], faixa: 'Seu gargalo é Verificação. Não pule o passo 6, e leia o diff com o checklist de sinais de alerta.' },
    seguranca: { rotulo: 'Segurança', passos: [6], faixa: 'Seu gargalo é Segurança. No passo 6, foque no cupom exclusivo de cliente e leia o checklist de segurança do agente.' },
    arquitetura: { rotulo: 'Arquitetura', passos: [1], faixa: 'Seu gargalo é Arquitetura. No passo 1, leia o docs/arquitetura.md: é ele que faz o agente pôr cada coisa no lugar.' }
  };

  // RN03: valor ausente, repetido ou desconhecido = null (a página aparece normal, sem erro).
  function lerGargalo(query) {
    var todos = new URLSearchParams(query || '').getAll('gargalo');
    if (todos.length !== 1) return null;
    var chave = todos[0].trim().toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(GARGALOS, chave)) return null;
    var g = GARGALOS[chave];
    return { chave: chave, rotulo: g.rotulo, passos: g.passos.slice(), faixa: g.faixa };
  }

  // Link para um arquivo do repositório (cards de material de apoio).
  function urlArquivo(caminho) {
    return CONFIG.LINK_REPO + '/blob/main/' + String(caminho).replace(/^\/+/, '');
  }

  return { CONFIG: CONFIG, GARGALOS: GARGALOS, lerGargalo: lerGargalo, urlArquivo: urlArquivo };
});
