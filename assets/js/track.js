/*
 * Camada única de tracking do aspnetpro.com.br
 * - Consentimento (LGPD) com Google Consent Mode v2 e banner próprio
 * - GA4 em todas as páginas; Meta Pixel só nas comerciais e só após o aceite
 * - Atribuição: UTMs/fbclid/gclid da sessão repassados aos links da Kiwify
 * - Eventos: view_item, select_item, generate_lead (+ ViewContent/Contact/Lead no Pixel)
 *
 * Carregar de forma síncrona no <head>, depois de definir a configuração da página:
 *   <script>window.ASPNETPRO_TRACK = { pixel: true, item: { item_id, item_name, item_category, price } };</script>
 *   <script src="/assets/js/track.js"></script>
 *
 * Opções de window.ASPNETPRO_TRACK:
 *   pixel        true nas páginas comerciais. Ausente/false = só GA4 (ex.: /conteudo/).
 *   item         produto da página: dispara view_item (GA4) e ViewContent (Pixel).
 *   pixelEvents  eventos extras de Pixel ao carregar, ex.: [['CompleteRegistration', {...}]].
 *
 * Nunca disparar eventos de checkout/compra (GA4 ou Pixel): a Kiwify já envia esses eventos.
 */
(function (w, d) {
  'use strict';

  var GA_ID = 'G-8WGFZ1V9EY';
  var PIXEL_ID = '1101401740490109';
  var CONSENT_KEY = 'aspnetpro_consent';
  var ATTR_KEY = 'aspnetpro_attr';
  var ATTR_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
  var PRIVACY_URL = '/politica-de-privacidade/';

  var cfg = w.ASPNETPRO_TRACK || {};
  var pixelLoaded = false;

  // ======= STORAGE SEGURO (navegação privada / storage bloqueado não quebram nada) =======
  function store(kind) {
    try { return w[kind]; } catch (e) { return null; }
  }
  function getItem(kind, key) {
    try { var s = store(kind); return s ? s.getItem(key) : null; } catch (e) { return null; }
  }
  function setItem(kind, key, value) {
    try { var s = store(kind); if (s) s.setItem(key, value); } catch (e) { /* ignora */ }
  }

  // ======= GA4 + CONSENT MODE V2 =======
  w.dataLayer = w.dataLayer || [];
  function gtag() { w.dataLayer.push(arguments); }
  w.gtag = w.gtag || gtag;

  var consent = getItem('localStorage', CONSENT_KEY); // 'granted' | 'denied' | null

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
  if (consent === 'granted') applyConsent('granted');

  gtag('js', new Date());
  gtag('config', GA_ID);

  var ga = d.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  d.head.appendChild(ga);

  function applyConsent(value) {
    gtag('consent', 'update', {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value
    });
  }

  // ======= META PIXEL (só com consentimento) =======
  function externalId() {
    var id = getItem('localStorage', 'ext_id');
    if (!id) {
      id = (w.crypto && w.crypto.randomUUID) ? w.crypto.randomUUID()
        : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12);
      setItem('localStorage', 'ext_id', id);
    }
    return id;
  }

  function loadPixel() {
    if (pixelLoaded || !cfg.pixel) return;
    pixelLoaded = true;

    /* eslint-disable */
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(w, d,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    w.fbq('init', PIXEL_ID, { external_id: externalId() });
    w.fbq('track', 'PageView');

    if (cfg.item) {
      w.fbq('track', 'ViewContent', {
        content_ids: [cfg.item.item_id],
        content_name: cfg.item.item_name,
        content_category: cfg.item.item_category,
        content_type: 'product',
        value: cfg.item.price,
        currency: 'BRL'
      });
    }

    (cfg.pixelEvents || []).forEach(function (ev) {
      w.fbq('track', ev[0], ev[1] || {});
    });
  }

  function pixel(eventName, params) {
    if (pixelLoaded && w.fbq) w.fbq('track', eventName, params || {});
  }

  if (consent === 'granted') loadPixel();

  // ======= ATRIBUIÇÃO DA SESSÃO =======
  // Guarda os parâmetros de campanha da entrada e reaplica em qualquer página da mesma sessão,
  // para que "entrou pela home com UTM e comprou na LP" chegue à Kiwify com a UTM.
  function readAttribution() {
    var saved = {};
    try { saved = JSON.parse(getItem('sessionStorage', ATTR_KEY) || '{}') || {}; } catch (e) { saved = {}; }

    var params;
    try { params = new URLSearchParams(w.location.search); } catch (e) { return saved; }

    var fresh = {};
    var hasFresh = false;
    ATTR_PARAMS.forEach(function (p) {
      var v = params.get(p);
      if (v) { fresh[p] = v; hasFresh = true; }
    });

    // Nova campanha na URL substitui a anterior inteira (não mistura origens).
    if (hasFresh) {
      setItem('sessionStorage', ATTR_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return saved;
  }

  var attribution = readAttribution();

  function decorateCheckout(a) {
    if (!a || !a.href) return;
    try {
      var url = new URL(a.href);
      Object.keys(attribution).forEach(function (k) {
        if (!url.searchParams.has(k)) url.searchParams.set(k, attribution[k]);
      });
      a.href = url.toString();
    } catch (e) { /* href inválido: deixa como está */ }
  }

  // ======= EVENTOS =======
  function gaItem(item) {
    return {
      item_id: item.item_id,
      item_name: item.item_name,
      item_category: item.item_category,
      price: item.price
    };
  }

  function track(name, params) {
    try { gtag('event', name, params || {}); } catch (e) { /* ignora */ }
  }

  if (cfg.item) {
    track('view_item', { currency: 'BRL', value: cfg.item.price, items: [gaItem(cfg.item)] });
  }

  function contact(itemId) {
    var product = itemId || (cfg.item && cfg.item.item_id) || 'geral';
    track('generate_lead', { method: 'whatsapp', item_id: product });
    pixel('Contact', { content_name: product });
  }

  function isCheckout(href) { return /pay\.kiwify\.com\.br/i.test(href); }
  function isWhatsApp(href) { return /(wa\.me|api\.whatsapp\.com)\//i.test(href); }

  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';

    // Só repassa a atribuição: begin_checkout/purchase (GA4) e InitiateCheckout/Purchase (Pixel)
    // são enviados pela própria Kiwify. Disparar aqui contaria em dobro.
    if (isCheckout(href)) {
      decorateCheckout(a);
      return;
    }

    if (isWhatsApp(href)) {
      contact(a.getAttribute('data-item'));
      return;
    }

    var selected = a.getAttribute('data-select-item');
    if (selected) {
      track('select_item', {
        item_list_id: a.getAttribute('data-list') || 'home',
        items: [{ item_id: selected, item_name: a.getAttribute('data-item-name') || selected }]
      });
    }
  }, true);

  function decorateAll() {
    var links = d.querySelectorAll('a[href*="pay.kiwify.com.br"]');
    for (var i = 0; i < links.length; i++) decorateCheckout(links[i]);
  }

  // ======= BANNER DE CONSENTIMENTO =======
  function closeBanner() {
    var el = d.getElementById('aspnetpro-consent');
    if (el) el.parentNode.removeChild(el);
  }

  function choose(value) {
    setItem('localStorage', CONSENT_KEY, value);
    consent = value;
    applyConsent(value);
    if (value === 'granted') loadPixel();
    closeBanner();
  }

  function showBanner() {
    if (d.getElementById('aspnetpro-consent')) return;
    var box = d.createElement('div');
    box.id = 'aspnetpro-consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', 'Aviso de cookies');
    box.style.cssText = [
      'position:fixed', 'left:16px', 'right:16px', 'bottom:16px', 'z-index:9999',
      'max-width:560px', 'margin:0 auto', 'background:#13161d', 'color:#eef1f6',
      'border:1px solid #2c3240', 'border-radius:14px', 'padding:18px 20px',
      'box-shadow:0 18px 50px rgba(0,0,0,0.55)', "font-family:'IBM Plex Sans',system-ui,sans-serif",
      'font-size:14px', 'line-height:1.55'
    ].join(';');
    box.innerHTML =
      '<p style="margin:0 0 14px;color:#c4cad5;">Usamos cookies para medir o acesso ao site e melhorar nossos anúncios. ' +
      'Você pode aceitar ou recusar. <a href="' + PRIVACY_URL + '" style="color:#a98bff;text-decoration:underline;">Política de privacidade</a></p>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' +
      '<button type="button" data-consent="denied" style="cursor:pointer;min-height:44px;padding:0 18px;border-radius:10px;border:1px solid #3a4150;background:transparent;color:#eef1f6;font:inherit;font-weight:600;">Recusar</button>' +
      '<button type="button" data-consent="granted" style="cursor:pointer;min-height:44px;padding:0 18px;border-radius:10px;border:none;background:#a98bff;color:#0a0c10;font:inherit;font-weight:600;">Aceitar</button>' +
      '</div>';
    box.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute && e.target.getAttribute('data-consent');
      if (v) choose(v);
    });
    d.body.appendChild(box);
  }

  function onReady() {
    decorateAll();
    if (consent !== 'granted' && consent !== 'denied') showBanner();
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', onReady);
  else onReady();

  // ======= API PÚBLICA =======
  w.aspnetproTrack = {
    event: track,
    // Formulários de captura (MailerLite): chamar após confirmação de sucesso.
    lead: function (method, extra) {
      var params = { method: method || 'form' };
      if (extra) Object.keys(extra).forEach(function (k) { params[k] = extra[k]; });
      track('generate_lead', params);
      pixel('Lead', { content_name: params.list || params.method });
    },
    // Contato por WhatsApp aberto por script (ex.: formulário que monta a mensagem).
    // Links <a href="wa.me/..."> já são rastreados sozinhos pelo clique.
    contact: contact,
    attribution: function () { return attribution; },
    // Link "Preferências de cookies" no rodapé: reabre o banner.
    openConsent: showBanner
  };
})(window, document);
