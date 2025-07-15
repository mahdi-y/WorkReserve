import api from '../lib/api';

export interface TwoFactorSetupResponse {
  secret: string;
  otpAuthUri: string; 
  backupCodes: string[];
}

export interface TwoFactorLoginRequest {
  email: string;
  password: string;
  twoFactorCode: string;
}

export const twoFactorService = {
  checkRequired: async (email: string): Promise<{ twoFactorRequired: boolean }> => {
    const response = await api.post('/auth/check-2fa', null, {
      params: { email }
    });
    return response.data;
  },

  loginWith2FA: async (credentials: TwoFactorLoginRequest) => {
    const response = await api.post('/auth/login/2fa', credentials);
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { user, token };
  },

  setup: async (): Promise<TwoFactorSetupResponse> => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  enable: async (secret: string, code: string): Promise<void> => {
    await api.post('/auth/2fa/enable', { code }, {
      params: { secret }
    });
  },

  disable: async (code: string): Promise<void> => {
    await api.post('/auth/2fa/disable', { code });
  },

  verify: async (code: string): Promise<{ valid: boolean }> => {
    const response = await api.post('/auth/2fa/verify', { code });
    return response.data;
  },

  getBackupCodes: async (): Promise<string[]> => {
    const response = await api.get('/auth/2fa/backup-codes');
    return response.data;
  },

  regenerateBackupCodes: async (code: string): Promise<string[]> => {
    const response = await api.post('/auth/2fa/backup-codes/regenerate', { code });
    return response.data;
  }
};