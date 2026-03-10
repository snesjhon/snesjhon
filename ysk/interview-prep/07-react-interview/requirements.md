# Interview Requirements: Activity Feed Component

> Read this as if you just received it. You have ~5 minutes to read and ask questions before coding.

---

## Context

You're building a feature for an internal dashboard. Users can see a live feed of activity events (comments, approvals, uploads, etc.) for a project they're working on. The backend is already built — you have a mock API available.

---

## API Contract

```ts
// GET /api/activities?page=1&type=all
// Returns:
{
  activities: Activity[]
  hasMore: boolean
  total: number
}

// POST /api/activities/:id/read
// Marks an activity as read
```

The `Activity` type is defined in `types.ts`.

---

## Requirements (read all before coding)

### Level 1 — Render the Feed (15 min)

- Fetch activities from the mock API on mount
- Show a loading state while fetching
- Show an error state if the fetch fails
- Render a list of `ActivityItem` components
- Each item displays: actor name, action text, timestamp (relative: "2 hours ago"), and an unread indicator dot if `activity.read === false`

### Level 2 — Filtering (15 min)

- Add a filter bar above the feed with buttons: `All | Comments | Approvals | Uploads`
- Filtering by type re-fetches (or filters client-side — your call, explain your choice)
- Active filter is visually indicated
- Switching filters resets the list (don't append old results)

### Level 3 — Load More / Pagination (10 min)

- Add a "Load more" button at the bottom
- Clicking it appends the next page of results to the existing list
- Button disappears when `hasMore === false`
- Show a loading spinner on the button while loading more (not a full-page spinner)

### Level 4 — Mark as Read (10 min)

- Clicking an unread activity marks it as read via `POST /api/activities/:id/read`
- The unread dot disappears immediately (optimistic update)
- If the API call fails, revert the dot (rollback)
- Show a subtle error toast/message on failure

### Bonus — Auto-Refresh

- Poll the API every 30 seconds for new activities
- New activities are prepended to the top (not appended)
- Stop polling when the component unmounts (cleanup)
- Pause polling while the user is on a different browser tab (`document.visibilityState`)

---

## Notes

- Don't install new packages. Use React hooks only.
- Accessibility: feed items should be keyboard navigable, unread indicator needs `aria-label`
- Don't over-engineer — a working solution is better than a perfect one that's half-done

---

## What the Interviewer Is Watching For

| Signal | Green Flag | Red Flag |
|--------|-----------|----------|
| State design | Flat, minimal state | Redundant/derived state in useState |
| useEffect | Correct deps, cleanup | Missing deps, no cleanup |
| Loading states | Per-action granular | Single global `isLoading` for everything |
| Optimistic update | Immediate UI, then reconcile | Wait for API before updating |
| Custom hooks | Extracted `useActivityFeed` | All logic inline in component |
| Performance | useCallback on handlers passed down | Recreating functions on every render |
