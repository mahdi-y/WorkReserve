import api from '../lib/api';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRooms: number;
  totalReservations: number;
  monthlyGrowth: number;
  revenue: number;
}

export interface SystemActivity {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  entityName: string;
  createdAt: string;
  timeAgo: string;
}

export const adminService = {
  async getAdminStats(): Promise<AdminStats> {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getRecentSystemActivity(): Promise<SystemActivity[]> {
    const response = await api.get('/admin/recent-activity');
    return response.data;
  }
};