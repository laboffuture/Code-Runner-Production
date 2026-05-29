import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Code Runner',
  description: 'System monitoring and metrics dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
