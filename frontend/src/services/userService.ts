import api from '../lib/api';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};