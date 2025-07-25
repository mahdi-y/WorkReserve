import { renderHook, act } from '@testing-library/react';
import { useGoogleAuth } from '../useGoogleAuth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../use-toast';

// Mock dependencies
jest.mock('../../context/AuthContext');
jest.mock('../use-toast');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('useGoogleAuth', () => {
  const mockLoginWithGoogle = jest.fn();
  const mockToast = jest.fn();

  // Mock window.google
  const mockGoogle = {
    accounts: {
      id: {
        initialize: jest.fn(),
        renderButton: jest.fn(),
        prompt: jest.fn(),
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      loginWithGoogle: mockLoginWithGoogle,
      user: null,
      login: jest.fn(),
      loginDirect: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });

    mockUseToast.mockReturnValue({
      toast: mockToast,
    });

    // Set up environment variable mock
    Object.defineProperty(import.meta, 'env', {
      value: {
        VITE_GOOGLE_CLIENT_ID: 'test-client-id',
      },
      writable: true,
    });

    (global as any).window.google = mockGoogle;
  });

  afterEach(() => {
    delete (global as any).window.google;
  });

  describe('initializeGoogleAuth', () => {
    it('should initialize Google Auth when client ID is available', () => {
      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.initializeGoogleAuth();
      });

      expect(mockGoogle.accounts.id.initialize).toHaveBeenCalledWith({
        client_id: 'test-client-id',
        callback: expect.any(Function),
      });
    });

    it('should not initialize when client ID is missing', () => {
      Object.defineProperty(import.meta, 'env', {
        value: {},
        writable: true,
      });

      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.initializeGoogleAuth();
      });

      expect(mockGoogle.accounts.id.initialize).not.toHaveBeenCalled();
    });

    it('should not initialize when Google object is not available', () => {
      delete (global as any).window.google;

      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.initializeGoogleAuth();
      });

      expect(mockGoogle.accounts.id.initialize).not.toHaveBeenCalled();
    });
  });

  describe('signInWithGoogle', () => {
    it('should call Google sign-in when available', () => {
      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.signInWithGoogle();
      });

      expect(mockGoogle.accounts.id.prompt).toHaveBeenCalled();
    });

    it('should show error when Google is not available', () => {
      delete (global as any).window.google;

      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.signInWithGoogle();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Google Sign-In is not available',
        variant: 'destructive',
      });
    });
  });

  describe('Google callback handling', () => {
    it('should handle successful Google response', async () => {
      mockLoginWithGoogle.mockResolvedValue(undefined);

      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.initializeGoogleAuth();
      });

      const initializeCall = mockGoogle.accounts.id.initialize.mock.calls[0][0];
      const callback = initializeCall.callback;

      await act(async () => {
        await callback({ credential: 'test-credential' });
      });

      expect(mockLoginWithGoogle).toHaveBeenCalledWith('test-credential');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Successfully signed in with Google',
      });
    });

    it('should handle Google login errors', async () => {
      const error = new Error('Google login failed');
      mockLoginWithGoogle.mockRejectedValue(error);

      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.initializeGoogleAuth();
      });

      const initializeCall = mockGoogle.accounts.id.initialize.mock.calls[0][0];
      const callback = initializeCall.callback;

      await act(async () => {
        await callback({ credential: 'test-credential' });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to sign in with Google',
        variant: 'destructive',
      });
    });

    it('should handle missing credential in Google response', async () => {
      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.initializeGoogleAuth();
      });

      const initializeCall = mockGoogle.accounts.id.initialize.mock.calls[0][0];
      const callback = initializeCall.callback;

      await act(async () => {
        await callback({});
      });

      expect(mockLoginWithGoogle).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to sign in with Google',
        variant: 'destructive',
      });
    });
  });

  describe('renderGoogleButton', () => {
    it('should render Google button when element and Google are available', () => {
      const mockElement = document.createElement('div');
      mockElement.id = 'google-signin-button';
      document.body.appendChild(mockElement);

      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.renderGoogleButton('google-signin-button');
      });

      expect(mockGoogle.accounts.id.renderButton).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          theme: 'outline',
          size: 'large',
          type: 'standard',
        })
      );

      document.body.removeChild(mockElement);
    });

    it('should not render when element is not found', () => {
      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.renderGoogleButton('non-existent-element');
      });

      expect(mockGoogle.accounts.id.renderButton).not.toHaveBeenCalled();
    });

    it('should not render when Google is not available', () => {
      delete (global as any).window.google;

      const mockElement = document.createElement('div');
      mockElement.id = 'google-signin-button';
      document.body.appendChild(mockElement);

      const { result } = renderHook(() => useGoogleAuth());

      act(() => {
        result.current.renderGoogleButton('google-signin-button');
      });

      expect(mockGoogle.accounts.id.renderButton).not.toHaveBeenCalled();

      document.body.removeChild(mockElement);
    });
  });
});