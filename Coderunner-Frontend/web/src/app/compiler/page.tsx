'use client';

import { Header } from '@/components/layout/Header';
import { FreeCompiler } from '@/components/editor/FreeCompiler';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function CompilerPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden relative"
      style={mounted ? {
        backgroundImage: `url(${theme.wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      } : {}}
    >
      <Header />
      <main className="flex-grow min-h-0 relative z-10">
        <FreeCompiler />
      </main>
    </div>
  );
}
