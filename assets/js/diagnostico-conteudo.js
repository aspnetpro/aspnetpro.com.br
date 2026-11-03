/*
 * Textos e links da página de resultado do diagnóstico de engenharia agêntica.
 * Para trocar um link, edite só o objeto LINKS.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DiagnosticoConteudo = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LINKS = {
    kit: 'https://github.com/aspnetpro/kit-agentico-dotnet',
    workshop: 'https://aspnetpro.com.br/workshop-dev-net-ia-10x/',
    mid: 'https://aspnetpro.com.br/bootcamp-dev-net-ia-10x/',
    mentoria: 'https://aspnetpro.com.br/mentoria-dev-net-ia-10x',
    quiz: 'https://tally.so/r/bZqvge'
  };

  // Ordem importa: é a ordem dos eixos do radar e do desempate do gargalo (RN03).
  var DIMENSOES = [
    { chave: 'ctx', nome: 'Contexto' },
    { chave: 'wf', nome: 'Workflow' },
    { chave: 'spec', nome: 'Spec' },
    { chave: 'ver', nome: 'Verificação' },
    { chave: 'seg', nome: 'Segurança' },
    { chave: 'arq', nome: 'Arquitetura' }
  ];

  var CTA_WORKSHOP = { texto: 'Workshop: configure o agente no seu projeto →', href: LINKS.workshop };

  // `max` é o limite superior da faixa (RN02).
  var PERFIS = [
    {
      id: 'passageiro', nome: 'Passageiro', max: 10,
      frase: 'Você usa IA como consulta. O agente ainda não pilotou nada no seu projeto.',
      paragrafo: 'O risco não é fazer errado, é ficar pra trás: enquanto você copia e cola do chat, tem dev entregando a mesma feature em um terço do tempo.',
      kit: 'Começa pelo passo 0: em 90 minutos você roda o seu primeiro ciclo completo com um agente.',
      cta2: CTA_WORKSHOP
    },
    {
      id: 'piloto-sem-checklist', nome: 'Piloto sem checklist', max: 20,
      frase: 'Você já voa, e voa rápido. Mas sem procedimento.',
      paragrafo: 'É o perfil mais produtivo e o mais arriscado ao mesmo tempo: o agente entrega rápido e decide sozinho regras de negócio, testes e segurança que ninguém revisou.',
      kit: 'Foco nas Rodadas A e B: você vai ver quantas decisões o agente toma sem te perguntar.',
      cta2: CTA_WORKSHOP
    },
    {
      id: 'piloto-de-linha', nome: 'Piloto de linha', max: 29,
      frase: 'Você domina a ferramenta e o fluxo. O gargalo agora é garantir que o resultado está certo e seguro.',
      paragrafo: 'Você já trabalha por etapas e dá contexto ao agente. O que separa você do próximo nível é transformar isso em processo: spec, testes como contrato, verificação e segurança em toda entrega.',
      kit: 'Use a ficha de comparação para medir a diferença do método no seu jeito de trabalhar.',
      cta2: { texto: 'Turma do Método SDD →', href: LINKS.mid }
    },
    {
      id: 'comandante', nome: 'Comandante', max: 36,
      frase: 'Você conduz agentes com processo.',
      paragrafo: 'O próximo salto não é usar melhor a ferramenta, é desenhar o sistema que os agentes constroem: arquitetura modular, fronteiras claras, operação.',
      kit: 'Faça mesmo assim: a ficha de comparação é um ótimo material pra convencer o seu time.',
      cta2: { texto: 'Mentoria Dev .NET IA 10x →', href: LINKS.mentoria }
    }
  ];

  var GARGALOS = {
    ctx: { titulo: 'Seu agente começa toda conversa do zero', dica: 'Um arquivo de instruções curto, com comandos, convenções e proibições, muda o resultado mais do que trocar de modelo.', kit: 'Passo 1 e o CLAUDE.md comentado' },
    wf: { titulo: 'Você pede tudo de uma vez', dica: 'Peça um plano antes do código, e execute em etapas que terminam com build e testes verdes.', kit: 'Passos 4 e 5, comando /plano' },
    spec: { titulo: 'O agente decide as regras de negócio por você', dica: 'Antes de implementar, escreva os cenários. Se você travar no terceiro, o pedido não está claro nem pra você.', kit: 'Passo 3, comando /spec' },
    ver: { titulo: '"Testes passando" é o que ele diz, não o que ele fez', dica: 'Leia o diff procurando teste alterado, mock suspeito e exceção engolida.', kit: 'Passo 6 e o checklist de sinais de alerta' },
    seg: { titulo: 'Funciona, mas confere quem está pedindo?', dica: 'Todo endpoint com id de recurso precisa conferir o dono. E o agente não deveria rodar com tudo liberado.', kit: 'Checklist de segurança do agente' },
    arq: { titulo: 'O agente replica a bagunça que encontra', dica: 'Documente onde cada coisa mora. Fronteiras claras são o cercadinho do agente.', kit: 'docs/arquitetura.md do kit' }
  };

  var SEM_GARGALO = { titulo: 'Nenhum gargalo. Nota máxima nas 6 dimensões.', texto: 'Agora o desafio é fazer o seu time chegar aqui.' };

  var ALERTA = {
    rotulo: '// alerta de segurança',
    titulo: 'Seu agente roda com tudo liberado.',
    texto: 'Qualquer instrução maliciosa escondida num README, numa issue ou numa página que ele leia vira um comando executado na sua máquina. O kit traz uma configuração de permissões pronta: comece por ela.'
  };

  var SEM_RESULTADO = {
    rotulo: '// diagnóstico de engenharia agêntica',
    titulo: 'Não encontramos a sua pontuação.',
    texto: 'O link pode ter sido cortado ou alterado. Leva uns 4 minutos pra fazer o diagnóstico e ver o seu nível, o seu radar e o seu gargalo.',
    cta1: { texto: 'Fazer o diagnóstico →', href: LINKS.quiz },
    cta2: { texto: 'Ir direto pro kit →', href: LINKS.kit }
  };

  function textoCompartilhar(nomePerfil) {
    return 'Fiz o diagnóstico de engenharia agêntica da ASP .NET PRO e meu nível é ' + nomePerfil + '. Qual é o seu? ' + LINKS.quiz;
  }

  return {
    LINKS: LINKS, DIMENSOES: DIMENSOES, PERFIS: PERFIS, GARGALOS: GARGALOS,
    SEM_GARGALO: SEM_GARGALO, ALERTA: ALERTA, SEM_RESULTADO: SEM_RESULTADO,
    textoCompartilhar: textoCompartilhar
  };
});
