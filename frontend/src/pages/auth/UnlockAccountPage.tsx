/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../lib/api';

const UnlockAccountPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [processed, setProcessed] = useState(false); 
  
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (processed) return;

    const unlockAccount = async () => {
      if (!email || !token) {
        setStatus('error');
        setMessage('Invalid unlock link - missing email or token');
        setProcessed(true);
        return;
      }

      try {
        console.log('Attempting to unlock account for:', email);
        
        const response = await api.post(`/auth/unlock?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
        
        console.log('Unlock response:', response);
        
        setStatus('success');
        setMessage(response.data || 'Account unlocked successfully! You can now log in.');
        
      } catch (error: any) {
        console.error('Unlock error:', error);
        
        let errorMessage = 'Failed to unlock account';
        
        if (error.response) {
          if (error.response.status === 200) {
            setStatus('success');
            setMessage(error.response.data || 'Account unlocked successfully!');
            setProcessed(true);
            return;
          }
          
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data?.error) {
            errorMessage = error.response.data.error;
          }
          
          if (typeof errorMessage === 'string' && 
              (errorMessage.includes('Account is not locked') || 
               errorMessage.includes('already unlocked'))) {
            setStatus('success');
            setMessage('Account is already unlocked. You can log in normally.');
            setProcessed(true);
            return;
          }
        } else if (error.request) {
          errorMessage = 'Network error. Please check your connection.';
        }
        
        setStatus('error');
        setMessage(errorMessage);
      } finally {
        setProcessed(true); 
      }
    };

    unlockAccount();
  }, [email, token, processed]); 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WorkReserve</h1>
          <p className="text-gray-600">Account Unlock</p>
        </div>
        
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
              {status === 'loading' && (
                <div className="bg-blue-100 w-full h-full rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="bg-green-100 w-full h-full rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-100 w-full h-full rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle>
              {status === 'loading' && 'Unlocking Account...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Unlock Failed'}
            </CardTitle>
            <CardDescription className="whitespace-pre-wrap">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
            
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 text-xs text-gray-500">
                <p>Email: {email}</p>
                <p>Token: {token?.substring(0, 8)}...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnlockAccountPage;