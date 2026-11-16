/*
 * Lógica pura do resultado do quiz Dev .NET IA: validação da URL, perfil e destino.
 * Sem acesso a DOM nem a rede, para rodar igual no navegador e no Node (node --test).
 *
 * Contrato da URL: ?p=<0..36>&projeto=<resposta da P4 no Tally>
 * Qualquer outro parâmetro (sid, utm_*, ctx, wf, spec, ver, seg, arq, alerta) é ignorado.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./diagnostico-conteudo.js'));
  else root.DiagnosticoCore = factory(root.DiagnosticoConteudo);
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';

  var INTEIRO = /^\d{1,3}$/;

  function lerInteiro(params, nome, max) {
    var todos = params.getAll(nome);
    if (todos.length !== 1 || !INTEIRO.test(todos[0])) return null;
    var n = parseInt(todos[0], 10);
    return n <= max ? n : null;
  }

  function perfilPorPontos(p) {
    for (var i = 0; i < C.PERFIS.length; i++) if (p <= C.PERFIS[i].max) return C.PERFIS[i];
    return C.PERFIS[C.PERFIS.length - 1];
  }

  // trim, minúsculas, sem acento.
  function normalizar(s) {
    return String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // "Sim, com prazo" / "Sim, sem prazo" = tem projeto. Ausente, repetido ou outra coisa = não tem.
  function temProjeto(params) {
    var todos = params.getAll('projeto');
    return todos.length === 1 && normalizar(todos[0]).indexOf('sim') === 0;
  }

  function analisar(query) {
    var params = new URLSearchParams(query || '');
    var p = lerInteiro(params, 'p', 36);
    if (p === null) return { valido: false };

    var perfil = perfilPorPontos(p);
    var chave, destino;
    if (perfil.id === 'passageiro') { chave = 'passageiro'; destino = 'workshop'; }
    else if (perfil.id === 'piloto-sem-checklist') { chave = 'piloto'; destino = 'devnetia'; }
    else if (temProjeto(params)) { chave = 'comandante'; destino = 'mentoria'; }
    else { chave = 'comandanteSemProjeto'; destino = 'devnetia'; } // perfil continua Comandante no tracking

    return { valido: true, p: p, perfil: perfil, destino: destino, tela: C.telaDe(chave, perfil.id) };
  }

  return { analisar: analisar, perfilPorPontos: perfilPorPontos, normalizar: normalizar };
});
