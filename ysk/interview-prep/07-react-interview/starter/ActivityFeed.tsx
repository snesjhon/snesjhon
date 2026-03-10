/**
 * ACTIVITY FEED — INTERVIEW STARTER
 *
 * Instructions:
 *   1. Read requirements.md fully before touching this file
 *   2. Implement each Level in order
 *   3. Talk through your decisions as you go
 *
 * Available:
 *   - fetchActivities(page, type) -> Promise<ActivityResponse>
 *   - markActivityRead(id)        -> Promise<void>
 *   - Types from ./types
 */

import React, { useEffect, useState } from 'react';
import { fetchActivities, markActivityRead } from './mockApi';
import type { Activity, ActivityResponse, FilterType } from './types';

// ─── TODO: Implement this component ─────────────────────────────────────────

export function ActivityFeed() {
  // Level 1: Fetch on mount, show loading/error/list
  // Level 2: Filter bar — All | Comments | Approvals | Uploads
  // Level 3: Load more button with per-button loading state
  // Level 4: Mark as read with optimistic update + rollback on failure
  // Bonus:   Auto-refresh every 30s, pause on hidden tab, cleanup on unmount

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [filterType, setIsFilterType] = useState('all');
  const [data, setIsData] = useState<ActivityResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      fetchActivities()
        .then((response) => {
          setIsData(response);
          setIsLoading(false);
        })
        .catch(() => {
          setIsError(true);
          setIsLoading(false);
        });
    };
    fetchData();
  }, []);

  async function filterData(pagination?: number, type?: Activity['type']) {
    setIsError(false);

    fetchActivities(pagination, type)
      .then((response) => {
        let filter = 'all';
        if (
          type &&
          (type === 'comment' || type === 'approval' || type === 'upload')
        ) {
          filter = type;
        }
        setIsData(response);
        setIsFilterType(filter);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
      });
  }

  return (
    <div className="activity-feed">
      <div>
        <button
          onClick={() => filterData()}
          style={{ fontWeight: filterType === 'all' ? 'bold' : 'normal' }}
        >
          all
        </button>
        <button
          onClick={() => filterData(0, 'comment')}
          style={{ fontWeight: filterType === 'comment' ? 'bold' : 'normal' }}
        >
          Comment
        </button>
        <button
          onClick={() => filterData(0, 'approval')}
          style={{ fontWeight: filterType === 'approval' ? 'bold' : 'normal' }}
        >
          Approval
        </button>
        <button
          onClick={() => filterData(0, 'upload')}
          style={{ fontWeight: filterType === 'upload' ? 'bold' : 'normal' }}
        >
          Upload
        </button>
      </div>

      <h2>Activity Feed</h2>
      {isLoading && <div>loading</div>}
      {isError && <div>error</div>}
      {data &&
        data.total > 0 &&
        data.activities.map((activity, key) => (
          <ActivityItem
            key={activity.actorName + key}
            activity={activity}
            onMarkRead={() => {}}
          />
        ))}
    </div>
  );
}

// ─── Helper: format relative time ────────────────────────────────────────────
// Feel free to use or replace this
export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Sub-component stubs — implement or inline, your choice ──────────────────

interface ActivityItemProps {
  activity: Activity;
  onMarkRead: (id: string) => void;
}

function ActivityItem({ activity, onMarkRead }: ActivityItemProps) {
  // TODO: render actor, action, timestamp, unread dot
  return (
    <>
      <div>{activity.actorName}</div>
      <div>{activity.actionText}</div>
      <div>{formatRelativeTime(activity.timestamp)}</div>
      {!activity.read && <div>unread</div>}
    </>
  );
}

// ─── Minimal styles (inline, no CSS file needed) ─────────────────────────────
// Add styles however you prefer — inline, CSS-in-JS, or a <style> tag
