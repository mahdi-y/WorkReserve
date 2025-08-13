import { authService } from '../authService'; // Import the service object
import api from '../../lib/api'; // Import your custom api instance
import MockAdapter from 'axios-mock-adapter';

describe('AuthService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('login', () => {
    it('sends login request with credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const mockResponse = { 
        user: { id: 1, email: 'test@example.com' }, 
        token: 'mock-token' 
      };
      
      mock.onPost('/auth/login').reply(200, mockResponse);

      const result = await authService.login(credentials);

      expect(result).toEqual(mockResponse);
      expect(mock.history.post).toHaveLength(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(credentials);
    });

    it('handles login failure', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' };
      
      mock.onPost('/auth/login').reply(401, { error: 'Invalid credentials' });

      await expect(authService.login(credentials)).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('sends registration request', async () => {
      const userData = { 
        fullName: 'test name',
        email: 'test@example.com', 
        password: 'password'
      };
      const mockResponse = { 
        user: { id: 1, ...userData }, 
        token: 'mock-token' 
      };
      
      mock.onPost('/auth/register').reply(201, mockResponse);

      const result = await authService.register(userData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('googleLogin', () => {
    it('sends Google ID token for authentication', async () => {
      const idToken = 'google-id-token';
      const mockResponse = { 
        user: { id: 1, email: 'test@gmail.com' }, 
        token: 'mock-token' 
      };
      
      mock.onPost('/auth/google').reply(200, mockResponse);

      const result = await authService.loginWithGoogle(idToken);

      expect(result).toEqual(mockResponse);
      expect(JSON.parse(mock.history.post[0].data)).toEqual({ idToken });
    });
  });

  describe('logout', () => {
    it('clears local storage and auth headers', () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      api.defaults.headers.common['Authorization'] = 'Bearer mock-token';

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(api.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });
});