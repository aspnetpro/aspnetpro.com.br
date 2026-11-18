/*
 * Lógica pura do resultado do quiz Dev .NET IA: validação da URL e perfil.
 * Sem acesso a DOM nem a rede, para rodar igual no navegador e no Node (node --test).
 *
 * Contrato da URL (quiz v2, 2026-11-18):
 *   pontos=<0..36> define o perfil, pelos cortes de PERFIS (17/26/32). `p=` vale para links antigos.
 *   A página nunca exibe os pontos. O Tally não manda `faixa` (decisão de 2026-11-18); se vier, é ignorada.
 *   Opcionais: dor, alerta, alerta_motivo, aviso_testes, inconsistencias, perfil_agente,
 *   b_contexto, b_especificacao, b_verificacao, b_seguranca, b_arquitetura, nivel, projeto.
 *   Qualquer outro parâmetro (sid, utm_*, ref…) é ignorado. Valor inválido vira null e o bloco some.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./diagnostico-conteudo.js'));
  else root.DiagnosticoCore = factory(root.DiagnosticoConteudo);
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';

  var INTEIRO = /^\d{1,3}$/;

  // trim, minúsculas, sem acento.
  function normalizar(s) {
    return String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // Um único valor por parâmetro; repetido conta como inválido.
  function unico(params, nome) {
    var todos = params.getAll(nome);
    return todos.length === 1 ? todos[0] : null;
  }

  function lerInteiro(params, nome, max) {
    var v = unico(params, nome);
    if (v === null || !INTEIRO.test(v)) return null;
    var n = parseInt(v, 10);
    return n <= max ? n : null;
  }

  function lerOpcao(params, nome, opcoes) {
    var v = unico(params, nome);
    if (v === null) return null;
    v = normalizar(v);
    return opcoes.indexOf(v) !== -1 ? v : null;
  }

  function perfilPorPontos(p) {
    for (var i = 0; i < C.PERFIS.length; i++) if (p <= C.PERFIS[i].max) return C.PERFIS[i];
    return C.PERFIS[C.PERFIS.length - 1];
  }

  // alerta_motivo: lista separada por vírgula; aceita vírgula sobrando (concatenação do Tally).
  function lerMotivos(params) {
    var v = unico(params, 'alerta_motivo');
    if (v === null) return [];
    var vistos = {};
    String(v).split(',').forEach(function (m) {
      m = normalizar(m);
      if (Object.prototype.hasOwnProperty.call(C.ALERTAS, m)) vistos[m] = true;
    });
    // Ordem fixa de exibição, sem repetição.
    return Object.keys(C.ALERTAS).filter(function (m) { return vistos[m]; });
  }

  // Blocos só valem se os 5 vierem válidos; senão a página não mostra as barras.
  function lerBlocos(params) {
    var r = {};
    for (var i = 0; i < C.BLOCOS.length; i++) {
      var b = C.BLOCOS[i];
      var n = lerInteiro(params, b.id, b.max);
      if (n === null) return null;
      r[b.id] = n;
    }
    return r;
  }

  function analisar(query) {
    var params = new URLSearchParams(query || '');

    // `pontos` define o perfil; `p` só para links antigos, quando `pontos` não vem.
    var p = lerInteiro(params, 'pontos', 36);
    if (p === null && params.getAll('pontos').length === 0) p = lerInteiro(params, 'p', 36);
    if (p === null) return { valido: false };
    var perfil = perfilPorPontos(p);

    var dados = {
      perfilId: perfil.id,
      dor: lerOpcao(params, 'dor', Object.keys(C.DORES)),
      alerta: lerOpcao(params, 'alerta', ['sim', 'nao']),
      motivos: lerMotivos(params),
      avisoTestes: lerOpcao(params, 'aviso_testes', ['sim', 'nao']),
      inconsistencias: lerInteiro(params, 'inconsistencias', 5),
      perfilAgente: lerOpcao(params, 'perfil_agente', ['sim', 'nao']),
      blocos: lerBlocos(params),
      nivel: lerOpcao(params, 'nivel', ['junior', 'pleno', 'senior', 'lead']),
      projeto: lerOpcao(params, 'projeto', ['com_prazo', 'sem_prazo', 'nao'])
    };

    return { valido: true, perfil: perfil, destino: 'workshop', tela: C.telaDe(dados) };
  }

  return { analisar: analisar, perfilPorPontos: perfilPorPontos, normalizar: normalizar };
});
