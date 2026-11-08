import React, { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';

// Language button that translates the whole website with Google's website translator.
//
// - Google's script is only loaded once someone picks a language other than English, so visitors
//   who stay in English never contact Google.
// - The choice is kept in Google's own "googtrans" cookie, so it stays selected on every page and on
//   the next visit.
// - Note: while a language is selected, the text on screen (including signed-in pages) is sent to
//   Google to be translated.

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'si', label: 'Sinhala', native: 'සිංහල' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'zh-CN', label: 'Chinese', native: '中文' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
];

// Google's translator edits text nodes behind React's back. Without these two guards React can
// crash with "removeChild" / "insertBefore" errors after a language change.
if (typeof Node !== 'undefined' && !Node.prototype.__translateSafe) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild(child) {
    if (child.parentNode !== this) return child;
    return originalRemoveChild.apply(this, arguments);
  };
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore(newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) return newNode;
    return originalInsertBefore.apply(this, arguments);
  };
  Node.prototype.__translateSafe = true;
}

const readLanguage = () => {
  const match = document.cookie.match(/(?:^|; )googtrans=\/[^/]*\/([^;]+)/);
  const code = match ? decodeURIComponent(match[1]) : 'en';
  return LANGUAGES.some((l) => l.code === code) ? code : 'en';
};

const setCookie = (code) => {
  const host = window.location.hostname;
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  if (code === 'en') {
    document.cookie = `googtrans=; ${expire}; path=/`;
    document.cookie = `googtrans=; ${expire}; path=/; domain=${host}`;
  } else {
    document.cookie = `googtrans=/en/${code}; path=/`;
  }
};

let loading = null;
const loadTranslator = () => {
  if (loading) return loading;
  loading = new Promise((resolve) => {
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: LANGUAGES.filter((l) => l.code !== 'en').map((l) => l.code).join(','),
          autoDisplay: false,
        },
        'google_translate_element'
      );
      resolve(true);
    };
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => { loading = null; resolve(false); };
    document.head.appendChild(script);
  });
  return loading;
};

// Wait for Google's hidden language <select>, then choose the language in it
const applyLanguage = async (code) => {
  for (let i = 0; i < 50; i += 1) {
    const combo = document.querySelector('select.goog-te-combo');
    if (combo) {
      combo.value = code;
      combo.dispatchEvent(new Event('change'));
      return true;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
};

const LanguageSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(readLanguage);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const rootRef = useRef(null);

  // A language chosen earlier: load the translator so the page is translated again on this visit
  useEffect(() => {
    if (current !== 'en') loadTranslator().then((ok) => setFailed(!ok));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onClick = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, [open]);

  const choose = async (code) => {
    setOpen(false);
    if (code === current) return;
    setFailed(false);

    // Going back to English is cleanest with a reload: it removes everything Google added
    if (code === 'en') {
      setCookie('en');
      window.location.reload();
      return;
    }

    setBusy(true);
    setCookie(code);
    const loaded = await loadTranslator();
    const applied = loaded && (await applyLanguage(code));
    setBusy(false);
    if (applied) setCurrent(code);
    else { setFailed(true); setCookie(current); }
  };

  const active = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <div ref={rootRef} className="notranslate" translate="no" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change language. Current language: ${active.label}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: '999px', cursor: 'pointer',
          fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Globe size={16} aria-hidden="true" />
        <span>{busy ? '...' : active.native}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Choose a language"
          style={{
            position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)', zIndex: 90, minWidth: '12rem', padding: '0.4rem', listStyle: 'none', margin: 0,
            background: '#ffffff', borderRadius: '0.9rem', border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(15,23,42,0.25)',
          }}
        >
          {LANGUAGES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === current}>
              <button
                type="button"
                onClick={() => choose(l.code)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.55rem 0.75rem',
                  borderRadius: '0.6rem', cursor: 'pointer', border: 'none', textAlign: 'left', fontSize: '0.9rem', color: '#0f172a',
                  background: l.code === current ? '#eef2ff' : 'transparent', fontWeight: l.code === current ? 800 : 600,
                }}
              >
                <span>{l.native} <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>{l.code === 'en' ? '' : l.label}</span></span>
                {l.code === current && <Check size={15} style={{ color: '#4f46e5' }} />}
              </button>
            </li>
          ))}
          {failed && <li role="alert" style={{ padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#b91c1c' }}>Translation is unavailable. Please check your internet connection.</li>}
        </ul>
      )}

      {/* Google's translator needs this element. It stays off screen. */}
      <div id="google_translate_element" style={{ position: 'absolute', left: '-9999px', top: 0, width: 1, height: 1, overflow: 'hidden' }} />
    </div>
  );
};

export default LanguageSwitcher;
