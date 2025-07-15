/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { twoFactorService, type TwoFactorSetupResponse } from '../../services/twoFactorService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';

interface TwoFactorSetupFormProps {
  onEnabled?: () => void;
}

const TwoFactorSetupForm: React.FC<TwoFactorSetupFormProps> = ({ onEnabled }) => {
  const [setup, setSetup] = useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSetup = async () => {
      try {
        const data = await twoFactorService.setup();
        setSetup(data);
      } catch (err: any) {
        setError('Failed to start 2FA setup');
      }
    };
    fetchSetup();
  }, []);

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the code from your authenticator app');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await twoFactorService.enable(setup!.secret, code);
      setSuccess('Two-factor authentication enabled!');
      
      if (onEnabled) {
        onEnabled();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (!setup) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Set up Two-Factor Authentication</h2>
      <div className="flex flex-col items-center space-y-2">
        <QRCodeCanvas value={setup.otpAuthUri} size={180} />
        <div className="text-sm text-gray-700 mt-2">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
        </div>
        <div className="mt-2">
          Or enter this secret manually: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{setup.secret}</span>
        </div>
      </div>
      <form onSubmit={handleEnable} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium">Enter code from app</label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            maxLength={6}
            required
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading || code.length !== 6}>
          {loading ? 'Enabling...' : 'Enable 2FA'}
        </Button>
      </form>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}
      <div className="mt-4">
        <h3 className="font-semibold">Backup Codes</h3>
        <ul className="list-disc pl-5 text-sm">
          {setup.backupCodes.map(code => (
            <li key={code} className="font-mono">{code}</li>
          ))}
        </ul>
        <div className="text-xs text-gray-500 mt-2">
          Save these codes in a safe place. You can use them if you lose access to your authenticator app.
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetupForm;