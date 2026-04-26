# Test Troubleshooting

---

## 2026-04-26 — CSV Export

### 1. Unauthenticated request returns 403, not 401

`fastapi.security.HTTPBearer` returns 403 when no `Authorization` header is present; 401 is only raised by `get_current_user` when a token *is* present but invalid. These are two distinct code paths requiring two separate tests.

**Fix:** Test missing-header → assert 403. Test invalid token → assert 401.

---

### 2. `document.createElement` spy caused infinite recursion in hook tests

Spying on `document.createElement` naively intercepts React's own internal calls during `renderHook`, causing a stack overflow.

**Fix:** Capture `document.createElement.bind(document)` before installing the spy; delegate all non-`"a"` tags to the original. Also call `appendChildSpy.mockClear()` after `renderHook` to exclude React's mount-time DOM mutations from export assertions.

---

### 3. `URL.revokeObjectURL` called before browser processes download *(latent)*

`anchor.click()` is async in some browsers; revoking the object URL synchronously after it can silently abort the download.

**Fix (if download failures reported):** Defer with `setTimeout(() => URL.revokeObjectURL(url), 100)`.

---

### 4. Toast `onDismiss` reference restarts auto-dismiss timer *(latent)*

`onDismiss` is in the `useEffect` dependency array. An inline arrow function passed as prop changes reference every render, restarting the 3-second timer. Safe today because `setToast` from `useState` is stable, but fragile if `Toast` is reused elsewhere.

**Fix:** Use a `useRef` to hold `onDismiss` and run the effect with an empty dependency array.