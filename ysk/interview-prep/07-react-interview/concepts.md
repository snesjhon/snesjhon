# Key React Concepts — Senior Interview Sharpener

These are the patterns most likely tested. Know them cold.

---

## 1. useEffect dependency array

```ts
useEffect(() => { ... }, [dep1, dep2]);
```

| Array | Behavior |
|-------|----------|
| `[]` | Run once on mount, cleanup on unmount |
| `[dep]` | Run on mount + whenever dep changes |
| omitted | Run after every render (almost never what you want) |

**Trap**: Including functions/objects in deps that are recreated every render → infinite loop. Fix with `useCallback` / `useMemo` or move them inside the effect.

---

## 2. Stale closure problem

```ts
const [count, setCount] = useState(0);

useEffect(() => {
  const id = setInterval(() => {
    console.log(count); // ← always logs 0, stale closure!
    setCount(count + 1); // ← WRONG — will always set to 1
  }, 1000);
  return () => clearInterval(id);
}, []); // empty deps = effect never re-runs = count is always 0
```

**Fix**: Use functional update form:
```ts
setCount(prev => prev + 1); // reads current value, not closure
```

---

## 3. Race conditions with async useEffect

```ts
useEffect(() => {
  let cancelled = false;

  fetch(url).then(data => {
    if (!cancelled) setState(data); // guard against stale response
  });

  return () => { cancelled = true; };
}, [url]);
```

Or with AbortController:
```ts
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(...);
  return () => controller.abort();
}, [url]);
```

---

## 4. When to use useMemo vs useCallback

| Hook | Returns | Use when |
|------|---------|----------|
| `useMemo` | A **value** (computed) | Expensive calculation; object/array identity for deps |
| `useCallback` | A **function** | Function passed as prop to memoized child |

```ts
// useMemo: sorted list is expensive to recompute
const sorted = useMemo(() => [...items].sort(compareFn), [items]);

// useCallback: function passed to React.memo'd child
const handleClick = useCallback((id: string) => { ... }, [dep]);
```

**Don't premature-optimize**: Only add these when you have a measured performance problem or when prop identity is required (e.g., useEffect dep, memoized child).

---

## 5. Optimistic update pattern

```ts
// 1. Snapshot for rollback
const previous = state;

// 2. Apply optimistic update immediately
setState(optimisticValue);

try {
  await apiCall();
  // Success — state is already correct
} catch {
  // 3. Rollback
  setState(previous);
  showErrorToast();
}
```

---

## 6. State shape pitfalls

**Avoid derived state in useState**:
```ts
// BAD — isLoaded is derived from data
const [data, setData] = useState(null);
const [isLoaded, setIsLoaded] = useState(false);

// GOOD — derive it
const isLoaded = data !== null;
```

**Avoid impossible states**:
```ts
// BAD — can have isLoading=true AND error="..." simultaneously
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

// BETTER — use a status union
type Status = 'idle' | 'loading' | 'success' | 'error';
const [status, setStatus] = useState<Status>('idle');
```

---

## 7. useRef — when state isn't right

Use `useRef` when you need a value that:
- **Persists across renders** but
- **Doesn't trigger a re-render** when it changes

Common uses:
```ts
const intervalRef = useRef<NodeJS.Timeout | null>(null); // store interval id
const prevValueRef = useRef(value); // track previous render's value
const isMountedRef = useRef(true); // track mount state
```

---

## 8. Component patterns

**Smart/dumb split**: Logic in hook, rendering in component.
```ts
function MyComponent() {
  const { data, loading, error, doAction } = useMyFeature(); // smart
  return <MyView ... />; // dumb — just maps state to JSX
}
```

**Compound components**: When building UI kits (e.g., `<Select>`, `<Select.Option>`).

**Render props / children as function**: Older pattern, mostly replaced by hooks.

---

## 9. Performance red flags to mention proactively

- "I'd add `React.memo` to `ActivityItem` since we're rendering a list"
- "I'd check if we're re-rendering the whole list when one item changes — keys should be stable IDs, not indexes"
- "For a very long list, I'd consider virtualization (react-window)"
- "The polling fetch on a hidden tab is wasteful — `visibilitychange` event fixes this"

---

## 10. Testing strategy (mention at the end)

```
Unit tests (Jest + Testing Library):
  - useActivityFeed hook: renderHook, mock the API module
  - ActivityItem: renders unread dot, calls onMarkRead on click

Integration tests:
  - Full ActivityFeed with msw (Mock Service Worker) intercepting API calls
  - Test filter switching clears old list
  - Test load more appends

What NOT to test:
  - Implementation details (internal state, refs)
  - Styles
```
