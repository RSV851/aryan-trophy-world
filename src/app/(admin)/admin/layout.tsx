'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { isLoading, isAuthenticated, fetchSession } = useAuthStore();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // If on login page, render plain content without Sidebar & Header
  if (isLoginPage) {
    return <div className="min-h-screen w-full bg-[#090909] text-gray-100">{children}</div>;
  }

  // Show luxury loading state while verifying admin JWT claims
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#090909] flex flex-col items-center justify-center space-y-4 text-[#C5A55A]">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
          Verifying Executive Credentials...
        </p>
      </div>
    );
  }

  // If session failed (and middleware redirected or client pending redirect), fallback
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#090909] flex flex-col items-center justify-center text-rose-400 font-semibold text-sm">
        <p>Access Denied. Redirecting to Executive Portal Login...</p>
      </div>
    );
  }

  // Main Authenticated CMS Shell
  return (
    <div className="min-h-screen bg-[#090909] text-gray-100 flex flex-col lg:pl-64 transition-all duration-300">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-2.5 mobile-mid:p-3.5 mobile-lg:p-4 phablet:p-5 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 overflow-x-hidden bg-[#090909]">
          {children}
        </main>
      </div>
    </div>
  );
}
