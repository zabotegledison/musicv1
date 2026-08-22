// Lightweight in-place language switcher for the INFORMATIONAL pages only
// (about.html / matrix.html / research.html). The APP (index.html) is not
// affected by this file and stays English-only.
//
// Usage: each page defines window.BSL_I18N_CONTENT = { en:{...}, it:{...}, pt:{...} }
// before including this script, with a matching set of keys per language.
// Elements carry data-i18n="<key>" and get their innerHTML replaced on switch.

(function () {
  const NAV_LABELS = {
    en: { home: 'Home', app: 'App', how: 'How It Works', matrix: 'Rhythmic Matrix', research: 'Research & Context' },
    it: { home: 'Home', app: 'App', how: 'Come Funziona', matrix: 'Matrice Ritmica', research: 'Ricerca e Contesto' },
    pt: { home: 'Home', app: 'App', how: 'Como Funciona', matrix: 'Matriz Rítmica', research: 'Pesquisa e Contexto' }
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
    document.querySelectorAll('.lang-switch button').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem('bslInfoLang', lang); } catch (e) {}
  }

  function initLangSwitch() {
    const el = document.getElementById('langSwitch');
    if (!el) return;
    el.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
    });
    let saved = 'en';
    try { saved = localStorage.getItem('bslInfoLang') || 'en'; } catch (e) {}
    applyLanguage(saved);
  }

  document.addEventListener('DOMContentLoaded', initLangSwitch);
})();
