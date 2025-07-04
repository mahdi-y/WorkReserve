import api from '../lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
}

export interface AuthResponse {
  message: string;
}

export interface AuthResponseToken {
  token: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponseToken> => {
    const response = await api.post('/auth/login', credentials);
    const { token, refreshToken, user } = response.data;
    
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    try {
      const user = localStorage.getItem('user');
      if (!user) return null;
      
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    try {
      const token = localStorage.getItem('accessToken');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  isAdmin: (): boolean => {
    try {
      const user = authService.getCurrentUser();
      return user?.role === 'ADMIN';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.get(`/auth/verify?token=${token}`);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};