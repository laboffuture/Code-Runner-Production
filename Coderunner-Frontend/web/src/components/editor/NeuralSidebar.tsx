'use client';

import { Home, Rocket, BarChart3, Database, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NeuralSidebarProps {
  isOpen: boolean;
}

export default function NeuralSidebar({ isOpen }: NeuralSidebarProps) {
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    // Only developer-role accounts see the monitoring dashboard link
    const userRole = localStorage.getItem('userRole');
    setIsDeveloper(userRole === 'developer');
  }, []);

  return (
    <aside
      className={`fixed left-0 top-[57px] bottom-0 z-50 w-[60px] py-6 flex flex-col items-center gap-6 glass-panel border-r border-slate-200 dark:border-cyan-500/20 transition-all duration-300 ${
        isOpen
          ? 'translate-x-0 opacity-100'
          : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      <Link
        href="/home"
        className="text-cyan-400 hover:scale-110 transition-transform"
        title="Home"
      >
        <Home className="w-5 h-5" />
      </Link>
      <Link
        href="/missions"
        className="text-slate-500 hover:text-cyan-400 transition-all hover:scale-110"
        title="Missions"
      >
        <Rocket className="w-5 h-5" />
      </Link>
      <Link
        href="/rank"
        className="text-slate-500 hover:text-cyan-400 transition-all hover:scale-110"
        title="Analytics"
      >
        <BarChart3 className="w-5 h-5" />
      </Link>
      <button
        className="text-slate-500 hover:text-cyan-400 transition-all hover:scale-110"
        title="Database"
      >
        <Database className="w-5 h-5" />
      </button>
      <Link
        href="/profile/settings"
        className="text-slate-500 hover:text-cyan-400 transition-all hover:scale-110"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </Link>

      {/* Developer Dashboard - only visible to developer-role accounts */}
      {isDeveloper && (
        <>
          {/* Divider */}
          <div className="w-8 h-[1px] bg-slate-300 dark:bg-slate-700" />
          <Link
            href="/admin/dashboard"
            className="text-amber-500 hover:text-amber-400 transition-all hover:scale-110"
            title="Developer Dashboard"
          >
            <Shield className="w-5 h-5" />
          </Link>
        </>
      )}
    </aside>
  );
}
