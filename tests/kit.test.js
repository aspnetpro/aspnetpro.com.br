// Rodar: node --test "tests/*.test.js"
const test = require('node:test');
const assert = require('node:assert/strict');
const kit = require('../assets/js/kit-core.js');
const yt = require('../assets/js/yt-facade.js');

test('gargalo: os 6 valores mapeiam rótulo, passos e faixa', () => {
  const esperado = {
    contexto: ['Contexto', [1]],
    workflow: ['Workflow', [4, 5]],
    spec: ['Spec', [3]],
    verificacao: ['Verificação', [6]],
    seguranca: ['Segurança', [6]],
    arquitetura: ['Arquitetura', [1]]
  };
  for (const [chave, [rotulo, passos]] of Object.entries(esperado)) {
    const g = kit.lerGargalo('?gargalo=' + chave);
    assert.equal(g.chave, chave);
    assert.equal(g.rotulo, rotulo);
    assert.deepEqual(g.passos, passos);
    assert.ok(g.faixa.startsWith('Seu gargalo é ' + rotulo + '.'), chave);
  }
});

test('gargalo: faixa exata do cenário spec', () => {
  assert.equal(kit.lerGargalo('gargalo=spec').faixa, 'Seu gargalo é Spec. O passo 3 é o centro do kit pra você.');
});

test('gargalo: workflow destaca os passos 4 e 5', () => {
  assert.deepEqual(kit.lerGargalo('gargalo=workflow').passos, [4, 5]);
});

test('gargalo: inválido, ausente, vazio ou repetido vira null', () => {
  for (const q of ['?gargalo=xpto', '', '?', undefined, '?gargalo=', '?outro=spec', '?gargalo=spec&gargalo=workflow', '?gargalo=constructor', '?gargalo=__proto__', '?gargalo=toString']) {
    assert.equal(kit.lerGargalo(q), null, String(q));
  }
});

test('gargalo: tolera caixa e espaços, ignora outros parâmetros', () => {
  assert.equal(kit.lerGargalo('?gargalo=%20Spec%20&utm_source=email').chave, 'spec');
});

test('gargalo: devolve cópia, o mapa original não é alterado', () => {
  const g = kit.lerGargalo('gargalo=workflow');
  g.passos.push(99);
  assert.deepEqual(kit.lerGargalo('gargalo=workflow').passos, [4, 5]);
});

test('config: links definidos e vídeo vazio por padrão', () => {
  assert.match(kit.CONFIG.LINK_REPO, /^https:\/\/github\.com\//);
  assert.equal(kit.CONFIG.YOUTUBE_VIDEO_ID, '');
  assert.ok(kit.CONFIG.LINK_WORKSHOP && kit.CONFIG.LINK_QUIZ);
  assert.equal(JSON.stringify(kit.CONFIG).includes('[LINK_'), false);
});

test('urlArquivo monta o link blob/main do repositório', () => {
  assert.equal(kit.urlArquivo('guia/paginas-de-decisao.md'), kit.CONFIG.LINK_REPO + '/blob/main/guia/paginas-de-decisao.md');
  assert.equal(kit.urlArquivo('/guia/x.md'), kit.CONFIG.LINK_REPO + '/blob/main/guia/x.md');
});

test('youtube: ID válido gera miniatura e embed nocookie com autoplay', () => {
  assert.equal(yt.idValido('dQw4w9WgXcQ'), true);
  assert.equal(yt.urlMiniatura('dQw4w9WgXcQ'), 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  assert.equal(yt.urlEmbed('dQw4w9WgXcQ'), 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1');
});

test('youtube: ID vazio ou inválido não gera URL nenhuma', () => {
  for (const id of ['', undefined, null, 123, 'abc', 'a b c d e f', 'https://youtu.be/dQw4w9WgXcQ', 'x"onload="y', '../../etc', 'dQw4w9WgXcQ?x=1']) {
    assert.equal(yt.idValido(id), false, String(id));
    assert.equal(yt.urlMiniatura(id), '', String(id));
    assert.equal(yt.urlEmbed(id), '', String(id));
  }
});
