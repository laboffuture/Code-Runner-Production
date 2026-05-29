'use client';

import React, { createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode } from 'react';
import { CharacterId, CHARACTER_THEMES } from '@/lib/character-themes';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  character: CharacterId;
  setCharacter: (character: CharacterId) => void;
  theme: typeof CHARACTER_THEMES[CharacterId];
  accentColor: string;
  accentLight: string;
  accentDark: string;
  accentGlow: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Initialize character from user's selected character or default to 'astra'
  const [character, setCharacterState] = useState<CharacterId>(() => {
    if (typeof window === 'undefined') return 'astra';

    // Try to get from localStorage first (for immediate render)
    const stored = localStorage.getItem('selectedCharacter') as CharacterId;
    if (stored && CHARACTER_THEMES[stored]) {
      return stored;
    }

    return 'astra';
  });

  // Sync character from backend ONLY when the user account changes (login/logout/switch)
  // This prevents the backend from overriding an explicit user selection stored in localStorage
  useEffect(() => {
    if (user?.id && user?.selectedCharacter && CHARACTER_THEMES[user.selectedCharacter as CharacterId]) {
      const storedUserId = localStorage.getItem('characterUserId');
      const storedCharacter = localStorage.getItem('selectedCharacter');

      if (storedUserId !== String(user.id)) {
        // Different user or first login — only sync from backend if no local character is set
        if (!storedCharacter || !CHARACTER_THEMES[storedCharacter as CharacterId]) {
          setCharacterState(user.selectedCharacter as CharacterId);
          localStorage.setItem('selectedCharacter', user.selectedCharacter);
        }
        // Always stamp this user's id so future refreshes skip this block
        localStorage.setItem('characterUserId', String(user.id));
      }
      // Same user (storedUserId === user.id) → respect local selection, do nothing
    }
  }, [user?.id, user?.selectedCharacter]);

  // Update CSS variables synchronously before browser paint to prevent flash
  useLayoutEffect(() => {
    const theme = CHARACTER_THEMES[character];
    const root = document.documentElement;

    root.style.setProperty('--accent', theme.colors.primary);
    root.style.setProperty('--accent-light', theme.colors.light);
    root.style.setProperty('--accent-dark', theme.colors.dark);
    root.style.setProperty('--accent-glow', theme.colors.glow);
    // Alpha variants used by Header (hex alpha suffix pattern)
    root.style.setProperty('--accent-5',      `${theme.colors.primary}0d`);
    root.style.setProperty('--accent-10',     `${theme.colors.primary}1a`);
    root.style.setProperty('--accent-20',     `${theme.colors.primary}33`);
    root.style.setProperty('--accent-40',     `${theme.colors.primary}66`);
    root.style.setProperty('--accent-dark-20',`${theme.colors.dark}33`);
    root.style.setProperty('--accent-dark-90',`${theme.colors.dark}e6`);

    // Update body class for theme-specific styles
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim() + ' ' + theme.class;
  }, [character]);

  const setCharacter = (newCharacter: CharacterId) => {
    setCharacterState(newCharacter);
    localStorage.setItem('selectedCharacter', newCharacter);
    // Keep characterUserId in sync so the backend-sync guard stays valid for this user
    if (user?.id) {
      localStorage.setItem('characterUserId', String(user.id));
    }
  };

  const theme = CHARACTER_THEMES[character];

  const value: ThemeContextType = {
    character,
    setCharacter,
    theme,
    accentColor: theme.colors.primary,
    accentLight: theme.colors.light,
    accentDark: theme.colors.dark,
    accentGlow: theme.colors.glow,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
