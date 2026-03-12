/**
 * SOLUTION: Custom hook — extracted from ActivityFeed
 *
 * Senior signal: pull data + async logic into a hook,
 * keep the component as pure UI.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchActivities, markActivityRead } from '../starter/mockApi';
import type { Activity, FilterType } from '../starter/types';

interface UseActivityFeedReturn {
  activities: Activity[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  activeFilter: FilterType;
  toast: string | null;
  setFilter: (filter: FilterType) => void;
  loadMore: () => void;
  handleMarkRead: (id: string) => void;
  dismissToast: () => void;
}

export function useActivityFeed(): UseActivityFeedReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  // ─── Level 1 + 2: Fetch on mount and filter change ───────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchActivities(1, activeFilter);
        if (!cancelled) {
          setActivities(data.activities);
          setHasMore(data.hasMore);
          setPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    // Cleanup: if filter changes before fetch completes, ignore stale result
    return () => {
      cancelled = true;
    };
  }, [activeFilter]);

  // ─── Level 3: Load more ───────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchActivities(nextPage, activeFilter);
      setActivities((prev) => [...prev, ...data.activities]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch {
      setToast('Failed to load more. Try again.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, activeFilter]);

  // ─── Level 4: Mark as read with optimistic update ─────────────────────────
  const handleMarkRead = useCallback(async (id: string) => {
    // Optimistically flip to read immediately
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
    );

    try {
      await markActivityRead(id);
    } catch {
      // Rollback on failure
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, read: false } : a)),
      );
      setToast('Could not mark as read. Please try again.');
    }
  }, []);

  // ─── Bonus: Auto-refresh every 30s, pause on hidden tab ──────────────────
  const activitiesRef = useRef(activities);
  activitiesRef.current = activities;

  useEffect(() => {
    const poll = async () => {
      if (document.visibilityState === 'hidden') return;

      try {
        const data = await fetchActivities(1, activeFilter);
        // Prepend truly new activities (not already in list)
        setActivities((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newOnes = data.activities.filter((a) => !existingIds.has(a.id));
          return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
        });
      } catch {
        // Silent fail on background poll — don't distract user
      }
    };

    const intervalId = setInterval(poll, 30_000);

    // Cleanup on unmount or filter change
    return () => clearInterval(intervalId);
  }, [activeFilter]);

  const setFilter = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
    // page + activities reset happens via the useEffect above
  }, []);

  return {
    activities,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    activeFilter,
    toast,
    setFilter,
    loadMore,
    handleMarkRead,
    dismissToast: () => setToast(null),
  };
}
