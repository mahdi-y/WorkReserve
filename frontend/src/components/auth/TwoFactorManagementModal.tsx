/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import { twoFactorService } from '../../services/twoFactorService';
import {
  Key,
  Download,
  Shield,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface TwoFactorManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisabled: () => void;
}

const TwoFactorManagementModal: React.FC<TwoFactorManagementModalProps> = ({
  open,
  onOpenChange,
  onDisabled
}) => {
  const { toast } = useToast();
  const [action, setAction] = useState<'view' | 'regenerate' | 'disable'>('view');
  const [loading, setLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleGetBackupCodes = async () => {
    try {
      setLoading(true);
      setError('');
      const codes = await twoFactorService.getBackupCodes();
      setBackupCodes(codes);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch backup codes');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const codes = await twoFactorService.regenerateBackupCodes(verificationCode);
      setBackupCodes(codes);
      setVerificationCode('');
      setAction('view');
      toast({
        title: "Success",
        description: "New backup codes generated successfully"
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to regenerate backup codes');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await twoFactorService.disable(verificationCode);
      onDisabled();
      toast({
        title: "Success",
        description: "Two-factor authentication has been disabled"
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    if (!backupCodes.length) return;

    const content = `WorkReserve - Two-Factor Authentication Backup Codes\n\nGenerated on: ${new Date().toLocaleString()}\n\nBackup Codes:\n${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\nImportant:\n- Store these codes in a safe place\n- Each code can only be used once\n- Use these codes if you lose access to your authenticator app\n- Codes remaining: ${backupCodes.length}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workreserve-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Backup codes downloaded successfully"
    });
  };

  const resetModal = () => {
    setAction('view');
    setBackupCodes([]);
    setVerificationCode('');
    setError('');
  };

  React.useEffect(() => {
    if (!open) {
      resetModal();
    } else {
      handleGetBackupCodes();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {action === 'view' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Manage Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                Manage your 2FA settings and backup codes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Backup Codes ({backupCodes.length} remaining)
                </h4>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : backupCodes.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="font-mono text-sm text-center p-2 bg-white dark:bg-gray-700 rounded">
                          {code}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" onClick={downloadBackupCodes} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Backup Codes
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No backup codes available</p>
                    <p className="text-xs text-gray-400 mt-1">Generate new codes using the button below</p>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setAction('regenerate')}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate Backup Codes
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setAction('disable')}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Disable 2FA
                </Button>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </>
        )}

        {action === 'regenerate' && (
          <>
            <DialogHeader>
              <DialogTitle>Regenerate Backup Codes</DialogTitle>
              <DialogDescription>
                Enter your current 2FA code to generate new backup codes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will invalidate all your current backup codes and generate new ones.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="regenerateCode">Verification Code</Label>
                <Input
                  id="regenerateCode"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  placeholder="000000"
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setAction('view')}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRegenerateBackupCodes} 
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {action === 'disable' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-red-600 dark:text-red-400">Disable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Enter your current 2FA code to disable two-factor authentication
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will remove the extra security layer from your account. You can re-enable it anytime.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="disableCode">Verification Code</Label>
                <Input
                  id="disableCode"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  placeholder="000000"
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setAction('view')}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDisable2FA} 
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Disabling...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Disable 2FA
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorManagementModal;