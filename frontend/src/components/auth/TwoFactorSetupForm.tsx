/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { twoFactorService, type TwoFactorSetupResponse } from '../../services/twoFactorService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface TwoFactorSetupFormProps {
  onBackupCodesConfirmed?: () => void;
}

const TwoFactorSetupForm: React.FC<TwoFactorSetupFormProps> = ({ onBackupCodesConfirmed }) => {
  const [setup, setSetup] = useState<TwoFactorSetupResponse | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupCodesShown, setBackupCodesShown] = useState(false);
  const [actualBackupCodes, setActualBackupCodes] = useState<string[]>([]);

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
      const response = await twoFactorService.enable(setup!.secret, code);
      setActualBackupCodes(response.backupCodes);
      setSuccess('Two-factor authentication enabled!');
      setShowBackupModal(true);
      setBackupCodesShown(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCodes = () => {
    const codesToDownload = actualBackupCodes.length > 0 ? actualBackupCodes : setup?.backupCodes || [];
    if (codesToDownload.length === 0) return;
    
    const content = `WorkReserve Backup Codes\n\n${codesToDownload.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nKeep these codes safe. Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workreserve-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!setup) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6 flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold text-center">Set up Two-Factor Authentication</h2>
      <div className="flex flex-col items-center space-y-2">
        <QRCodeCanvas value={setup.otpAuthUri} size={180} />
        <div className="text-sm text-gray-700 mt-2 text-center">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
        </div>
        <div className="mt-2 text-center">
          Or enter this secret manually: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{setup.secret}</span>
        </div>
      </div>
      {!backupCodesShown && (
        <form onSubmit={handleEnable} className="space-y-4 w-full flex flex-col items-center">
          <div className="w-full flex flex-col items-center">
            <label htmlFor="code" className="block text-sm font-medium text-center">Enter code from app</label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              required
              disabled={loading}
              className="text-center"
            />
          </div>
          <Button type="submit" disabled={loading || code.length !== 6}>
            {loading ? 'Enabling...' : 'Enable 2FA'}
          </Button>
        </form>
      )}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}

      <Dialog open={showBackupModal} onOpenChange={setShowBackupModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Codes (shown only once)</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <p className="mb-2 text-center text-sm text-gray-700">
              Please save these backup codes now. You will not be able to view them again.<br />
              Each code can only be used once.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-2 w-full max-w-xs mx-auto">
              {(actualBackupCodes.length > 0 ? actualBackupCodes : setup?.backupCodes || []).map(code => (
                <div key={code} className="font-mono text-sm text-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  {code}
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="mb-2"
              onClick={handleDownloadCodes}
            >
              Download Codes
            </Button>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Save these codes in a safe place. You can use them if you lose access to your authenticator app.
            </div>
            <Button
              className="mt-4"
              onClick={() => {
                setShowBackupModal(false);
                if (onBackupCodesConfirmed) onBackupCodesConfirmed();
              }}
            >
              I have saved my backup codes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TwoFactorSetupForm;