'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Phase 1 stub so the owner login redirect (page.tsx → /oversight/dashboard)
// resolves instead of 404-ing. Phase 7 replaces this body with the real
// Groups Overview (and adds an /oversight/layout.tsx shell that also gates).
export default function OversightDashboardPage() {
  return (
    <ProtectedRoute requireRole="owner">
      <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center font-orbitron">
        <p className="opacity-70">Oversight dashboard — coming online.</p>
      </div>
    </ProtectedRoute>
  );
}
