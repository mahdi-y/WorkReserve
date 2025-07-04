import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WorkReserve</h1>
          <p className="text-gray-600">Email Verification</p>
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
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {status === 'success' && (
              <Button asChild className="w-full">
                <Link to="/login">Continue to Login</Link>
              </Button>
            )}
            {status === 'error' && (
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/register">Back to Register</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/login">Try Login</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage;