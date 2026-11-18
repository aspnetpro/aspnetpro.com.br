// Rodar: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../assets/js/diagnostico-core.js');
const C = require('../assets/js/diagnostico-conteudo.js');

const utm = (perfil) => `utm_source=site&utm_medium=quiz&utm_campaign=dev-net-ia-dez26&utm_content=${perfil}`;
const BLOCOS_OK = 'b_contexto=6&b_especificacao=9&b_verificacao=2&b_seguranca=6&b_arquitetura=4';

test('pontos definem o perfil pelos cortes 17/26/32 (p= nos links antigos)', () => {
  const casos = [[0, 'passageiro', 'Você é Passageiro'], [17, 'passageiro', 'Você é Passageiro'],
    [18, 'piloto-sem-checklist', 'Você é Piloto sem checklist'], [26, 'piloto-sem-checklist', 'Você é Piloto sem checklist'],
    [27, 'piloto-com-checklist', 'Você é Piloto com checklist'], [32, 'piloto-com-checklist', 'Você é Piloto com checklist'],
    [33, 'comandante', 'Você é Comandante'], [36, 'comandante', 'Você é Comandante']];
  for (const [p, id, titulo] of casos) {
    const r = core.analisar('pontos=' + p);
    assert.equal(r.valido, true, 'pontos=' + p);
    assert.equal(r.perfil.id, id, 'pontos=' + p);
    assert.equal(r.tela.titulo, titulo, 'pontos=' + p);
    assert.equal(r.tela.oferta.cta.href, C.LINKS.workshop + '?' + utm(id));
    assert.equal(core.analisar('p=' + p).perfil.id, id, 'p=' + p);
  }
});

test('faixa na URL é ignorada: o perfil vem só dos pontos', () => {
  assert.equal(core.analisar('pontos=8&faixa=referencia').perfil.id, 'passageiro');
  assert.equal(core.analisar('pontos=35&faixa=inicio').perfil.id, 'comandante');
  assert.deepEqual(core.analisar('faixa=referencia'), { valido: false });
});

test('inválidos', () => {
  const casos = ['', '?', undefined, 'projeto=nao', 'p=abc', 'p=37', 'p=-1', 'p=1.5', 'p=1&p=2', 'p=', 'p=+5', 'p=%205', 'p=0x4', 'p=1000',
    'pontos=37', 'pontos=', 'pontos=8&pontos=30', 'pontos=__proto__', 'pontos=abc&p=10'];
  for (const q of casos) assert.deepEqual(core.analisar(q), { valido: false }, String(q));
});

