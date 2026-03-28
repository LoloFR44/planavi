'use client';

import { useState, useCallback } from 'react';

export function useAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback((planningId: string): boolean => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(`admin_${planningId}`) === 'true';
  }, []);

  const login = useCallback((planningId: string, password: string, expected: string): boolean => {
    if (password === expected) {
      sessionStorage.setItem(`admin_${planningId}`, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback((planningId: string) => {
    sessionStorage.removeItem(`admin_${planningId}`);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, setIsAuthenticated, checkAuth, login, logout };
}
