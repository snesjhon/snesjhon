# React Interview Cheat Sheet

---

## Interview Formula

```
1. Read requirements → ask 2-3 clarifying questions (2-3 min)
2. Plan state shape + component structure out loud (3-5 min)
3. Build happy path first (20-30 min)
4. Handle edge cases: loading / error / empty (10 min)
5. Extract custom hook, memoize if needed (10 min)
6. Discuss: testing, performance, a11y (5 min)
```

**Always ask before coding:**
- "Fetching its own data or via props?"
- "Handle loading + error states?"
- "What's the data shape? Can I define the TS types?"
- "Should I extract a custom hook?"

---

## State Design

```ts
// ❌ Derived state in useState — impossible states
const [data, setData] = useState(null);
const [isLoaded, setIsLoaded] = useState(false);   // derived — can be out of sync

// ✅ Derive it
const isLoaded = data !== null;

// ❌ Parallel booleans — can be loading=true AND error="..." simultaneously
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

// ✅ Use a status union when states are mutually exclusive
type Status = 'idle' | 'loading' | 'success' | 'error';
const [status, setStatus] = useState<Status>('idle');

// ✅ Separate loading states for different UX contexts
const [isLoading, setIsLoading] = useState(true);      // full-page spinner
const [isLoadingMore, setIsLoadingMore] = useState(false); // button spinner only
```

---

## useEffect — The Most Tested Hook

### Dependency array behavior

| Array | When it runs |
|-------|-------------|
| `[]` | Once on mount, cleanup on unmount |
| `[dep]` | Mount + whenever dep changes |
| omitted | After every render ← almost never right |

### Race condition / stale fetch fix

```ts
useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      const data = await fetchActivities(1, filter);
      if (!cancelled) setActivities(data.activities); // guard stale response
    } catch (err) {
      if (!cancelled) setError(err.message);
    }
  }

  load();
  return () => { cancelled = true; }; // cleanup → ignore stale result
}, [filter]);  // re-runs when filter changes, cancels previous fetch
```

Or with AbortController:
```ts
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  return () => controller.abort();
}, [url]);
```

### Stale closure — setInterval gotcha

```ts
// ❌ count is always 0 in the closure
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []);

// ✅ functional update reads current value, not closure
useEffect(() => {
  const id = setInterval(() => setCount(prev => prev + 1), 1000);
  return () => clearInterval(id);
}, []);
```

---

## useMemo vs useCallback

| Hook | Returns | Use when |
|------|---------|----------|
| `useMemo` | A **value** | Expensive calc; object/array passed as dep or prop |
| `useCallback` | A **function** | Function passed as prop to a memoized child |

```ts
const sorted = useMemo(() => [...items].sort(compareFn), [items]);

const handleClick = useCallback((id: string) => { ... }, [dep]);
// Only matters if ActivityItem is wrapped in React.memo
// Without memo, useCallback adds overhead for no gain
```

**Don't premature-optimize.** Only add when you have a measured perf problem or prop identity is required.

---

## Optimistic Update Pattern

```ts
const handleMarkRead = useCallback(async (id: string) => {
  // 1. Update immediately
  setActivities(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));

  try {
    await markActivityRead(id);
    // 2. Success — state is already correct, nothing to do
  } catch {
    // 3. Rollback
    setActivities(prev => prev.map(a => a.id === id ? { ...a, read: false } : a));
    setToast('Could not mark as read. Please try again.');
  }
}, []);
// Functional update form (prev =>) ensures no stale closure if user clicks rapidly
```

---

## useRef — When State Isn't Right

Use when you need a value that **persists across renders but doesn't trigger a re-render**.

```ts
const intervalRef = useRef<NodeJS.Timeout | null>(null); // store interval/timeout ID
const prevValueRef = useRef(value);                      // track previous render's value
const isMountedRef = useRef(true);                       // avoid state on unmounted component

// Keep a ref in sync with state (avoids stale closure in intervals)
const activitiesRef = useRef(activities);
activitiesRef.current = activities; // update every render, no re-render triggered
```

