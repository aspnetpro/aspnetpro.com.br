/*
 * Lógica pura do resultado do diagnóstico: validação dos parâmetros, perfil, gargalo e radar.
 * Sem acesso a DOM nem a rede, para rodar igual no navegador e no Node (node --test).
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

  // RN01: um parâmetro inválido invalida o conjunto. O `sid` nunca é lido.
  function analisar(query) {
    var params = new URLSearchParams(query || '');
    var p = lerInteiro(params, 'p', 36);
    var notas = {};
    var soma = 0;
    var ok = p !== null;
    C.DIMENSOES.forEach(function (d) {
      var n = lerInteiro(params, d.chave, 6);
      if (n === null) ok = false;
      else { notas[d.chave] = n; soma += n; }
    });
    var alertaBruto = params.getAll('alerta');
    if (alertaBruto.length !== 1 || (alertaBruto[0] !== '0' && alertaBruto[0] !== '1')) ok = false;
    if (ok && soma !== p) ok = false;
    if (!ok) return { valido: false };

    return {
      valido: true,
      p: p,
      notas: notas,
      perfil: perfilPorPontos(p),
      gargalo: gargaloDe(notas),
      alerta: alertaBruto[0] === '1'
    };
  }

  // RN02
  function perfilPorPontos(p) {
    for (var i = 0; i < C.PERFIS.length; i++) if (p <= C.PERFIS[i].max) return C.PERFIS[i];
    return C.PERFIS[C.PERFIS.length - 1];
  }

  // RN03: menor nota; empate vai para a primeira da ordem; tudo 6 = sem gargalo (null).
  function gargaloDe(notas) {
    var menor = null;
    C.DIMENSOES.forEach(function (d) {
      if (menor === null || notas[d.chave] < notas[menor.chave]) menor = d;
    });
    return notas[menor.chave] === 6 ? null : menor;
  }

  // ---------- Radar ----------
  var W = 320, H = 300, CX = 160, CY = 150, R = 80, RL = 94;

  function angulo(i) { return -Math.PI / 2 + (i * Math.PI) / 3; }
  function ponto(i, raio) {
    return [CX + raio * Math.cos(angulo(i)), CY + raio * Math.sin(angulo(i))];
  }
  function f(n) { return (Math.round(n * 10) / 10).toString(); }
  function poligono(raioDe) {
    return C.DIMENSOES.map(function (d, i) {
      var pt = ponto(i, raioDe(d));
      return f(pt[0]) + ',' + f(pt[1]);
    }).join(' ');
  }

  function resumoNotas(notas) {
    return C.DIMENSOES.map(function (d) { return d.nome + ' ' + notas[d.chave] + '/6'; }).join(', ');
  }

  function radarSvg(notas, gargalo) {
    var s = '<svg class="radar" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Radar das 6 dimensões: ' + resumoNotas(notas) + '" xmlns="http://www.w3.org/2000/svg">';
    [2, 4, 6].forEach(function (nivel) {
      s += '<polygon class="radar-ring" points="' + poligono(function () { return (R * nivel) / 6; }) + '"/>';
    });
    C.DIMENSOES.forEach(function (d, i) {
      var pt = ponto(i, R);
      s += '<line class="radar-axis" x1="' + CX + '" y1="' + CY + '" x2="' + f(pt[0]) + '" y2="' + f(pt[1]) + '"/>';
    });
    s += '<polygon class="radar-area" points="' + poligono(function (d) { return (R * notas[d.chave]) / 6; }) + '"/>';
    C.DIMENSOES.forEach(function (d, i) {
      var pt = ponto(i, (R * notas[d.chave]) / 6);
      s += '<circle class="radar-dot" cx="' + f(pt[0]) + '" cy="' + f(pt[1]) + '" r="3"/>';
    });
    C.DIMENSOES.forEach(function (d, i) {
      var pt = ponto(i, RL);
      var cos = Math.cos(angulo(i));
      var anchor = Math.abs(cos) < 0.1 ? 'middle' : cos > 0 ? 'start' : 'end';
      var dy = i === 0 ? 0 : i === 3 ? 10 : 4;
      var cls = 'radar-label' + (gargalo && gargalo.chave === d.chave ? ' is-gargalo' : '');
      s += '<text class="' + cls + '" x="' + f(pt[0]) + '" y="' + f(pt[1] + dy) + '" text-anchor="' + anchor + '">' + d.nome + '</text>';
    });
    return s + '</svg>';
  }

  return { analisar: analisar, perfilPorPontos: perfilPorPontos, gargaloDe: gargaloDe, radarSvg: radarSvg, resumoNotas: resumoNotas };
});
