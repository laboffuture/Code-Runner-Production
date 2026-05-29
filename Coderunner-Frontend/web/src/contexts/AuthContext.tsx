'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api-client';
import { syncProgressFromServer } from '@/lib/utilities/progress';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'developer';
  age_group: '11-14' | '15-18';
  selectedCharacter: 'astra' | 'nila' | 'kenji' | 'leo';
  onboardingComplete: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDeveloper: boolean;
  isTeacher: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  age_group: '11-14' | '15-18';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage and validate token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUserData = localStorage.getItem('userData');

        if (storedToken && storedUserData) {
          // Immediately restore from cache so pages render without flicker
          try {
            const cachedUser = JSON.parse(storedUserData) as User;
            setToken(storedToken);
            setUser(cachedUser);
          } catch {
            // Cached data corrupt — fall through, will clear below if validation also fails
          }

          // Background validation — refresh user data from backend
          try {
            const userData = await api.auth.me() as User;
            setUser(userData);
            localStorage.setItem('userData', JSON.stringify(userData));
            syncProgressFromServer();
          } catch (error: any) {
            // Only logout on real auth failures (token expired/invalid)
            // Network errors or server errors keep the cached session alive
            if (error?.status === 401 || error?.status === 403) {
              console.error('Token invalid, logging out:', error);
              clearAuth();
            } else {
              console.warn('Session refresh failed (network/server error), keeping cached session:', error?.message);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('selectedAgent');
    localStorage.removeItem('userData');
    // Clear session boot flag to force boot sequence on next login
    sessionStorage.removeItem('sessionBooted');
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await api.auth.login(username, password) as any;

      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
        age_group: response.user.age_group,
        selectedCharacter: response.user.selectedCharacter || 'astra',
        onboardingComplete: response.user.onboardingComplete || false,
        createdAt: response.user.createdAt || new Date().toISOString(),
      };

      setToken(response.token);
      setUser(userData);

      // Persist to localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.user.id);
      localStorage.setItem('username', response.user.username);
      localStorage.setItem('userRole', response.user.role);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));

      syncProgressFromServer();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.auth.register(data.username, data.email, data.password, data.age_group) as any;

      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
        age_group: response.user.age_group,
        selectedCharacter: response.user.selectedCharacter || 'astra',
        onboardingComplete: response.user.onboardingComplete || false,
        createdAt: response.user.createdAt || new Date().toISOString(),
      };

      setToken(response.token);
      setUser(userData);

      // Persist to localStorage
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userId', response.user.id);
      localStorage.setItem('username', response.user.username);
      localStorage.setItem('userRole', response.user.role);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
    // Use hard reload instead of client-side navigation to fully reset React state,
    // module cache, and any in-flight requests. This guarantees a clean slate on login.
    window.location.replace('/login');
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      const userData = await api.auth.me() as User;
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error: any) {
      // Only logout on real auth failures, not transient network issues
      if (error?.status === 401 || error?.status === 403) {
        console.error('Token invalid during refresh, logging out:', error);
        clearAuth();
      } else {
        console.warn('refreshUser failed (network/server error), keeping session:', error?.message);
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    isDeveloper: user?.role === 'developer',
    isTeacher: user?.role === 'teacher',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
