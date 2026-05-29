'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useGlobalAudio } from '@/contexts/AudioContext';
import { useTheme } from '@/contexts/ThemeContext';

export function SoundToggle() {
  const { isBackgroundMusicEnabled, toggleBackgroundMusic } = useGlobalAudio();
  const { accentColor } = useTheme();

  return (
    <button
      onClick={toggleBackgroundMusic}
      className="group relative flex items-center justify-center w-9 h-9 rounded transition-all duration-200"
      style={{
        border: `1px solid ${accentColor}33`,
        backgroundColor: `${accentColor}0a`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}80`;
        e.currentTarget.style.backgroundColor = `${accentColor}1a`;
        e.currentTarget.style.boxShadow = `0 0 14px ${accentColor}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}33`;
        e.currentTarget.style.backgroundColor = `${accentColor}0a`;
        e.currentTarget.style.boxShadow = 'none';
      }}
      aria-label={isBackgroundMusicEnabled ? 'Mute sound' : 'Unmute sound'}
      title={isBackgroundMusicEnabled ? 'Mute sound' : 'Unmute sound'}
    >
      {isBackgroundMusicEnabled ? (
        <Volume2
          className="w-4 h-4 transition-colors duration-200"
          style={{ color: accentColor }}
        />
      ) : (
        <VolumeX
          className="w-4 h-4 transition-colors duration-200"
          style={{ color: `${accentColor}50` }}
        />
      )}
    </button>
  );
}
