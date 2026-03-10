// ─── DO NOT MODIFY THIS FILE ───────────────────────────────────────────────
// This simulates your backend API. Treat it as a black box.

import type { Activity, ActivityResponse, FilterType } from './types';

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', type: 'comment', actorName: 'Alice Johnson', actionText: 'commented on Design Review', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false },
  { id: '2', type: 'approval', actorName: 'Bob Smith', actionText: 'approved the Q4 Budget', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: false },
  { id: '3', type: 'upload', actorName: 'Carol White', actionText: 'uploaded final-spec-v2.pdf', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true },
  { id: '4', type: 'comment', actorName: 'David Lee', actionText: 'commented on Sprint Planning', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: true },
  { id: '5', type: 'approval', actorName: 'Eve Martinez', actionText: 'approved the API schema changes', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), read: true },
  { id: '6', type: 'upload', actorName: 'Frank Chen', actionText: 'uploaded wireframes-v3.fig', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), read: true },
  { id: '7', type: 'comment', actorName: 'Grace Kim', actionText: 'commented on Homepage Redesign', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), read: false },
  { id: '8', type: 'approval', actorName: 'Henry Park', actionText: 'approved the new deployment pipeline', timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), read: true },
];

const PAGE_SIZE = 3;

// Simulates network latency
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function fetchActivities(
  page: number = 1,
  type: FilterType = 'all'
): Promise<ActivityResponse> {
  await delay(800);

  // Simulate random failure (~15% of the time) — handle this!
  if (Math.random() < 0.15) {
    throw new Error('Network error: failed to fetch activities');
  }

  const filtered =
    type === 'all' ? MOCK_ACTIVITIES : MOCK_ACTIVITIES.filter((a) => a.type === type);

  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const activities = filtered.slice(start, end);

  return {
    activities,
    hasMore: end < filtered.length,
    total: filtered.length,
  };
}

export async function markActivityRead(id: string): Promise<void> {
  await delay(300);

  // Simulate occasional failure on mark-as-read
  if (Math.random() < 0.2) {
    throw new Error(`Failed to mark activity ${id} as read`);
  }
}
