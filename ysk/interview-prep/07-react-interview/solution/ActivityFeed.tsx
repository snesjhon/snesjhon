/**
 * SOLUTION: ActivityFeed component
 *
 * Component is intentionally thin — all logic lives in useActivityFeed.
 * This is the "dumb component / smart hook" pattern.
 */

import React, { useCallback } from 'react';
import { useActivityFeed } from './useActivityFeed';
import { formatRelativeTime } from '../starter/ActivityFeed';
import type { Activity, FilterType } from '../starter/types';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Comments', value: 'comment' },
  { label: 'Approvals', value: 'approval' },
  { label: 'Uploads', value: 'upload' },
];

export function ActivityFeed() {
  const {
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
    dismissToast,
  } = useActivityFeed();

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Activity Feed</h2>

      {/* Level 2: Filter bar */}
      <div style={styles.filterBar} role="group" aria-label="Filter activities">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            style={{
              ...styles.filterBtn,
              ...(activeFilter === value ? styles.filterBtnActive : {}),
            }}
            aria-pressed={activeFilter === value}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Level 1: Loading / Error / List */}
      {isLoading ? (
        <div style={styles.center} aria-live="polite" aria-busy="true">
          Loading activities...
        </div>
      ) : error ? (
        <div style={styles.error} role="alert">
          {error}
          <button onClick={() => setFilter(activeFilter)} style={styles.retryBtn}>
            Retry
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div style={styles.center}>No activities found.</div>
      ) : (
        <ul style={styles.list} role="feed" aria-label="Activity feed">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onMarkRead={handleMarkRead}
            />
          ))}
        </ul>
      )}

      {/* Level 3: Load more */}
      {!isLoading && hasMore && (
        <div style={styles.center}>
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            style={styles.loadMoreBtn}
          >
            {isLoadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      {/* Level 4: Toast for mark-as-read failure */}
      {toast && (
        <div style={styles.toast} role="alert">
          {toast}
          <button onClick={dismissToast} style={styles.toastClose} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ActivityItem ─────────────────────────────────────────────────────────────

interface ActivityItemProps {
  activity: Activity;
  onMarkRead: (id: string) => void;
}

function ActivityItem({ activity, onMarkRead }: ActivityItemProps) {
  const handleClick = useCallback(() => {
    if (!activity.read) onMarkRead(activity.id);
  }, [activity.id, activity.read, onMarkRead]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') handleClick();
    },
    [handleClick]
  );

  return (
    <li
      style={{ ...styles.item, ...(activity.read ? {} : styles.itemUnread) }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${activity.actorName} ${activity.actionText}${activity.read ? '' : ', unread'}`}
    >
      {!activity.read && (
        <span
          style={styles.unreadDot}
          aria-label="Unread"
          role="img"
        />
      )}
      <div style={styles.itemContent}>
        <span style={styles.actorName}>{activity.actorName}</span>
        {' '}
        <span style={styles.actionText}>{activity.actionText}</span>
        <div style={styles.timestamp}>{formatRelativeTime(activity.timestamp)}</div>
      </div>
    </li>
  );
}

// ─── Minimal inline styles ────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '0 auto', fontFamily: 'sans-serif' },
  heading: { marginBottom: 16 },
  filterBar: { display: 'flex', gap: 8, marginBottom: 16 },
  filterBtn: { padding: '6px 14px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' },
  filterBtnActive: { background: '#1a73e8', color: '#fff', borderColor: '#1a73e8' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 0', borderBottom: '1px solid #eee', cursor: 'pointer', outline: 'none', borderRadius: 4 },
  itemUnread: { background: '#f0f7ff' },
  unreadDot: { width: 8, height: 8, borderRadius: '50%', background: '#1a73e8', flexShrink: 0, marginTop: 6 },
  itemContent: { flex: 1 },
  actorName: { fontWeight: 600 },
  actionText: { color: '#555' },
  timestamp: { fontSize: 12, color: '#999', marginTop: 2 },
  center: { textAlign: 'center', padding: 24, color: '#666' },
  error: { textAlign: 'center', padding: 16, color: '#c62828', background: '#ffebee', borderRadius: 4 },
  retryBtn: { marginLeft: 12, padding: '4px 10px', cursor: 'pointer' },
  loadMoreBtn: { padding: '8px 20px', cursor: 'pointer', borderRadius: 4, border: '1px solid #ccc' },
  toast: { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#323232', color: '#fff', padding: '10px 16px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 12 },
  toastClose: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16 },
};
