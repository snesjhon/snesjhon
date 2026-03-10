export type ActivityType = 'comment' | 'approval' | 'upload';

export interface Activity {
  id: string;
  type: ActivityType;
  actorName: string;
  actionText: string;
  timestamp: string; // ISO 8601
  read: boolean;
}

export interface ActivityResponse {
  activities: Activity[];
  hasMore: boolean;
  total: number;
}

export type FilterType = 'all' | ActivityType;
