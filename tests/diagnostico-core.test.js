// Rodar: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../assets/js/diagnostico-core.js');
const C = require('../assets/js/diagnostico-conteudo.js');

const utm = (perfil) => `utm_source=quiz&utm_medium=resultado&utm_content=${perfil}`;

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

test('fronteiras: 14 Passageiro, 15 e 27 Piloto sem checklist', () => {
  assert.equal(core.analisar('p=14').perfil.id, 'passageiro');
  for (const p of [15, 27]) {
    const r = core.analisar('p=' + p);
    assert.equal(r.perfil.id, 'piloto-sem-checklist', `p=${p}`);
    assert.equal(r.destino, 'devnetia', `p=${p}`);
    assert.equal(r.tela.titulo, 'Você é Piloto sem checklist');
  }
});

test('Piloto: oferta Dev .NET IA com link secundário do workshop', () => {
  const o = core.analisar('p=20').tela.oferta;
  assert.equal(o.titulo, 'Dev .NET IA');
  assert.equal(o.cta.texto, 'Entrar na turma 1');
  assert.equal(o.cta.href, C.LINKS.devnetia + '?' + utm('piloto-sem-checklist'));
  assert.equal(o.cta.destino, 'devnetia');
  assert.equal(o.secundario.href, C.LINKS.workshop + '?' + utm('piloto-sem-checklist'));
  assert.equal(o.secundario.destino, 'workshop');
});

test('p=28 com projeto "Sim, com prazo" → Comandante, mentoria', () => {
  const r = core.analisar('p=28&projeto=Sim%2C%20com%20prazo');
  assert.equal(r.perfil.id, 'comandante');
  assert.equal(r.destino, 'mentoria');
  assert.equal(r.tela.titulo, 'Você é Comandante');
  assert.equal(r.tela.oferta.titulo, 'Mentoria Dev .NET IA');
  assert.equal(r.tela.oferta.cta.texto, 'Responder a aplicação');
  assert.equal(r.tela.oferta.cta.href, C.LINKS.aplicacao + '?' + utm('comandante'));
  assert.equal(r.tela.oferta.cta.destino, 'mentoria');
});

test('projeto é normalizado: "sim, sem prazo", espaços e maiúsculas', () => {
  for (const v of ['sim,%20sem%20prazo', '%20%20SIM,%20sem%20prazo%20', 'S%C3%ADm']) {
    const r = core.analisar('p=36&projeto=' + v);
    assert.equal(r.perfil.id, 'comandante', v);
    assert.equal(r.destino, 'mentoria', v);
  }
});

test('p=36 com projeto "Não" → perfil Comandante, destino devnetia, tela sem projeto', () => {
  const r = core.analisar('p=36&projeto=N%C3%A3o');
  assert.equal(r.perfil.id, 'comandante');
  assert.equal(r.destino, 'devnetia');
  assert.equal(r.tela.titulo, 'Você é Comandante');
  assert.match(r.tela.texto, /você respondeu que não tem um agora/);
  assert.equal(r.tela.oferta.titulo, 'Dev .NET IA');
  assert.equal(r.tela.oferta.cta.href, C.LINKS.devnetia + '?' + utm('comandante'));
  assert.ok(r.tela.oferta.secundario);
});

test('p=36 sem projeto (ou projeto repetido) → destino devnetia', () => {
  for (const q of ['p=36', 'p=36&projeto=', 'p=30&projeto=Sim&projeto=Sim']) {
    const r = core.analisar(q);
    assert.equal(r.perfil.id, 'comandante', q);
    assert.equal(r.destino, 'devnetia', q);
  }
});

test('projeto não muda o destino abaixo de 28', () => {
  assert.equal(core.analisar('p=10&projeto=Sim%2C%20com%20prazo').destino, 'workshop');
  assert.equal(core.analisar('p=27&projeto=Sim%2C%20com%20prazo').destino, 'devnetia');
});

test('inválidos', () => {
  const casos = ['', '?', undefined, 'projeto=Sim', 'p=abc', 'p=37', 'p=-1', 'p=1.5', 'p=1&p=2', 'p=', 'p=+5', 'p=%205', 'p=0x4', 'p=1000'];
  for (const q of casos) assert.deepEqual(core.analisar(q), { valido: false }, String(q));
});

test('link antigo com ctx/wf/spec/ver/seg/arq/alerta continua válido', () => {
  const r = core.analisar('p=20&ctx=6&wf=6&spec=6&ver=0&seg=2&arq=0&alerta=0');
  assert.equal(r.valido, true);
  assert.equal(r.perfil.id, 'piloto-sem-checklist');
  assert.equal(r.destino, 'devnetia');
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
      const visivel = [t.rotulo, t.titulo, t.texto, t.rotuloOferta, t.rodape, o.titulo, o.texto, o.linhaMono, o.nota, o.cta.texto, o.secundario && o.secundario.texto].filter(Boolean);
      // Os únicos números legítimos nas telas vêm do texto fixo (datas, preço, quantidades).
      const numeros = visivel.join(' ').match(/\d+/g) || [];
      const fixos = ['2', '3', '20', '97', '8', '1', '9', '697', '12', '5', '997'];
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
