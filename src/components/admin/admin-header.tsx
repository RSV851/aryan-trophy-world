'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { Menu, LogOut, ExternalLink, User, Shield, Sparkles, RefreshCw, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { runSharedHealthAudit } from '@/lib/utils/audit-throttler';

export function AdminHeader() {
  const pathname = usePathname();
  const { profile, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [warningCount, setWarningCount] = React.useState(0);

  const checkHealth = React.useCallback(async (force = false) => {
    try {
      const json = await runSharedHealthAudit(force);
      if (json && json.success) {
        setWarningCount(json.warningsCount || 0);
      }
    } catch {
      // Non-blocking
    }
  }, []);

  React.useEffect(() => {
    checkHealth(false);
    // Auto re-scan health audit on tab switch / every 15 mins
    const interval = setInterval(() => checkHealth(false), 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkHealth, pathname]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.loading('Refreshing portal data & cache...', { id: 'header-refresh' });
    checkHealth();
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('CMS data refreshed!', { id: 'header-refresh' });
    }, 600);
  };

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
        {/* Notification Bell Button */}
        <Link href="/admin/notifications">
          <Button
            variant="outline"
            size="sm"
            className="relative border-gray-700 bg-gray-800/50 text-gray-200 hover:text-[#C5A55A] hover:border-[#C5A55A]/50 text-xs flex items-center justify-center p-2 rounded-xl"
            title="System Notifications & Asset Health"
          >
            <Bell className="w-4 h-4 text-gray-300" />
            {warningCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-md">
                {warningCount}
              </span>
            )}
          </Button>
        </Link>
        {/* Global Refresh Data Button */}
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="border-gray-700 bg-gray-800/50 text-[#C5A55A] hover:bg-gray-800 hover:border-[#C5A55A] text-xs flex items-center space-x-1.5 px-3"
          title="Refresh Data & View"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-bold">Refresh</span>
        </Button>

        {/* Live Website Preview Link */}
        <Link href="/" target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 bg-gray-800/50 text-gray-200 hover:text-[#C5A55A] hover:border-[#C5A55A]/50 text-xs hidden sm:flex items-center space-x-1.5 px-3"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Site</span>
          </Button>
        </Link>

        {/* Admin Profile Chip */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#090909] border border-[#C5A55A]/30 text-white shadow-xs">
          <SmartImage
            src={profile?.avatarUrl}
            alt="Admin Avatar"
            className="w-7 h-7 rounded-full bg-[#C5A55A]/20 text-[#C5A55A] font-bold text-xs border border-[#C5A55A]"
            imgClassName="w-full h-full object-cover rounded-full"
            fallbackIcon={
              profile?.name ? (
                <span className="font-bold text-xs text-[#C5A55A]">{profile.name[0].toUpperCase()}</span>
              ) : (
                <User className="w-3.5 h-3.5 text-[#C5A55A]" />
              )
            }
          />
          <div className="hidden md:flex flex-col text-left mr-1">
            <span className="text-xs font-bold leading-none truncate max-w-[140px]">
              {profile?.name || profile?.businessName || 'Admin'}
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
