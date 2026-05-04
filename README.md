# Gnoke-Spirit

**Tabs as processes. IndexedDB as memory. Nothing is lost.**

Part of the [Gnoke Suite](https://github.com/edmundsparrow) by Edmund Sparrow.

🔗 **[Live Demo → edmundsparrow.github.io/gnoke-spirit](https://edmundsparrow.github.io/gnoke-spirit)**

---

## What it does

`gnoke-spirit` turns browser tabs into persistent processes. When a tab is killed — by the OS, a crash, or a forced reload — the spirit restores it exactly as it was. No flicker. No lost input. No permission prompts.

Built on raw IndexedDB. No dependencies. No build step. Works everywhere.

---

## Usage

Drop one script tag. Call one function.

```html
<script src="https://cdn.jsdelivr.net/gh/edmundsparrow/gnoke-spirit/gnoke-spirit.js"></script>
<script>
  gnokeSpirit.wake();
</script>
```

That's it. Every form input, scroll position, and focused field survives tab death automatically.

---

## API

```js
await gnokeSpirit.wake(pid?, formEl?)
```
Start the spirit. Restores last known state immediately.
- `pid` — process ID. Defaults to `location.pathname`.
- `formEl` — target a specific form instead of scanning the whole document.

```js
await gnokeSpirit.kill(pid?)
```
Wipe process memory.

```js
await gnokeSpirit.list()
```
Returns all active process IDs. Your process table.

---

## Multi-tab example

```js
await gnokeSpirit.wake('/editor');   // Tab 1
await gnokeSpirit.wake('/settings'); // Tab 2
// Each isolated. Kill either — it comes back.
```

---

## What is and isn't persisted

| Persisted | Not persisted |
|---|---|
| Text inputs | Passwords |
| Textareas | Tokens / secrets |
| Select values | Auth state |
| Scroll position | Cookies |
| Active field focus | Anything sensitive |

---

## The idea

> Persistence is not a feature. It's a background guarantee.

`gnoke-spirit` is the missing OS layer for the browser. Each tab is an independent process with its own memory. The browser is an OS.

---

## Prior work

Built on [gnoke-savenative](https://dev.to/edmundsparrow/i-accidentally-wrote-a-filesystem-driver-for-a-browser-53cd). Spirit replaces the filesystem dependency with pure IndexedDB — universal, zero-permission, zero dependencies.

---

## License

MIT — Edmund Sparrow © 2026