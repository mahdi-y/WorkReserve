import api from '../lib/api';

export interface ProfileUpdateData {
  fullName?: string;
  email?: string;
}

export interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  banned: boolean;
  locked: boolean;
}

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateData): Promise<UserProfile> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  changePassword: async (data: PasswordChangeData): Promise<void> => {
    await api.put('/users/change-password', data);
  }
};