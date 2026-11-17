/*
 * Lógica pura do resultado do quiz Dev .NET IA: validação da URL, perfil e destino.
 * Sem acesso a DOM nem a rede, para rodar igual no navegador e no Node (node --test).
 *
 * Contrato da URL: ?p=<0..36>. Todo perfil leva ao workshop; `projeto` (P4) é ignorado desde 2026-11-17.
 * Opcional: &dor=<ordem|nivel|confianca|prazo> (P3) mostra o bloco de ponte entre a dor e a oferta.
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

  // `dor` (código da P3 no Tally): só aceita uma chave conhecida, um valor só.
  function lerDor(params) {
    var todos = params.getAll('dor');
    if (todos.length !== 1) return null;
    var d = normalizar(todos[0]);
    return Object.prototype.hasOwnProperty.call(C.DORES, d) ? d : null;
  }

  function analisar(query) {
    var params = new URLSearchParams(query || '');
    var p = lerInteiro(params, 'p', 36);
    if (p === null) return { valido: false };

    var perfil = perfilPorPontos(p);
    // Todo perfil vai ao workshop (2026-11-17). `projeto` continua chegando do Tally e é ignorado.
    var chave = perfil.id === 'passageiro' ? 'passageiro'
      : perfil.id === 'piloto-sem-checklist' ? 'piloto' : 'comandante';

    return { valido: true, p: p, perfil: perfil, destino: 'workshop', tela: C.telaDe(chave, perfil.id, lerDor(params)) };
  }

  return { analisar: analisar, perfilPorPontos: perfilPorPontos, normalizar: normalizar };
});
