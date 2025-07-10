import api from '../lib/api';

export interface Activity {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  entityName: string;
  createdAt: string;
  timeAgo: string;
}

export const activityService = {
  async getRecentActivity(): Promise<Activity[]> {
    const response = await api.get('/users/recent-activity');
    return response.data;
  }
};