test('todo perfil: só o workshop, sem Dev .NET IA nem mentoria no CTA, sem deploy', () => {
  for (const f of ['8', '22', '30', '35']) {
    for (const extra of ['', '&projeto=nao&nivel=lead', '&projeto=com_prazo', '&perfil_agente=nao']) {
      const r = core.analisar('pontos=' + f + extra);
      const o = r.tela.oferta;
      assert.equal(o.titulo, 'Workshop Dev .NET IA');
      assert.equal(o.cta.destino, 'workshop');
      assert.equal(/mentoria|dev-net-ia\//i.test(JSON.stringify(r.tela).replace(C.LINKS.workshop, '')), false, f + extra);
      assert.equal(/deploy/i.test(JSON.stringify(o)), false, f + extra);
    }
  }
});

test('nenhuma tela mostra os pontos', () => {
  for (let p = 0; p <= 36; p++) {
    const t = core.analisar('pontos=' + p + '&' + BLOCOS_OK).tela;
    const json = JSON.stringify(t);
    assert.equal(json.includes('/36'), false);
    assert.equal(/de 36/.test(json), false);
    assert.equal('pontos' in t || 'p' in t, false);
  }
  // Mesmo perfil, pontos diferentes: tela idêntica.
  assert.deepEqual(core.analisar('pontos=0').tela, core.analisar('pontos=17').tela);
  assert.deepEqual(core.analisar('pontos=33').tela, core.analisar('pontos=36').tela);
});

test('Comandante não diz que domina tudo e aponta o time', () => {
  const t = core.analisar('pontos=35').tela;
  assert.equal(/domina/i.test(t.texto), false);
  assert.match(t.texto, /time/);
  assert.match(t.texto, /CI/);
});

test('blocos: barras, maior ganho no menor percentual, desempate por prioridade', () => {
  const t = core.analisar('pontos=30&' + BLOCOS_OK).tela;
  assert.equal(t.blocos.lista.length, 5);
  assert.equal(t.blocos.ganho.nome, 'Verificação do que o agente entrega'); // 2/6 = 33%
  const nomes = t.blocos.lista.map((b) => b.nome).sort();
  assert.deepEqual(nomes, ['Arquitetura e padronização', 'Contexto do agente', 'Especificação antes de pedir', 'Segurança e permissões', 'Verificação do que o agente entrega']);
  // Empate em 0%: segurança vence.
  const e = core.analisar('pontos=8&b_contexto=0&b_especificacao=0&b_verificacao=0&b_seguranca=0&b_arquitetura=0').tela;
  assert.equal(e.blocos.ganho.nome, 'Segurança e permissões');
  // Tudo no máximo: barras sem "maior ganho".
  const m = core.analisar('pontos=35&b_contexto=9&b_especificacao=9&b_verificacao=6&b_seguranca=6&b_arquitetura=6').tela;
  assert.equal(m.blocos.ganho, null);
  // Estado em palavra, nunca número.
  for (const b of t.blocos.lista) assert.ok(['sólido', 'em construção', 'frágil'].includes(b.estado));
});

test('blocos ausentes, fora da faixa ou incompletos: sem barras', () => {
  for (const q of ['pontos=8', 'pontos=8&b_contexto=10&b_especificacao=0&b_verificacao=0&b_seguranca=0&b_arquitetura=0',
    'pontos=8&b_contexto=1&b_especificacao=1&b_verificacao=1&b_seguranca=7&b_arquitetura=1',
    'pontos=8&b_contexto=1&b_especificacao=1', 'pontos=8&b_contexto=NaN&b_especificacao=1&b_verificacao=1&b_seguranca=1&b_arquitetura=1']) {
    assert.equal('blocos' in core.analisar(q).tela, false, q);
  }
});

test('alerta: um item por motivo, ordem fixa, sem repetir; genérico se só vier alerta=sim', () => {
  const um = core.analisar('pontos=30&alerta=sim&alerta_motivo=idor').tela;
  assert.deepEqual(um.alerta.itens, [C.ALERTAS.idor]);
  const todos = core.analisar('pontos=8&alerta=sim&alerta_motivo=arquitetura_solta,idor,commit_sem_revisao,aprova_sem_ler,permissao_total,idor,').tela;
  assert.deepEqual(todos.alerta.itens, Object.values(C.ALERTAS));
  const gen = core.analisar('pontos=8&alerta=sim').tela;
  assert.deepEqual(gen.alerta.itens, [C.ALERTA_GENERICO]);
  for (const q of ['pontos=8', 'pontos=8&alerta=nao', 'pontos=8&alerta=nao&alerta_motivo=', 'pontos=8&alerta_motivo=xss%3Cb%3E,__proto__']) {
    assert.equal('alerta' in core.analisar(q).tela, false, q);
  }
  // Quem não usa agente vê o alerta como cuidado futuro.
  assert.equal(core.analisar('pontos=8&perfil_agente=nao&alerta=sim&alerta_motivo=idor').tela.alerta.rotulo, '// atenção: quando você usar agente');
});

test('aviso de testes é separado do alerta', () => {
  const t = core.analisar('pontos=22&aviso_testes=sim').tela;
  assert.equal(t.avisoTestes, C.AVISO_TESTES);
  assert.equal('alerta' in t, false);
  assert.equal('avisoTestes' in core.analisar('pontos=22&aviso_testes=talvez').tela, false);
});

test('perfil_agente=nao: perfil projetado, nunca conquista', () => {
  const t = core.analisar('pontos=35&perfil_agente=nao').tela;
  assert.equal(t.titulo, 'Seu perfil projetado: Comandante');
  assert.equal(t.texto, C.SEM_AGENTE.texto);
  assert.equal(core.analisar('pontos=35&perfil_agente=sim').tela.titulo, 'Você é Comandante');
});

test('inconsistências: 1 mostra a nota; 2 ou mais trocam o título', () => {
  const zero = core.analisar('pontos=30&inconsistencias=0').tela;
  assert.equal('inconsistencia' in zero, false);
  const um = core.analisar('pontos=30&inconsistencias=1').tela;
  assert.equal(um.inconsistencia.texto, C.INCONSISTENCIA);
  assert.equal(um.titulo, 'Você é Piloto com checklist');
  const dois = core.analisar('pontos=30&inconsistencias=2').tela;
  assert.equal(dois.titulo, 'Você parece Piloto com checklist');
  assert.equal(dois.rotulo, '// resultado a confirmar');
  assert.match(C.INCONSISTENCIA, /último envio/);
  assert.equal('inconsistencia' in core.analisar('pontos=30&inconsistencias=9').tela, false);
});

test('dor, projeto e nível', () => {
  for (const d of Object.keys(C.DORES)) assert.equal(core.analisar('pontos=8&dor=' + d).tela.dor, C.DORES[d]);
  for (const q of ['pontos=8', 'pontos=8&dor=', 'pontos=8&dor=ordem&dor=nivel', 'pontos=8&dor=toString']) {
    assert.equal('dor' in core.analisar(q).tela, false, q);
  }
  assert.deepEqual(core.analisar('pontos=8&projeto=nao').tela.oferta.extras, [C.PROJETO.nao]);
  assert.deepEqual(core.analisar('pontos=8&projeto=com_prazo&nivel=lead').tela.oferta.extras, [C.PROJETO.com_prazo, C.NIVEL.lead]);
  assert.deepEqual(core.analisar('pontos=8&projeto=sem_prazo&nivel=pleno').tela.oferta.extras, []);
});

test('nenhum texto vira undefined, NaN ou null', () => {
  const qs = ['p=20', 'pontos=8', 'pontos=35&perfil_agente=nao&inconsistencias=3&alerta=sim&aviso_testes=sim&' + BLOCOS_OK + '&dor=prazo&projeto=nao&nivel=lead'];
  for (const q of qs) assert.equal(/undefined|NaN|null/.test(JSON.stringify(core.analisar(q).tela)), false, q);
});

test('ignora sid, utm_* e nome/email e não os carrega no resultado', () => {
  const r = core.analisar('?pontos=8&sid=SEGREDO123&utm_source=tally&email=a%40b.com&nome=Fulano');
  const json = JSON.stringify(r);
  for (const s of ['SEGREDO123', 'tally', 'a@b.com', 'Fulano']) assert.equal(json.includes(s), false, s);
});

test('conteúdo: links https, sem placeholder', () => {
  for (const href of Object.values(C.LINKS)) assert.match(href, /^https:\/\//);
  assert.equal(/\[LINK_/.test(JSON.stringify(C)), false);
  assert.equal(C.SEM_RESULTADO.cta.href, C.LINKS.quiz);
  assert.equal(C.comUtm('https://x.test/?a=1', 'passageiro'), 'https://x.test/?a=1&' + utm('passageiro'));
});
