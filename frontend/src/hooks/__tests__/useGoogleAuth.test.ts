/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { useGoogleAuth } from '../useGoogleAuth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../use-toast';

jest.mock('../../context/AuthContext');
jest.mock('../use-toast');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const mockGoogle = {
  accounts: {
    id: {
      initialize: jest.fn(),
      renderButton: jest.fn(),
      prompt: jest.fn(),
    },
  },
};

jest.mock('../../lib/env', () => ({
  getEnv: jest.fn((key: string) => {
    if (key === 'VITE_GOOGLE_CLIENT_ID') return 'test-client-id';
    if (key === 'VITE_API_URL') return 'http://localhost:8082/api';
    return undefined;
  }),
}));

Object.defineProperty(globalThis, 'google', {
  value: mockGoogle,
  writable: true,
});

describe('useGoogleAuth', () => {
  const mockLoginWithGoogle = jest.fn();
  const mockToast = jest.fn();

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
      dismiss: jest.fn(),
      toasts: [],
    });

    (global as any).window.google = mockGoogle;
  });

  it('initializes Google Auth', () => {
    const { result } = renderHook(() => useGoogleAuth());
    
    act(() => {
      result.current.initializeGoogleAuth();
    });
    
    expect(mockGoogle.accounts.id.initialize).toHaveBeenCalledWith({
      client_id: 'test-client-id',
      callback: expect.any(Function),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  });

  it('renders Google button', () => {
    const { result } = renderHook(() => useGoogleAuth());
    
    document.body.innerHTML = '<div id="google-signin-button"></div>';
    
    act(() => {
      result.current.renderGoogleButton('google-signin-button');
    });
    
    expect(mockGoogle.accounts.id.renderButton).toHaveBeenCalledWith(
      document.getElementById('google-signin-button'),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
      }
    );
  });

  it('handles successful Google sign in', async () => {
    mockLoginWithGoogle.mockResolvedValue({ success: true });
    
    const { result } = renderHook(() => useGoogleAuth());
    
    const mockCredentialResponse = {
      credential: 'mock-jwt-token',
    };
    
    await act(async () => {
      result.current.initializeGoogleAuth();
      const initializeCall = mockGoogle.accounts.id.initialize.mock.calls[0];
      const callback = initializeCall[0].callback;
      await callback(mockCredentialResponse);
    });
    
    expect(mockLoginWithGoogle).toHaveBeenCalledWith('mock-jwt-token');
    expect(mockToast).toHaveBeenCalledWith({
      title: "Welcome!",
      description: "Successfully signed in with Google.",
    });
  });

  it('handles Google sign in failure', async () => {
    const error = new Error('Google login failed');
    mockLoginWithGoogle.mockRejectedValue(error);
    
    const { result } = renderHook(() => useGoogleAuth());
    
    const mockCredentialResponse = {
      credential: 'mock-jwt-token',
    };
    
    await act(async () => {
      result.current.initializeGoogleAuth();
      const initializeCall = mockGoogle.accounts.id.initialize.mock.calls[0];
      const callback = initializeCall[0].callback;
      await callback(mockCredentialResponse);
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Authentication Failed",
      description: "Failed to sign in with Google",
      variant: "destructive"
    });
  });

  it('triggers Google sign in', () => {
    const { result } = renderHook(() => useGoogleAuth());
    
    act(() => {
      result.current.signInWithGoogle();
    });
    
    expect(mockGoogle.accounts.id.prompt).toHaveBeenCalled();
  });

  it('handles missing Google script in signInWithGoogle', () => {
    (global as any).window.google = undefined;
    
    const { result } = renderHook(() => useGoogleAuth());
    
    act(() => {
      result.current.signInWithGoogle();
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Google Sign-In is not available. Please try refreshing the page.",
      variant: "destructive"
    });
  });

  it('handles missing Google script in initializeGoogleAuth', () => {
    (global as any).window.google = undefined;
    
    const { result } = renderHook(() => useGoogleAuth());
    
    act(() => {
      result.current.initializeGoogleAuth();
    });
    
    expect(mockToast).not.toHaveBeenCalled();
  });
});