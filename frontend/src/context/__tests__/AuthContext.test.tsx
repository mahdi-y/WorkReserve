import React from 'react';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authService from '../../services/authService';

// Mock the authService
jest.mock('../../services/authService');
const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('AuthContext', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'USER',
    enabled: true,
    twoFactorEnabled: false,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initialization', () => {
    it('should initialize with null user and loading true', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAdmin).toBe(false);
    });

    it('should restore user from localStorage if token exists', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid-token';
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle invalid user data in localStorage', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid-token';
        if (key === 'user') return 'invalid-json';
        return null;
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const loginResponse = {
        user: mockUser,
        token: 'new-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
    });

    it('should handle login errors', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong-password' };
      const error = new Error('Invalid credentials');

      mockAuthService.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login(credentials);
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('loginDirect', () => {
    it('should set user and token directly', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.loginDirect(mockUser, 'direct-token');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'direct-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });
  });

  describe('loginWithGoogle', () => {
    it('should login with Google successfully', async () => {
      const idToken = 'google-id-token';
      const loginResponse = {
        user: mockUser,
        token: 'google-token',
        refreshToken: 'google-refresh-token',
      };

      mockAuthService.googleLogin.mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.loginWithGoogle(idToken);
      });

      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(idToken);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle Google login errors', async () => {
      const idToken = 'invalid-google-token';
      const error = new Error('Google authentication failed');

      mockAuthService.googleLogin.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.loginWithGoogle(idToken);
        })
      ).rejects.toThrow('Google authentication failed');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password',
        fullName: 'New User',
      };
      const registerResponse = {
        user: mockUser,
        token: 'register-token',
        refreshToken: 'register-refresh-token',
      };

      mockAuthService.register.mockResolvedValue(registerResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register(userData);
      });

      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should logout successfully', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // First login
      act(() => {
        result.current.loginDirect(mockUser, 'token');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin users', () => {
      const adminUser = { ...mockUser, role: 'ADMIN' };
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.loginDirect(adminUser, 'token');
      });

      expect(result.current.isAdmin).toBe(true);
    });

    it('should return false for non-admin users', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.loginDirect(mockUser, 'token');
      });

      expect(result.current.isAdmin).toBe(false);
    });
  });

  describe('useAuth hook outside provider', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });
  });
});