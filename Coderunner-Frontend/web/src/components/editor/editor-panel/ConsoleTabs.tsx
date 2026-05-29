'use client';

import { Keyboard, Terminal, FolderOpen } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ConsoleTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showFilesTab?: boolean;
}

export default function ConsoleTabs({ activeTab, setActiveTab, showFilesTab = false }: ConsoleTabsProps) {
  const { character, accentColor, accentLight } = useTheme();
  const hasCompilerTheme = ['astra', 'nila', 'kenji', 'leo'].includes(character);
  const accentRgba = (opacity: number) => {
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const tabs = [
    { id: 'customInput', label: 'Input', icon: Keyboard },
    { id: 'output', label: 'Output', icon: Terminal },
  ];

  if (showFilesTab) {
    tabs.push({ id: 'files', label: 'Files', icon: FolderOpen });
  }

  return (
    <div className="flex items-center gap-6">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`relative flex items-center gap-2 px-3 py-1.5 text-sm font-bold transition-all rounded-lg ${
            activeTab === id
              ? hasCompilerTheme
                ? 'shadow-lg'
                : 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 shadow-lg shadow-purple-500/20'
              : hasCompilerTheme
                ? 'text-slate-500 dark:text-slate-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
          }`}
          style={
            hasCompilerTheme
              ? activeTab === id
                ? { color: accentColor, backgroundColor: accentRgba(0.15), borderBottom: `2px solid ${accentColor}` }
                : { borderBottom: '2px solid transparent' }
              : undefined
          }
        >
          <Icon className="w-4 h-4" />
          <span className="font-orbitron">{label}</span>
        </button>
      ))}
    </div>
  );
}
