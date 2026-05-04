(() => {
  const DB = 'gnoke:spirit';
  const STORE = 'processes';
  const SENSITIVE = new Set(['password', 'token', 'cc', 'cvv', 'ssn', 'secret']);

  const openDB = () => new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
    r.onsuccess = e => res(e.target.result);
    r.onerror = e => rej(e.target.error);
  });

  const tx = (db, mode) => db.transaction(STORE, mode).objectStore(STORE);

  const dbGet = (db, key) => new Promise((res, rej) => {
    const r = tx(db, 'readonly').get(key);
    r.onsuccess = e => res(e.target.result);
    r.onerror = e => rej(e.target.error);
  });

  const dbPut = (db, val, key) => new Promise((res, rej) => {
    const r = tx(db, 'readwrite').put(val, key);
    r.onsuccess = () => res();
    r.onerror = e => rej(e.target.error);
  });

  const dbDel = (db, key) => new Promise((res, rej) => {
    const r = tx(db, 'readwrite').delete(key);
    r.onsuccess = () => res();
    r.onerror = e => rej(e.target.error);
  });

  const dbKeys = (db) => new Promise((res, rej) => {
    const r = tx(db, 'readonly').getAllKeys();
    r.onsuccess = e => res(e.target.result);
    r.onerror = e => rej(e.target.error);
  });

  const isSensitive = f =>
    f.type === 'password' ||
    SENSITIVE.has(f.type) ||
    [...SENSITIVE].some(s => (f.name || f.id || '').toLowerCase().includes(s));

  const sel = el =>
    el.id ? `#${el.id}` : el.name ? `[name="${el.name}"]` : el.tagName.toLowerCase();

  const capture = (root) => {
    const r = root || document;
    return {
      v: 1,
      ts: Date.now(),
      url: location.href,
      scroll: { x: scrollX, y: scrollY },
      focus: document.activeElement ? sel(document.activeElement) : null,
      forms: [...(r.tagName === 'FORM' ? [r] : r.querySelectorAll('form'))].map(f => ({
        sel: sel(f),
        fields: [...f.querySelectorAll('input,textarea,select')]
          .filter(el => !isSensitive(el) && (el.name || el.id))
          .map(el => ({ sel: sel(el), val: el.value }))
      })).filter(f => f.fields.length)
    };
  };

  const restore = async (db, pid, root) => {
    const state = await dbGet(db, pid);
    if (!state || state.url !== location.href) return;
    scrollTo(state.scroll.x, state.scroll.y);
    const r = root || document;
    state.forms.forEach(({ sel: fSel, fields }) => {
      const form = r.tagName === 'FORM' ? r : r.querySelector(fSel);
      if (!form) return;
      fields.forEach(({ sel: eSel, val }) => {
        const el = form.querySelector(eSel);
        if (el) el.value = val;
      });
    });
    if (state.focus) document.querySelector(state.focus)?.focus();
  };

  window.gnokeSpirit = {
    async wake(pid, formEl) {
      pid = pid || location.pathname;
      const db = await openDB();
      await restore(db, pid, formEl);
      let t;
      const target = formEl || window;
      target.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(async () => {
          const d = await openDB();
          await dbPut(d, capture(formEl), pid);
        }, 300);
      });
      window.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'hidden') {
          const d = await openDB();
          await dbPut(d, capture(formEl), pid);
        }
      });
      return pid;
    },

    async kill(pid) {
      pid = pid || location.pathname;
      const db = await openDB();
      await dbDel(db, pid);
    },

    async list() {
      const db = await openDB();
      return dbKeys(db);
    }
  };
})();

