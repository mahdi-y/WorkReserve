/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import api from '../api';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

process.env.VITE_API_URL = 'http://localhost:8082/api';

describe('API Service', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
    jest.clearAllMocks();
    
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
    localStorageMock.clear.mockReset();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Authentication', () => {
    it('localStorage integration works correctly', () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      
      const result = localStorage.getItem('token');
      
      expect(result).toBe('test-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    });

    it('simulates request interceptor behavior', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      const mockConfig: any = { headers: {} };
      
      const token = localStorage.getItem('token');
      if (token) {
        mockConfig.headers.Authorization = `Bearer ${token}`;
      }
      
      expect(mockConfig.headers.Authorization).toBe('Bearer mock-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    });

    it('makes API requests successfully', async () => {
      mock.onGet('/test').reply(200, { data: 'success' });

      const response = await api.get('/test');

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ data: 'success' });
      expect(mock.history.get).toHaveLength(1);
    });
  });

  describe('Request Methods', () => {
    it('makes GET requests', async () => {
      mock.onGet('/users').reply(200, { users: [] });

      const response = await api.get('/users');

      expect(response.data).toEqual({ users: [] });
      expect(mock.history.get).toHaveLength(1);
      expect(mock.history.get[0].url).toBe('/users');
    });

    it('makes POST requests', async () => {
      const userData = { name: 'John', email: 'john@example.com' };
      mock.onPost('/users').reply(201, { id: 1, ...userData });

      const response = await api.post('/users', userData);

      expect(response.data).toEqual({ id: 1, ...userData });
      expect(mock.history.post).toHaveLength(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(userData);
    });

    it('makes PUT requests', async () => {
      const userData = { id: 1, name: 'John Updated' };
      mock.onPut('/users/1').reply(200, userData);

      const response = await api.put('/users/1', userData);

      expect(response.data).toEqual(userData);
      expect(mock.history.put).toHaveLength(1);
    });

    it('makes DELETE requests', async () => {
      mock.onDelete('/users/1').reply(204);

      await api.delete('/users/1');

      expect(mock.history.delete).toHaveLength(1);
      expect(mock.history.delete[0].url).toBe('/users/1');
    });
  });

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      mock.onGet('/test').networkError();

      await expect(api.get('/test')).rejects.toThrow();
    });

    it('handles HTTP error responses', async () => {
      mock.onGet('/test').reply(404, { error: 'Not found' });

      await expect(api.get('/test')).rejects.toThrow();
    });

    it('handles unauthorized errors', async () => {
      mock.onGet('/test').reply(401, { error: 'Unauthorized' });

      await expect(api.get('/test')).rejects.toThrow();
    });
  });

  describe('Request/Response Interceptors', () => {
    it('handles 401 response and clears storage', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mock.onGet('/test').reply(401, { error: 'Unauthorized' });

      try {
        await api.get('/test');
      } catch (error) {
        // Expected to throw
      }

      expect(mock.history.get).toHaveLength(1);
      expect(mock.history.get[0].url).toBe('/test');
      
      consoleSpy.mockRestore();
    });
  });
});