---

## Auto-Refresh / Polling

```ts
useEffect(() => {
  const poll = async () => {
    if (document.visibilityState === 'hidden') return; // pause on hidden tab

    const data = await fetchActivities(1, filter);
    setActivities(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const newOnes = data.activities.filter(a => !existingIds.has(a.id));
      return newOnes.length > 0 ? [...newOnes, ...prev] : prev; // prepend new
    });
  };

  const id = setInterval(poll, 30_000);
  return () => clearInterval(id); // ← always clean up
}, [filter]);
```

---

## Custom Hook Pattern (Senior Signal)

```ts
// ✅ Hook owns all data + async logic
function useActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ... all state + effects here

  return { activities, isLoading, error, loadMore, handleMarkRead };
}

// ✅ Component is pure UI — just maps state to JSX
function ActivityFeed() {
  const { activities, isLoading, error, loadMore, handleMarkRead } = useActivityFeed();
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  return <ul>{ activities.map(a => <ActivityItem key={a.id} ... />) }</ul>;
}
```

**Why it matters:** Hook is independently testable with `renderHook`. Component becomes declarative UI only.

---

## Common Gotchas Quick Reference

| Gotcha | Wrong | Right |
|--------|-------|-------|
| Derived state | `useState(isLoaded)` | `const isLoaded = data !== null` |
| Impossible states | `isLoading` + `error` both booleans | Status union `'idle'\|'loading'\|'error'` |
| Stale interval | `setCount(count + 1)` | `setCount(prev => prev + 1)` |
| Race condition | No cleanup on async effect | `cancelled` flag or `AbortController` |
| Missing cleanup | `setInterval` without return | `return () => clearInterval(id)` |
| N+1 re-renders | inline `() => ...` passed to child | `useCallback` + `React.memo` on child |
| Premature memo | `useCallback` on every handler | Only when passed to memoized children |
| Load more UX | Reuse `isLoading` flag | Separate `isLoadingMore` for button |
| Stale list on filter | Append to old results | Reset list + page when filter changes |
| Polling on hidden tab | Always poll | Check `document.visibilityState` |
| Optimistic rollback | Wait for API, then update | Update immediately, rollback on catch |

---

## Performance — Proactively Mention

- `React.memo` on `ActivityItem` — renders inside a list
- Stable `key` props — use IDs, not array indexes
- `useCallback` on handlers passed to memoized children
- Very long lists → virtualization (`react-window`)
- Polling on hidden tabs → `visibilitychange` event / `visibilityState` check

---

## Accessibility — Mention at the End

```tsx
<ul role="feed" aria-live="polite">
  <li tabIndex={0} onKeyDown={...}>               {/* keyboard nav */}
    <span
      aria-label={activity.read ? undefined : 'Unread'}
      className="unread-dot"                       {/* screen reader can't see color */}
    />
  </li>
</ul>
<button aria-pressed={filter === 'comments'}>Comments</button>  {/* toggle */}
```

---

## Testing — What to Say

```
Unit (Jest + Testing Library):
  - useActivityFeed: renderHook, mock the API module
  - ActivityItem: renders unread dot, calls onMarkRead on click

Integration (msw — Mock Service Worker):
  - Full ActivityFeed — filter switching clears old list
  - Load more appends, not replaces

Don't test: internal state, refs, styles, implementation details
```

---

## Interviewer Green/Red Flags

| Signal | Green ✅ | Red ❌ |
|--------|----------|--------|
| State design | Minimal, no derived state in useState | Redundant / impossible states |
| useEffect | Correct deps + cleanup | Missing deps, no cleanup |
| Loading states | Per-action granular | Single `isLoading` for everything |
| Optimistic update | Immediate UI → reconcile on error | Wait for API before updating |
| Structure | `useActivityFeed` hook extracted | All logic inline in component |
| Performance | `useCallback` on handlers passed down | New function created every render |
