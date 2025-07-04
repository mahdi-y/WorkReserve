import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2 } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rateLimit, setRateLimit] = useState(false);
  const [cooldown, setCooldown] = useState(60); 

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate(from, { replace: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('Too many requests - try again later.');
        setRateLimit(true);
        setCooldown(60);
        const end = Date.now() + 60 * 1000;
        localStorage.setItem('loginCooldownEnd', end.toString());
      } else {
        setError(err.response?.data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cooldownEnd = localStorage.getItem('loginCooldownEnd');
    if (cooldownEnd) {
      const remaining = Math.ceil((parseInt(cooldownEnd) - Date.now()) / 1000);
      if (remaining > 0) {
        setRateLimit(true);
        setCooldown(remaining);
        setError('Too many requests - try again later.');
      } else {
        localStorage.removeItem('loginCooldownEnd');
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (rateLimit && cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    if (cooldown === 0) {
      setRateLimit(false);
      setError('');
      localStorage.removeItem('loginCooldownEnd');
    }
    return () => clearTimeout(timer);
  }, [rateLimit, cooldown]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign in</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                {rateLimit && cooldown > 0 && (
                  <span> Please wait {cooldown} second{cooldown !== 1 ? 's' : ''}.</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <RouterLink
                to="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </RouterLink>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || rateLimit}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="text-center">
            <RouterLink 
              to="/register" 
              className="text-sm text-primary hover:underline"
            >
              Don't have an account? Sign up
            </RouterLink>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;