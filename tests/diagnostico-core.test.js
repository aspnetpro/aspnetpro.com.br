// Rodar: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../assets/js/diagnostico-core.js');
const C = require('../assets/js/diagnostico-conteudo.js');

function q(p, [a, b, c, d, e, f], alerta = 0, extra = '') {
  return `p=${p}&ctx=${a}&wf=${b}&spec=${c}&ver=${d}&seg=${e}&arq=${f}&alerta=${alerta}${extra}`;
}

test('passageiro com alerta de segurança', () => {
  const r = core.analisar('p=0&ctx=0&wf=0&spec=0&ver=0&seg=0&arq=0&alerta=1&sid=t1');
  assert.equal(r.valido, true);
  assert.equal(r.perfil.nome, 'Passageiro');
  assert.equal(r.p, 0);
  assert.equal(r.alerta, true);
  assert.equal(r.gargalo.nome, 'Contexto');
});

test('piloto sem checklist, gargalo Verificação (empate com Arquitetura)', () => {
  const r = core.analisar('p=20&ctx=6&wf=6&spec=6&ver=0&seg=2&arq=0&alerta=0');
  assert.equal(r.perfil.nome, 'Piloto sem checklist');
  assert.equal(r.p, 20);
  assert.equal(r.alerta, false);
  assert.equal(r.gargalo.nome, 'Verificação');
});

test('piloto de linha, gargalo Workflow e notas completas', () => {
  const r = core.analisar('p=25&ctx=5&wf=4&spec=4&ver=4&seg=4&arq=4&alerta=0');
  assert.equal(r.perfil.nome, 'Piloto de linha');
  assert.equal(r.gargalo.nome, 'Workflow');
  assert.equal(core.resumoNotas(r.notas), 'Contexto 5/6, Workflow 4/6, Spec 4/6, Verificação 4/6, Segurança 4/6, Arquitetura 4/6');
});

test('comandante com gargalo Spec', () => {
  const r = core.analisar('p=30&ctx=6&wf=6&spec=0&ver=6&seg=6&arq=6&alerta=0');
  assert.equal(r.perfil.nome, 'Comandante');
  assert.equal(r.gargalo.nome, 'Spec');
});

test('nota máxima: Comandante e sem gargalo', () => {
  const r = core.analisar('p=36&ctx=6&wf=6&spec=6&ver=6&seg=6&arq=6&alerta=0');
  assert.equal(r.perfil.nome, 'Comandante');
  assert.equal(r.gargalo, null);
});

test('fronteiras entre perfis', () => {
  const casos = [
    [10, [6, 4, 0, 0, 0, 0], 'Passageiro'],
    [11, [6, 5, 0, 0, 0, 0], 'Piloto sem checklist'],
    [20, [6, 6, 6, 2, 0, 0], 'Piloto sem checklist'],
    [21, [6, 6, 6, 3, 0, 0], 'Piloto de linha'],
    [29, [6, 6, 6, 6, 5, 0], 'Piloto de linha'],
    [30, [6, 6, 6, 6, 6, 0], 'Comandante']
  ];
  for (const [p, notas, esperado] of casos) {
    const r = core.analisar(q(p, notas));
    assert.equal(r.valido, true, `p=${p}`);
    assert.equal(r.perfil.nome, esperado, `p=${p}`);
  }
});

test('soma das dimensões diferente do total é inválido', () => {
  assert.equal(core.analisar('p=36&ctx=1&wf=1&spec=1&ver=1&seg=1&arq=1&alerta=0').valido, false);
});

test('fora da faixa ou não numérico é inválido', () => {
  assert.equal(core.analisar('p=99&ctx=abc&wf=4&spec=4&ver=4&seg=4&arq=4&alerta=0').valido, false);
  assert.equal(core.analisar('p=37&ctx=6&wf=6&spec=6&ver=6&seg=6&arq=6&alerta=0').valido, false);
  assert.equal(core.analisar('p=7&ctx=7&wf=0&spec=0&ver=0&seg=0&arq=0&alerta=0').valido, false);
});

test('sem parâmetros ou query vazia é inválido', () => {
  assert.deepEqual(core.analisar(''), { valido: false });
  assert.deepEqual(core.analisar('?'), { valido: false });
  assert.deepEqual(core.analisar(undefined), { valido: false });
});

test('parâmetro ausente invalida o conjunto', () => {
  assert.equal(core.analisar('p=24&ctx=4&wf=4&spec=4&ver=4&seg=4&arq=4').valido, false); // sem alerta
  assert.equal(core.analisar('p=20&ctx=4&wf=4&spec=4&ver=4&seg=4&alerta=0').valido, false); // sem arq
});

test('formatos estranhos são inválidos', () => {
  const base = (v) => `p=24&ctx=${v}&wf=4&spec=4&ver=4&seg=4&arq=4&alerta=0`;
  for (const v of ['4.0', '-4', '+4', '', ' 4', '4e0', '0x4']) {
    assert.equal(core.analisar(base(v)).valido, false, `ctx=${JSON.stringify(v)}`);
  }
});

