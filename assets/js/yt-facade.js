/*
 * Player do YouTube em fachada, reutilizável.
 *   YtFacade.mount(elemento, { id, title, onPlay, placeholder: { rotulo, texto, badge } })
 *
 * - Sem ID válido: placeholder no tamanho do player (16:9). Nenhuma requisição ao YouTube.
 * - Com ID: miniatura + botão de play. O iframe (youtube-nocookie.com, autoplay) só nasce depois do clique,
 *   porque o player pesa e coloca cookies antes de a pessoa decidir assistir.
 * CSS: /assets/css/yt-facade.css
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.YtFacade = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ID_VALIDO = /^[A-Za-z0-9_-]{6,20}$/;

  function idValido(id) { return typeof id === 'string' && ID_VALIDO.test(id); }
  function urlMiniatura(id) { return idValido(id) ? 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' : ''; }
  function urlEmbed(id) { return idValido(id) ? 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1' : ''; }

  var PADRAO = {
    rotulo: '// vídeo em gravação',
    texto: 'O vídeo ainda não está disponível.',
    badge: 'Em breve'
  };

  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto) e.textContent = texto;
    return e;
  }

  function montarPlaceholder(raiz, opts) {
    var ph = opts.placeholder || {};
    var rotulo = ph.rotulo || PADRAO.rotulo, texto = ph.texto || PADRAO.texto, badge = ph.badge || PADRAO.badge;
    var box = el('div', 'yt yt--placeholder');
    var barra = el('div', 'yt-bar');
    barra.setAttribute('aria-hidden', 'true');
    ['a', 'b', 'c'].forEach(function (c) { barra.appendChild(el('span', 'yt-dot yt-dot--' + c)); });
    barra.appendChild(el('span', 'yt-bar-title', 'terminal'));
    var corpo = el('div', 'yt-body');
    corpo.appendChild(el('p', 'yt-label', rotulo));
    corpo.appendChild(el('p', 'yt-text', texto));
    corpo.appendChild(el('span', 'yt-soon', badge));
    box.appendChild(barra);
    box.appendChild(corpo);
    raiz.appendChild(box);
  }

  function montarFachada(raiz, opts) {
    var titulo = opts.title || 'Vídeo';
    var box = el('div', 'yt yt--facade');
    var btn = el('button', 'yt-play');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Reproduzir o vídeo: ' + titulo);
    var img = el('img', 'yt-thumb');
    img.src = urlMiniatura(opts.id);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    btn.appendChild(img);
    var icone = el('span', 'yt-play-icon');
    icone.setAttribute('aria-hidden', 'true');
    icone.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    btn.appendChild(icone);
    btn.appendChild(el('span', 'yt-play-title', titulo));
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.className = 'yt-frame';
      f.src = urlEmbed(opts.id);
      f.title = titulo;
      f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      box.textContent = '';
      box.appendChild(f);
      f.focus();
      if (typeof opts.onPlay === 'function') opts.onPlay();
    });
    box.appendChild(btn);
    raiz.appendChild(box);
  }

  function mount(raiz, opts) {
    opts = opts || {};
    raiz.textContent = '';
    if (idValido(opts.id)) montarFachada(raiz, opts);
    else montarPlaceholder(raiz, opts);
  }

  return { idValido: idValido, urlMiniatura: urlMiniatura, urlEmbed: urlEmbed, mount: mount };
});
