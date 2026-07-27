'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Menu, LogOut, ExternalLink, User, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function AdminHeader() {
  const pathname = usePathname();
  const { profile, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const router = useRouter();

  const handleLogout = async () => {
    toast.loading('Logging out of executive session...', { id: 'logout-toast' });
    await logout();
    toast.dismiss('logout-toast');
    toast.success('Logged out successfully.');
    router.push('/admin/login');
  };

  // Convert route path to readable title
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Executive Dashboard';
    const segments = pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    return last.replace(/-/g, ' ').toUpperCase();
  };

  return (
    <header className="h-16 bg-[#111827]/95 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      {/* Left section: Hamburger & Route Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#C5A55A] hidden sm:inline" />
          <h1 className="text-sm sm:text-base font-bold text-white tracking-wide font-serif">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right section: Profile & Quick Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Live Website Preview Link */}
        <Link href="/" target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 bg-gray-800/50 text-gray-200 hover:text-[#C5A55A] hover:border-[#C5A55A]/50 text-xs hidden sm:flex items-center space-x-1.5 px-3"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Catalog</span>
          </Button>
        </Link>

        {/* Admin Profile Chip */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#090909] border border-[#C5A55A]/30 text-white shadow-xs">
          <div className="w-7 h-7 rounded-full bg-[#C5A55A]/20 text-[#C5A55A] flex items-center justify-center font-bold text-xs shrink-0 border border-[#C5A55A]">
            {profile?.name ? profile.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <div className="hidden md:flex flex-col text-left mr-1">
            <span className="text-xs font-bold leading-none truncate max-w-[120px]">
              {profile?.name || 'Business Owner'}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#C5A55A] font-semibold mt-0.5 flex items-center space-x-1">
              <Shield className="w-2.5 h-2.5 inline mr-0.5" />
              <span>Executive</span>
            </span>
          </div>
        </div>

        {/* Logout Trigger */}
        <Button
          onClick={handleLogout}
          size="sm"
          variant="ghost"
          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2 sm:px-3 text-xs flex items-center space-x-1 transition-colors"
          title="Logout of Portal"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline font-semibold">Logout</span>
        </Button>
      </div>
    </header>
  );
}
