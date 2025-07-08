import api from '../lib/api';

export interface User_Service {
  id: number;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  banned: boolean; 
}

export const userService = {
  getAllUsers: async (): Promise<User_Service[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  updateUser: async (id: number, data: Partial<User_Service>): Promise<User_Service> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
  toggleUserStatus: async (id: number): Promise<User_Service> => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data;
  },
  updateUserRole: async (id: number, role: 'USER' | 'ADMIN'): Promise<User_Service> => {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },
  banUser: async (id: number): Promise<User_Service> => {
    const response = await api.put(`/users/${id}/ban`);
    return response.data;
  },
  unbanUser: async (id: number): Promise<User_Service> => {
    const response = await api.put(`/users/${id}/unban`);
    return response.data;
  },
};