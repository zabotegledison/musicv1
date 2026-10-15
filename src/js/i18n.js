// In-place language switcher used across the site.
//
// Each page defines window.BSL_I18N_CONTENT = { en:{...}, it:{...}, pt:{...}, es:{...} }
// before including this script, with a matching set of keys per language.
// Elements carry data-i18n="<key>" and get their innerHTML replaced on switch;
// navigation links carry data-i18n-nav and are handled from the table below.

(function () {
  const LANGS = [
    { code: 'en', flag: '\u{1F1FA}\u{1F1F8}', name: 'English' },
    { code: 'it', flag: '\u{1F1EE}\u{1F1F9}', name: 'Italiano' },
    { code: 'pt', flag: '\u{1F1E7}\u{1F1F7}', name: 'Portugu\u00eas' },
    { code: 'es', flag: '\u{1F1EA}\u{1F1F8}', name: 'Espa\u00f1ol' }
  ];

  const NAV_LABELS = {
    en: { home: 'Home', app: 'App', how: 'How It Works', matrix: 'Rhythmic Matrix', research: 'Research & Context' },
    it: { home: 'Home', app: 'App', how: 'Come Funziona', matrix: 'Matrice Ritmica', research: 'Ricerca e Contesto' },
    pt: { home: 'Home', app: 'App', how: 'Como Funciona', matrix: 'Matriz Rítmica', research: 'Pesquisa e Contexto' },
    es: { home: 'Inicio', app: 'App', how: 'Cómo Funciona', matrix: 'Matriz Rítmica', research: 'Investigación y Contexto' }
  };

  function applyLanguage(lang) {
    const content = window.BSL_I18N_CONTENT || {};
    const dict = content[lang] || content.en || {};
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-i18n-nav]').forEach((el) => {
      const key = el.getAttribute('data-i18n-nav');
      if (NAV_LABELS[lang] && NAV_LABELS[lang][key]) el.textContent = NAV_LABELS[lang][key];
    });
    document.querySelectorAll('.lang-switch [data-lang]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    const current = LANGS.find((l) => l.code === lang) || LANGS[0];
    const triggerLabel = document.getElementById('langTriggerLabel');
    if (triggerLabel) triggerLabel.innerHTML = '<span class="lang-flag">' + current.flag + '</span>' + current.name;
    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem('bslInfoLang', lang); } catch (e) {}
    // Strings written by scripts (status lines, empty states) are not in the
    // markup, so they can't be swapped above. Announce the change and let
    // whoever owns them refresh their own labels.
    try { document.dispatchEvent(new CustomEvent('bsl:languagechange', { detail: { lang } })); } catch (e) {}
  }

  // Which language to open in.
  //   1. a language the visitor picked here before — an explicit choice always
  //      wins, detection never overrides it;
  //   2. otherwise the language their browser asks for, in their own order of
  //      preference (so a Brazilian abroad still gets Portuguese: it follows
  //      the device, not the country the connection comes from);
  //   3. otherwise English.
  function startingLanguage() {
    const known = LANGS.map((l) => l.code);
    try {
      const chosen = localStorage.getItem('bslInfoLang');
      if (chosen && known.indexOf(chosen) !== -1) return chosen;
    } catch (e) {}
    const asked = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || ''];
    for (let i = 0; i < asked.length; i++) {
      // "pt-BR" and "pt-PT" both answer to "pt"
      const base = String(asked[i]).toLowerCase().split('-')[0];
      if (known.indexOf(base) !== -1) return base;
    }
    return 'en';
  }

  function initLangSwitch() {
    const el = document.getElementById('langSwitch');
    if (!el) return;

    // Build the dropdown so every page stays in sync from this one place.
    el.innerHTML =
      '<button type="button" class="lang-trigger" id="langTrigger" aria-haspopup="listbox" aria-expanded="false">' +
        '<span id="langTriggerLabel"></span><span class="lang-chevron">\u25BE</span>' +
      '</button>' +
      '<div class="lang-panel" role="listbox">' +
        LANGS.map((l) =>
          '<button type="button" data-lang="' + l.code + '" role="option">' +
            '<span class="lang-flag">' + l.flag + '</span>' + l.name +
          '</button>'
        ).join('') +
      '</div>';

    const trigger = el.querySelector('.lang-trigger');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = el.classList.toggle('open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    el.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyLanguage(btn.getAttribute('data-lang'));
        el.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', (e) => {
      if (!el.contains(e.target)) {
        el.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    applyLanguage(startingLanguage());
  }

  document.addEventListener('DOMContentLoaded', initLangSwitch);
})();
