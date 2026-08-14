/**
 * Spirit — a single continuation point with a lifecycle.
 * State is opaque: any structured-clone-compatible value is legal
 * (objects, Blob, ArrayBuffer, Date, Map, Set — not functions or live DOM refs).
 *
 * Each snapshot() overwrites the previous one for that key — there is no
 * history, only the latest state. purge() removes one key; wipe() clears
 * the entire store, for a full reset.
 *
 * Assumes one Spirit instance kept alive per app/key lifetime — the
 * IndexedDB connection is opened once and never closed. Calling
 * Spirit(...) fresh per transient use (e.g. once per form submit) will
 * accumulate open connections rather than release them.
 */
const Spirit = (key, dbName = 'gnoke:spirit', store = 'tomb') => {
  let dbp;

  const db = () => dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open(dbName, 1);

    r.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(store))
        d.createObjectStore(store);
    };

    r.onsuccess = e => {
      const d = e.target.result;
      d.onversionchange = () => d.close();
      res(d);
    };

    r.onerror = () => {
      dbp = null;
      rej(r.error);
    };
  });

  const op = (mode, fn) => db().then(d => new Promise((res, rej) => {
    const t = d.transaction(store, mode);
    const req = fn(t.objectStore(store));
    const fail = () =>
      rej(req.error || t.error || new Error('IDB op failed'));

    req.onsuccess = () => res(req.result);
    req.onerror = t.onabort = fail;
  }));

  return {
    snapshot: state =>
      op('readwrite', s =>
        s.put({ v: 1, ts: Date.now(), state }, key)),

    wake: () =>
      op('readonly', s => s.get(key))
        .then(r => r?.state ?? null),

    purge: () =>
      op('readwrite', s => s.delete(key))
        .then(() => true),

    wipe: () =>
      op('readwrite', s => s.clear())
        .then(() => true)
  };
};

// Zero-dependency export: works as a plain <script> tag (attaches to
// window.Spirit) or as a CommonJS require — no build step needed.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Spirit = factory();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  return Spirit;
});
