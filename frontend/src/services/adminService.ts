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

export interface MonthlyStats {
  month: string;
  reservations: number;
  revenue: number;
}

export interface RoomUsageStats {
  name: string;
  value: number;
  color: string;
}

export interface UserGrowthStats {
  month: string;
  users: number;
}

export interface DailyActivityStats {
  hour: string;
  bookings: number;
}

export interface WeeklyRevenueStats {
  day: string;
  revenue: number;
}

export const adminService = {
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getRecentSystemActivity: async (): Promise<SystemActivity[]> => {
    const response = await api.get('/admin/activity');
    return response.data;
  },

  getMonthlyStats: async (): Promise<MonthlyStats[]> => {
    const response = await api.get('/admin/analytics/monthly-stats');
    return response.data;
  },

  getRoomUsageStats: async (): Promise<RoomUsageStats[]> => {
    const response = await api.get('/admin/analytics/room-usage');
    return response.data;
  },

  getUserGrowthStats: async (): Promise<UserGrowthStats[]> => {
    const response = await api.get('/admin/analytics/user-growth');
    return response.data;
  },

  getDailyActivityStats: async (): Promise<DailyActivityStats[]> => {
    const response = await api.get('/admin/analytics/daily-activity');
    return response.data;
  },

  getWeeklyRevenueStats: async (): Promise<WeeklyRevenueStats[]> => {
    const response = await api.get('/admin/analytics/weekly-revenue');
    return response.data;
  },
};