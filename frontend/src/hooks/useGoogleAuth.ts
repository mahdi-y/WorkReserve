/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './use-toast';
import { getEnv } from '../lib/env';

declare global {
  interface Window {
    google: any;
  }
}

export const useGoogleAuth = () => {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();

  const initializeGoogleAuth = useCallback(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      const clientId = getEnv('VITE_GOOGLE_CLIENT_ID');
      console.log('Initializing Google Auth...');
      console.log('Google object available:', !!window.google);
      console.log('Client ID from env:', clientId);
      console.log('All env vars:', getEnv('VITE_API_URL'));

      if (!clientId) {
        console.error('VITE_GOOGLE_CLIENT_ID is not defined!');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      console.log('Google Auth initialized successfully with client ID:', clientId);
    } else {
      console.log('Google object not available');
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    console.log('Google response received:', response);
    try {
      await loginWithGoogle(response.credential);

      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      });
    } catch (error: any) {
      console.error('Google auth error:', error);

      let errorMessage = 'Failed to sign in with Google';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const signInWithGoogle = useCallback(() => {
    console.log('Sign in with Google clicked');
    console.log('Google object available:', !!window.google);

    if (window.google && window.google.accounts) {
      console.log('Prompting Google sign in...');
      window.google.accounts.id.prompt();
    } else {
      console.log('Google accounts not available');
      toast({
        title: "Error",
        description: "Google Sign-In is not available. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const renderGoogleButton = useCallback((elementId: string) => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      const element = document.getElementById(elementId);
      if (element) {
        window.google.accounts.id.renderButton(element, {
          theme: 'outline',
          size: 'large',
          width: '100%',
        });
      }
    }
  }, []);

  return {
    initializeGoogleAuth,
    signInWithGoogle,
    renderGoogleButton,
  };
};