test('parâmetro repetido é inválido', () => {
  assert.equal(core.analisar('p=24&ctx=4&ctx=4&wf=4&spec=4&ver=4&seg=4&arq=4&alerta=0').valido, false);
});

test('alerta só aceita 0 ou 1', () => {
  assert.equal(core.analisar(q(24, [4, 4, 4, 4, 4, 4], 2)).valido, false);
  assert.equal(core.analisar(q(24, [4, 4, 4, 4, 4, 4], 'sim')).valido, false);
});

test('aceita query com "?" na frente e ignora parâmetros desconhecidos', () => {
  const r = core.analisar('?' + q(24, [4, 4, 4, 4, 4, 4], 0, '&utm_source=tally&sid=abc123'));
  assert.equal(r.valido, true);
});

test('o resultado nunca carrega o sid', () => {
  const r = core.analisar(q(24, [4, 4, 4, 4, 4, 4], 0, '&sid=SEGREDO123'));
  assert.equal(JSON.stringify(r).includes('SEGREDO123'), false);
});

test('radar: 6 eixos, anéis, polígono, aria-label e destaque do gargalo', () => {
  const r = core.analisar('p=25&ctx=5&wf=4&spec=4&ver=4&seg=4&arq=4&alerta=0');
  const svg = core.radarSvg(r.notas, r.gargalo);
  assert.match(svg, /role="img"/);
  assert.match(svg, /aria-label="Radar das 6 dimensões: Contexto 5\/6, Workflow 4\/6/);
  assert.equal((svg.match(/class="radar-ring"/g) || []).length, 3);
  assert.equal((svg.match(/class="radar-axis"/g) || []).length, 6);
  assert.equal((svg.match(/class="radar-dot"/g) || []).length, 6);
  assert.equal((svg.match(/class="radar-area"/g) || []).length, 1);
  assert.equal((svg.match(/is-gargalo/g) || []).length, 1);
  assert.match(svg, /is-gargalo" [^>]*>Workflow</);
});

test('radar sem gargalo não destaca nenhum rótulo', () => {
  const svg = core.radarSvg({ ctx: 6, wf: 6, spec: 6, ver: 6, seg: 6, arq: 6 }, null);
  assert.equal(svg.includes('is-gargalo'), false);
});

test('radar: nota 0 colapsa no centro e nota 6 chega ao anel externo', () => {
  const zero = core.radarSvg({ ctx: 0, wf: 0, spec: 0, ver: 0, seg: 0, arq: 0 }, null);
  assert.match(zero, /class="radar-area" points="160,150 160,150 160,150 160,150 160,150 160,150"/);
  const cheio = core.radarSvg({ ctx: 6, wf: 0, spec: 0, ver: 0, seg: 0, arq: 0 }, null);
  assert.match(cheio, /class="radar-area" points="160,70 /);
});

test('conteúdo: todo perfil e gargalo tem textos, links são https e não há placeholder', () => {
  for (const p of C.PERFIS) {
    for (const campo of ['nome', 'frase', 'paragrafo', 'kit']) assert.ok(p[campo], `${p.id}.${campo}`);
    assert.match(p.cta2.href, /^https:\/\//);
  }
  for (const d of C.DIMENSOES) {
    const g = C.GARGALOS[d.chave];
    assert.ok(g && g.titulo && g.dica && g.kit, d.chave);
  }
  assert.equal(/\[LINK_/.test(JSON.stringify(C)), false);
  assert.match(C.textoCompartilhar('Comandante'), /Comandante\. Qual é o seu\? https:\/\/tally\.so\/r\/bZqvge$/);
});

test('kitUrl leva o gargalo de cada dimensão para a página do kit', () => {
  const base = C.LINKS.kit;
  assert.equal(C.kitUrl('ctx'), base + '?gargalo=contexto');
  assert.equal(C.kitUrl('wf'), base + '?gargalo=workflow');
  assert.equal(C.kitUrl('spec'), base + '?gargalo=spec');
  assert.equal(C.kitUrl('ver'), base + '?gargalo=verificacao');
  assert.equal(C.kitUrl('seg'), base + '?gargalo=seguranca');
  assert.equal(C.kitUrl('arq'), base + '?gargalo=arquitetura');
});

test('kitUrl sem gargalo ou com chave inválida não leva parâmetro', () => {
  for (const k of [null, undefined, '', 'xpto', 'constructor', '__proto__']) assert.equal(C.kitUrl(k), C.LINKS.kit, String(k));
});

test('todo valor de kitUrl é aceito pela página do kit', () => {
  const kit = require('../assets/js/kit-core.js');
  for (const d of C.DIMENSOES) {
    const g = kit.lerGargalo(new URL(C.kitUrl(d.chave)).search);
    assert.ok(g, d.chave);
    assert.equal(g.rotulo, d.nome, d.chave);
  }
});
