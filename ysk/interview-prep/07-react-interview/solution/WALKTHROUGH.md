# Solution Walkthrough — Decision Notes

Read this after you've attempted each level. These are the answers you should be able to articulate to the interviewer.

---

## Level 1 — Why these state variables?

```ts
const [activities, setActivities] = useState<Activity[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

**What to say**: "I start with `isLoading: true` because the first thing that renders should be a spinner. `error` is nullable — null means no error, a string is the message. I avoid a combined `status: 'idle' | 'loading' | 'error' | 'success'` union here because I'd need `data` and `error` alongside it anyway."

**Common mistake**: Storing `isLoaded: boolean` + `isLoading: boolean` — these are derived from each other, leading to impossible states.

---

## Level 1 — The cancelled flag pattern

```ts
useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      const data = await fetchActivities(1, activeFilter);
      if (!cancelled) setActivities(data.activities); // ← key line
    } catch { ... }
  }

  load();
  return () => { cancelled = true; };
}, [activeFilter]);
```

**What to say**: "React doesn't cancel promises. If `activeFilter` changes before the first fetch completes, the second fetch could resolve first and then get overwritten by the stale first response. The `cancelled` flag prevents setting state on a stale request."

**Interviewer follow-up**: "Could you use AbortController instead?" → Yes: `const controller = new AbortController()`, pass `{ signal: controller.signal }` to fetch, cleanup with `controller.abort()`. Same concept.

---

## Level 2 — Client-side vs server-side filtering

**Choice made**: Re-fetch from API on filter change (reset page to 1).

**What to say**: "I chose to re-fetch rather than client-side filter because: (1) the API supports it, (2) the dataset may be large — we're only getting one page of results, so we don't have all items locally, (3) the server can do it more efficiently. If we had loaded all data upfront, client-side filtering would be fine."

---

## Level 3 — Separate `isLoadingMore` vs `isLoading`

**What to say**: "Two separate loading states because the UX is different: initial load shows a full-page spinner (or skeleton), load-more only spins the button. Using one `isLoading` flag would either leave a blank page while loading more, or flash the full spinner on every load-more click."

---

## Level 4 — Optimistic update pattern

```ts
// 1. Update immediately
setActivities(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));

try {
  await markActivityRead(id);
  // 2. API succeeded — state is already correct, nothing to do
} catch {
  // 3. Rollback on failure
  setActivities(prev => prev.map(a => a.id === id ? { ...a, read: false } : a));
  setToast('Could not mark as read.');
}
```

**What to say**: "Optimistic UI means we trust the update will succeed. The user sees instant feedback. On failure, we roll back and show a toast. This is the same pattern React Query and SWR use under the hood."

**Interviewer follow-up**: "What if the user clicks multiple items rapidly?" → Each `handleMarkRead` call is independent. The functional update form `prev => prev.map(...)` ensures we're always working from current state, not a stale closure.

---

## Bonus — Auto-refresh cleanup

```ts
useEffect(() => {
  const poll = async () => {
    if (document.visibilityState === 'hidden') return; // pause on hidden tab
    // fetch and prepend new items...
  };

  const id = setInterval(poll, 30_000);
  return () => clearInterval(id); // cleanup on unmount
}, [activeFilter]);
```

**What to say**: "Two things matter here: (1) clearing the interval on unmount to avoid memory leaks and state updates on unmounted components; (2) checking `visibilityState` so we don't spam the API while the user is on a different tab. A further improvement would be to use the `visibilitychange` event to immediately resume polling when they return."

---

## useCallback — when it actually matters

```ts
const handleMarkRead = useCallback(async (id: string) => { ... }, []);
```

**What to say**: "I wrap this in `useCallback` because it's passed as a prop to `ActivityItem`. Without it, a new function reference is created on every render, causing every `ActivityItem` to re-render. With `React.memo` on `ActivityItem`, this would matter. Without `memo`, it's a minor optimization but a good habit."

**When NOT to use useCallback**: Event handlers that are not passed to children — wrapping them adds overhead for no benefit.

---

## Custom hook extraction — why it matters

**What to say**: "I extracted `useActivityFeed` to keep the component as declarative UI only. The hook is independently testable (you can test it with `renderHook` from Testing Library without rendering any DOM). The component becomes a mapping from state to JSX — easy to read, easy to change."

---

## Accessibility points to mention

- `role="feed"` on the list (WAI-ARIA feed pattern)
- `aria-live="polite"` on loading state
- `aria-label` on unread dot (screen readers can't see a colored circle)
- `tabIndex={0}` + `onKeyDown` on list items so keyboard users can activate them
- `aria-pressed` on filter buttons (they're toggles)
