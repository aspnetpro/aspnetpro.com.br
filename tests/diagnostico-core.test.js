// Rodar: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../assets/js/diagnostico-core.js');
const C = require('../assets/js/diagnostico-conteudo.js');

const utm = (perfil) => `utm_source=site&utm_medium=quiz&utm_campaign=dev-net-ia-dez26&utm_content=${perfil}`;

test('p=0 → Passageiro, workshop', () => {
  const r = core.analisar('p=0');
  assert.equal(r.valido, true);
  assert.equal(r.perfil.id, 'passageiro');
  assert.equal(r.destino, 'workshop');
  assert.equal(r.tela.titulo, 'Você é Passageiro');
  assert.equal(r.tela.oferta.titulo, 'Workshop Dev .NET IA');
  assert.equal(r.tela.oferta.cta.href, C.LINKS.workshop + '?' + utm('passageiro'));
  assert.equal(r.tela.oferta.secundario, undefined);
});

test('fronteiras: 14 Passageiro, 15 e 27 Piloto, 28 Comandante; todos no workshop', () => {
  const casos = [[14, 'passageiro', 'Você é Passageiro'], [15, 'piloto-sem-checklist', 'Você é Piloto sem checklist'],
    [27, 'piloto-sem-checklist', 'Você é Piloto sem checklist'], [28, 'comandante', 'Você é Comandante'], [36, 'comandante', 'Você é Comandante']];
  for (const [p, id, titulo] of casos) {
    const r = core.analisar('p=' + p);
    assert.equal(r.perfil.id, id, `p=${p}`);
    assert.equal(r.destino, 'workshop', `p=${p}`);
    assert.equal(r.tela.titulo, titulo, `p=${p}`);
  }
});

test('todo perfil: só o workshop, sem link secundário, sem Dev .NET IA nem mentoria no CTA', () => {
  for (let p = 0; p <= 36; p++) {
    for (const projeto of ['', '&projeto=Sim%2C%20com%20prazo', '&projeto=N%C3%A3o']) {
      const r = core.analisar('p=' + p + projeto);
      const o = r.tela.oferta;
      assert.equal(o.titulo, 'Workshop Dev .NET IA', `p=${p}${projeto}`);
      assert.equal(o.cta.href, C.LINKS.workshop + '?' + utm(r.perfil.id), `p=${p}${projeto}`);
      assert.equal(o.cta.destino, 'workshop');
      assert.equal(o.secundario, undefined, `p=${p}${projeto}`);
      assert.equal(/mentoria|dev-net-ia\//i.test(JSON.stringify(r.tela).replace(C.LINKS.workshop, '')), false, `p=${p}${projeto}`);
    }
  }
});

test('nenhuma tela promete deploy no workshop', () => {
  for (const q of ['p=0', 'p=20', 'p=36']) {
    const o = core.analisar(q).tela.oferta;
    assert.equal(/deploy/i.test(o.texto + o.nota), false, q);
  }
});

test('dor válida mostra a ponte; inválida, repetida ou ausente não mostra', () => {
  for (const d of Object.keys(C.DORES)) {
    const t = core.analisar('p=20&dor=' + d).tela;
    assert.equal(t.dor, C.DORES[d], d);
    assert.equal(t.rotuloDor, '// o que você respondeu');
  }
  assert.equal(core.analisar('p=20&dor=%20ORDEM%20').tela.dor, C.DORES.ordem);
  for (const q of ['p=20', 'p=20&dor=', 'p=20&dor=xss%3Cb%3E', 'p=20&dor=ordem&dor=nivel', 'p=20&dor=__proto__', 'p=20&dor=toString']) {
    const t = core.analisar(q).tela;
    assert.equal('dor' in t, false, q);
    assert.equal('rotuloDor' in t, false, q);
  }
});

test('inválidos', () => {
  const casos = ['', '?', undefined, 'projeto=Sim', 'p=abc', 'p=37', 'p=-1', 'p=1.5', 'p=1&p=2', 'p=', 'p=+5', 'p=%205', 'p=0x4', 'p=1000'];
  for (const q of casos) assert.deepEqual(core.analisar(q), { valido: false }, String(q));
});

test('link antigo com ctx/wf/spec/ver/seg/arq/alerta continua válido', () => {
  const r = core.analisar('p=20&ctx=6&wf=6&spec=6&ver=0&seg=2&arq=0&alerta=0');
  assert.equal(r.valido, true);
  assert.equal(r.perfil.id, 'piloto-sem-checklist');
  assert.equal(r.destino, 'workshop');
});

test('ignora sid e utm_* e não os carrega no resultado', () => {
  const r = core.analisar('?p=20&sid=SEGREDO123&utm_source=tally&utm_campaign=xyz');
  assert.equal(r.valido, true);
  const json = JSON.stringify(r);
  assert.equal(json.includes('SEGREDO123'), false);
  assert.equal(json.includes('tally&'), false);
});

test('nenhuma tela contém o número de pontos', () => {
  // Prova forte: dentro do mesmo perfil, a tela é idêntica para qualquer p.
  const porChave = {};
  for (let p = 0; p <= 36; p++) {
    for (const projeto of ['', '&projeto=Sim%2C%20com%20prazo', '&projeto=N%C3%A3o']) {
      const r = core.analisar('p=' + p + projeto);
      const k = r.perfil.id + '|' + r.destino;
      porChave[k] = porChave[k] || r.tela;
      assert.deepEqual(r.tela, porChave[k], `p=${p}${projeto}`);
    }
  }
  for (let p = 0; p <= 36; p++) {
    for (const projeto of ['', '&projeto=Sim%2C%20com%20prazo', '&projeto=N%C3%A3o']) {
      const r = core.analisar('p=' + p + projeto);
      // Textos visíveis; os hrefs ficam de fora porque não exibem nada.
      const t = r.tela;
      const o = t.oferta;
      const visivel = [t.rotulo, t.titulo, t.texto, t.rotuloOferta, o.titulo, o.texto, o.linhaMono, o.nota, o.cta.texto, o.secundario && o.secundario.texto].filter(Boolean);
      // Os únicos números legítimos nas telas vêm do texto fixo (datas, preço, quantidades).
      const numeros = visivel.join(' ').match(/\d+/g) || [];
      const fixos = ['2', '3', '20', '97', '8', '1', '9', '697', '12', '5', '997', '30'];
      for (const n of numeros) assert.ok(fixos.includes(n), `p=${p}${projeto}: número inesperado ${n}`);
      assert.equal(JSON.stringify(t).includes('/36'), false);
      assert.equal('p' in t, false);
    }
  }
});

test('conteúdo: links https, sem placeholder, UTM só nas ofertas', () => {
  for (const href of Object.values(C.LINKS)) assert.match(href, /^https:\/\//);
  assert.equal(/\[LINK_/.test(JSON.stringify(C)), false);
  assert.equal(C.SEM_RESULTADO.cta.href, C.LINKS.quiz);
  assert.equal(C.SEM_RESULTADO.titulo, 'Não encontrei o seu resultado');
  assert.equal(C.comUtm('https://x.test/?a=1', 'passageiro'), 'https://x.test/?a=1&' + utm('passageiro'));
});
