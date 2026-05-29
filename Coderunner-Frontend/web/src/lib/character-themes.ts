/**
 * Character Theme Definitions
 * Each character has unique colors, wallpapers, and unlock requirements
 */

import { CLOUDINARY_BASE } from './cloudinary';

export type CharacterId = 'astra' | 'nila' | 'kenji' | 'leo';

export interface CharacterTheme {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  requiredLevel: number;
  colors: {
    primary: string;
    light: string;
    dark: string;
    glow: string;
  };
  wallpaper: string;
  avatar: string;
  class: string; // For theme class name
}

export const CHARACTER_THEMES: Record<CharacterId, CharacterTheme> = {
  astra: {
    id: 'astra',
    name: 'Astra',
    title: 'AI Agent',
    description: 'Master of algorithms and artificial intelligence. Astra navigates complex systems with precision and logic.',
    requiredLevel: 1,
    colors: {
      primary: '#06b6d4',     // cyan-500
      light: '#67e8f9',       // cyan-300
      dark: '#0e7490',        // cyan-700
      glow: 'rgba(6,182,212,0.3)',
    },
    wallpaper: '/astra-home-bg.png',
    avatar: '/assets/characters/Astro.png',
    class: 'theme-astra',
  },
  nila: {
    id: 'nila',
    name: 'Nila',
    title: 'Tech Wizard',
    description: 'A brilliant coder who bends technology to her will. Nila excels in web development and creative problem-solving.',
    requiredLevel: 5,
    colors: {
      primary: '#22c55e',     // green-500
      light: '#86efac',       // green-300
      dark: '#15803d',        // green-700
      glow: 'rgba(34,197,94,0.3)',
    },
    wallpaper: '/nila-home-bg.png',
    avatar: '/assets/characters/nila (2).png',
    class: 'theme-nila',
  },
  kenji: {
    id: 'kenji',
    name: 'Kenji',
    title: 'Junior Engineer',
    description: 'A determined engineer focused on building robust systems. Kenji specializes in data structures and optimization.',
    requiredLevel: 10,
    colors: {
      primary: '#f97316',     // orange-500
      light: '#fdba74',       // orange-300
      dark: '#c2410c',        // orange-700
      glow: 'rgba(249,115,22,0.3)',
    },
    wallpaper: '/kenji-home-bg.png',
    avatar: '/assets/characters/Kenji_2.png',
    class: 'theme-kenji',
  },
  leo: {
    id: 'leo',
    name: 'Leo',
    title: 'Mission Captain',
    description: 'A strategic leader who coordinates complex projects. Leo masters system design and architectural patterns.',
    requiredLevel: 15,
    colors: {
      primary: '#a855f7',     // purple-500
      light: '#d8b4fe',       // purple-300
      dark: '#7e22ce',        // purple-700
      glow: 'rgba(168,85,247,0.3)',
    },
    wallpaper: '/leo-home-bg.png',
    avatar: '/assets/characters/Leo.png',
    class: 'theme-leo',
  },
};

export const getCharacterTheme = (characterId: CharacterId): CharacterTheme => {
  return CHARACTER_THEMES[characterId];
};

export const getUnlockedCharacters = (level: number): CharacterId[] => {
  return Object.values(CHARACTER_THEMES)
    .filter(char => level >= char.requiredLevel)
    .map(char => char.id);
};

export const isCharacterUnlocked = (characterId: CharacterId, unlockedCharacters: string[]): boolean => {
  return unlockedCharacters.includes(characterId);
};
