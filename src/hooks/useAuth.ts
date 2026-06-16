import { useState, useCallback } from 'react';
import { apiJson } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER';
  username?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (email: string, password: string): Promise<AuthUser | null> => {
    setLoading(true);
    setError('');
    try {
      const data = await apiJson<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      return data.user;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: Record<string, string>): Promise<AuthUser | null> => {
    setLoading(true);
    setError('');
    try {
      const data = await apiJson<{ user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setUser(data.user);
      return data.user;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return { user, loading, error, login, register, logout, isLoggedIn: !!user };
}
