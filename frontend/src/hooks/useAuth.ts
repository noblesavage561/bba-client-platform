import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/login', {
        email,
        password,
      });
      setState({ user: response.user, isLoading: false, error: null });
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, isLoading: false, error: null });
  }, []);

  return { ...state, login, logout };
}
