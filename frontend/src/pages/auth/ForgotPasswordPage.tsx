/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WorkReserve</h1>
          <p className="text-gray-600">Reset Your Password</p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Check your email</h3>
                  <p className="text-gray-600 mt-2">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }} variant="outline">
                    Try another email
                  </Button>
                  <Button asChild>
                    <RouterLink to="/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </RouterLink>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || !email}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <div className="text-center">
                  <RouterLink 
                    to="/login" 
                    className="text-sm text-primary hover:underline inline-flex items-center"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1" />
                    Back to Login
                  </RouterLink>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;