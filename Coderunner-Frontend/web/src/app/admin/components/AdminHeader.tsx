'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Server, Cloud, Database, Cpu, Package, ListChecks, AlertTriangle, LayoutDashboard, LogOut, Bug } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const navItems = [
    { href: '/admin/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { href: '/admin/mongodb', label: 'MONGODB', icon: Database },
    { href: '/admin/cloudinary', label: 'CLOUDINARY', icon: Cloud },
    { href: '/admin/frontend', label: 'FRONTEND', icon: Server },
    { href: '/admin/nginx', label: 'NGINX', icon: Server },
    { href: '/admin/api', label: 'API', icon: Activity },
    { href: '/admin/redis', label: 'REDIS', icon: Database },
    { href: '/admin/runners', label: 'RUNNERS', icon: Cpu },
    { href: '/admin/docker', label: 'DOCKER', icon: Package },
    { href: '/admin/queues', label: 'QUEUES', icon: ListChecks },
    { href: '/admin/errors', label: 'ERRORS', icon: AlertTriangle },
    { href: '/admin/tickets', label: 'TICKETS', icon: Bug },
  ];

  return (
    <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40 rounded-t-2xl">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-orbitron font-black text-gray-900 tracking-wider">
              DEVELOPER DASHBOARD
            </h1>
            <p className="text-sm text-gray-600 mt-1 font-fira">Infrastructure Monitoring &amp; Metrics</p>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all
                    flex items-center gap-2 font-orbitron font-bold text-xs tracking-wider
                    ${isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => { logout(); router.push('/login'); }}
              title="Log out"
              className="px-4 py-2 rounded-lg border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 flex items-center gap-2 font-orbitron font-bold text-xs tracking-wider transition-all"
            >
              <LogOut className="w-4 h-4" />
              LOGOUT
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
