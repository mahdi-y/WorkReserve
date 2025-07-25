import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import api from '../api';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('API Service', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Request Interceptor', () => {
    it('should add authorization header when token exists', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      mock.onGet('/test').reply(200, { success: true });

      await api.get('/test');

      expect(mock.history.get[0].headers?.Authorization).toBe('Bearer test-token');
    });

    it('should not add authorization header when token does not exist', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      mock.onGet('/test').reply(200, { success: true });

      await api.get('/test');

      expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('should handle successful responses', async () => {
      mock.onGet('/test').reply(200, { success: true });

      const response = await api.get('/test');

      expect(response.data).toEqual({ success: true });
    });

    it('should handle 401 errors and attempt token refresh', async () => {
      localStorageMock.getItem.mockReturnValue('refresh-token');
      
      // First call fails with 401
      mock.onGet('/test').replyOnce(401);
      
      // Refresh token call succeeds
      mock.onPost('/auth/refresh-token').replyOnce(200, {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });
      
      // Retry original request succeeds
      mock.onGet('/test').replyOnce(200, { success: true });

      const response = await api.get('/test');

      expect(response.data).toEqual({ success: true });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
    });

    it('should logout user when refresh token fails', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-refresh-token');
      
      // First call fails with 401
      mock.onGet('/test').replyOnce(401);
      
      // Refresh token call fails
      mock.onPost('/auth/refresh-token').replyOnce(401);

      try {
        await api.get('/test');
      } catch (error) {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      }
    });

    it('should handle non-401 errors normally', async () => {
      mock.onGet('/test').reply(500, { error: 'Server error' });

      try {
        await api.get('/test');
      } catch (error: any) {
        expect(error.response.status).toBe(500);
        expect(error.response.data).toEqual({ error: 'Server error' });
      }
    });
  });

  describe('API Configuration', () => {
    it('should have correct base configuration', () => {
      expect(api.defaults.baseURL).toBe('http://localhost:8082/api');
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
      expect(api.defaults.withCredentials).toBe(true);
    });
  });
});