# Gnoke-Spirit

A single continuation point with a lifecycle. Zero dependencies. Vanilla JS. Part of the [Gnoke Suite](https://edmundsparrow.netlify.app).

---

## What it is

`Spirit(key)` gives you one opaque slot in IndexedDB with three moves:

- **`snapshot(state)`** — save the current state. Each call overwrites the previous one for that key — there is no history, only the latest.
- **`wake()`** — read it back. Returns `null` if nothing's been saved yet.
- **`purge()`** — forget this one key.
- **`wipe()`** — clear the entire store, for a full reset.

`state` can be any structured-clone-compatible value — plain objects, `Blob`, `ArrayBuffer`, `Date`, `Map`, `Set`, and (notably) a `FileSystemDirectoryHandle`/`FileSystemFileHandle`. Not functions or live DOM references.

That's the whole primitive. It doesn't know or care what's inside the state you hand it — a form's field values, a File System Access handle, a game's save slot, a wizard's step number. It's a sticky note, not a diary: one slot per key, always the latest thing written there.

---

## Install

No npm package — copy `gnoke-spirit.js` into your project, or use directly via a CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/edmundsparrow/gnoke-spirit/gnoke-spirit.js"></script>
```

Works as a plain `<script>` tag (attaches `window.Spirit`) or `require()` under CommonJS. No build step.

---

## Quick Start

```js
const draft = Spirit('draft-note');

await draft.snapshot({ text: 'half-written thought' });
// ...reload, close the tab, come back tomorrow...
const state = await draft.wake();
// { text: 'half-written thought' }

await draft.purge(); // done with this one
```

## API

### `Spirit(key, dbName = 'gnoke:spirit', store = 'tomb')`
Creates a continuation point. `key` identifies this specific slot; `dbName`/`store` let you namespace separate concerns into separate databases (see **Two Spirit instances, two databases** below).

### `spirit.snapshot(state)`
Overwrites the saved state for this key.

### `spirit.wake()`
Returns the last saved state, or `null`.

### `spirit.purge()`
Deletes this key's entry.

### `spirit.wipe()`
Clears every key in this Spirit's store — the reset button, not the everyday tool.

---

## Two Spirit instances, two databases

If you're using Spirit for more than one unrelated concern in the same app — say, a workspace handle *and* form-draft state — give them **different `dbName`s**, not just different keys in the same one:

```js
const handleSpirit = Spirit('workspace-handle', 'gnoke:spirit', 'tomb');
const formSpirit    = Spirit('draft-note',       'gnoke:spirit:forms', 'processes');
```

Two `Spirit()` calls opening the *same* database name with *different* object stores will race on IndexedDB's upgrade step — only one store gets created, since a same-version open only fires `onupgradeneeded` once. Separate databases sidestep this entirely. `gnoke-savenative` and `gnoke-persist` both follow this rule internally.

---

## Assumptions

Spirit assumes **one instance kept alive per app/key lifetime** — the IndexedDB connection opens once and is never explicitly closed. Calling `Spirit(...)` fresh per transient use (e.g. once per form submit, rather than once per app load) will accumulate open connections rather than release them.

---

## Where this is actually used

- **[gnoke-savenative](https://github.com/edmundsparrow/gnoke-savenative)** — stores the File System Access workspace handle via Spirit, so a user picks a folder once and it survives reload without re-prompting.
- **[gnoke-persist](https://github.com/edmundsparrow/gnoke-persist)** — form-state autosave (capturing field values, scroll position, focus, and restoring them) is built as a thin wrapper *around* Spirit, not a separate implementation. If you're looking for form autosave specifically, that's the repo — this one is just the primitive underneath it.

---

## License

MIT © Edmund Sparrow — [Gnoke Suite](https://edmundsparrow.netlify.app)
