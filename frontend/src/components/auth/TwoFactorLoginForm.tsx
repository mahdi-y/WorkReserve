/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { twoFactorService } from '../../services/twoFactorService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

interface TwoFactorLoginFormProps {
  email: string;
  password: string;
  onBack: () => void;
}

const TwoFactorLoginForm: React.FC<TwoFactorLoginFormProps> = ({
  email,
  password,
  onBack
}) => {
  const { loginDirect } = useAuth(); 
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter your 2FA code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { user, token } = await twoFactorService.loginWith2FA({
        email,
        password,
        twoFactorCode: code
      });
      
      loginDirect(user, token); 
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Invalid 2FA code'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Two-Factor Authentication
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">
            Authentication Code
          </Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            maxLength={6}
            disabled={loading}
            autoComplete="one-time-code"
          />
        </div>

        <div className="space-y-3">
          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : (
              'Verify & Sign In'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </form>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Lost your device?</p>
        <button 
          type="button"
          className="text-blue-600 hover:text-blue-500 font-medium"
          onClick={() => {
            const backupCode = prompt('Enter backup code:');
            if (backupCode) {
              setCode(backupCode);
            }
          }}
        >
          Use backup code
        </button>
      </div>
    </div>
  );
};

export default TwoFactorLoginForm;