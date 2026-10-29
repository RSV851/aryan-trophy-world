'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { StatsCard } from '@/components/admin/stats-card';
import {
  Trophy,
  MessageSquareQuote,
  Image as ImageIcon,
  Layers,
  PlusCircle,
  Settings,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Inbox
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DashboardStats {
  productsCount: number;
  inquiriesCount: number;
  newInquiriesCount: number;
  categoriesCount: number;
}

interface RecentInquiry {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  status: string;
  createdAt: string;
  products: { productId: string; quantity: number }[];
}

export default function AdminDashboardPage() {
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    inquiriesCount: 0,
    newInquiriesCount: 0,
    categoriesCount: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/dashboard', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        if (data) {
          setStats(data.stats || {
            productsCount: 0,
            inquiriesCount: 0,
            newInquiriesCount: 0,
            categoriesCount: 0,
          });
          setRecentInquiries(data.recentInquiries || []);
        }
      } else {
        toast.error('Failed to connect to real-time DB analytics engine.');
      }
    } catch {
      toast.error('Failed to load complete dashboard diagnostics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#C5A55A]/20 text-[#C5A55A] border border-[#C5A55A]/40 flex items-center space-x-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>New Lead</span>
          </span>
        );
      case 'read':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center space-x-1">
            <Clock className="w-2.5 h-2.5" />
            <span>Reviewed</span>
          </span>
        );
      case 'replied':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Replied</span>
          </span>
        );
      case 'closed':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-700/50 text-gray-400 border border-gray-600">
            Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 mobile-mid:space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-4 mobile-mid:p-5 phablet:p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#C5A55A]/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mobile-mid:gap-4 relative z-10">
          <div className="space-y-1.5 mobile-mid:space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#C5A55A]/15 border border-[#C5A55A]/30 text-[#C5A55A] text-[10px] mobile-mid:text-xs font-semibold">
              <Sparkles className="w-3 h-3 mobile-mid:w-3.5 mobile-mid:h-3.5" />
              <span>Executive Showroom Dashboard</span>
            </div>
            <h1 className="text-xl mobile-mid:text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif">
              Welcome back, {profile?.name || 'Executive Admin'}
            </h1>
            <p className="text-xs mobile-mid:text-sm text-gray-400 max-w-2xl">
              Monitor customer quotes, manage state-of-the-art trophy collections, and oversee live catalog performance in real time.
            </p>
          </div>

          <Button
            onClick={fetchDashboardData}
            variant="outline"
            size="sm"
            className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] mobile-mid:text-xs flex items-center space-x-2 shrink-0 h-9 mobile-mid:h-10 px-3 mobile-mid:px-4"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 phablet:grid-cols-2 lg:grid-cols-4 gap-3 mobile-mid:gap-4 sm:gap-6">
        <StatsCard
          title="Active Catalog Trophies"
          value={stats.productsCount}
          subtitle="Trophies, Medals & Plaques"
          icon={Trophy}
          accentColor="gold"
          isLoading={loading}
        />
        <StatsCard
          title="Customer Inquiries"
          value={stats.inquiriesCount}
          subtitle={`${stats.newInquiriesCount} pending response`}
          icon={MessageSquareQuote}
          accentColor="emerald"
          isLoading={loading}
        />
        <StatsCard
          title="Master Categories"
          value={stats.categoriesCount}
          subtitle="Sports, Academic, Corporate"
          icon={Layers}
          accentColor="blue"
          isLoading={loading}
        />
      </div>

      {/* Quick Actions Bar */}
      <div className="space-y-3 mobile-mid:space-y-4">
        <h2 className="text-xs mobile-mid:text-sm font-bold uppercase tracking-wider text-gray-400 font-serif">
          ⚡ Quick Management Actions
        </h2>
        <div className="grid grid-cols-1 phablet:grid-cols-2 lg:grid-cols-4 gap-3 mobile-mid:gap-4">
          <Link href="/admin/products?action=new">
            <div className="bg-[#111827]/70 hover:bg-[#111827] border border-[#C5A55A]/30 hover:border-[#C5A55A] rounded-xl p-4 transition-all group flex items-center justify-between cursor-pointer shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[#C5A55A]/15 text-[#C5A55A] group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Add New Trophy</h4>
                  <p className="text-[11px] text-gray-400">Launch into catalog</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-[#C5A55A]" />
            </div>
          </Link>

          <Link href="/admin/inquiries">
            <div className="bg-[#111827]/70 hover:bg-[#111827] border border-gray-800 hover:border-emerald-500/50 rounded-xl p-4 transition-all group flex items-center justify-between cursor-pointer shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageSquareQuote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Review Quotes</h4>
                  <p className="text-[11px] text-gray-400">Respond to customers</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
            </div>
          </Link>

          <Link href="/admin/categories">
            <div className="bg-[#111827]/70 hover:bg-[#111827] border border-gray-800 hover:border-blue-500/50 rounded-xl p-4 transition-all group flex items-center justify-between cursor-pointer shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Master Data</h4>
                  <p className="text-[11px] text-gray-400">Configure filters</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
            </div>
          </Link>

          <Link href="/admin/settings">
            <div className="bg-[#111827]/70 hover:bg-[#111827] border border-gray-800 hover:border-purple-500/50 rounded-xl p-4 transition-all group flex items-center justify-between cursor-pointer shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400 group-hover:scale-110 transition-transform">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Site Branding</h4>
                  <p className="text-[11px] text-gray-400">Logo, colors & SEO</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Inquiries Widget */}
      <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center space-x-2 font-serif">
              <Inbox className="w-5 h-5 text-[#C5A55A]" />
              <span>Recent Customer Inquiries</span>
            </h3>
            <p className="text-xs text-gray-400">Latest quotation requests submitted through the showroom catalog</p>
          </div>
          <Link href="/admin/inquiries">
            <Button size="sm" variant="ghost" className="text-[#C5A55A] hover:bg-[#C5A55A]/10 text-xs font-semibold">
              <span>View All Inquiries →</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full bg-gray-800/60 rounded-xl" />
            <Skeleton className="h-14 w-full bg-gray-800/60 rounded-xl" />
            <Skeleton className="h-14 w-full bg-gray-800/60 rounded-xl" />
          </div>
        ) : recentInquiries.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
            <MessageSquareQuote className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-bold text-gray-400">No recent customer inquiries logged</p>
            <p className="text-xs text-gray-600 mt-1">New quotation requests will automatically appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/60">
            {recentInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-800/20 px-3 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-white text-sm">{inquiry.name}</span>
                    {inquiry.company && (
                      <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">
                        {inquiry.company}
                      </span>
                    )}
                    {getStatusBadge(inquiry.status)}
                  </div>
                  <p className="text-xs text-gray-400 font-mono">{inquiry.email}</p>
                  <p className="text-[11px] text-gray-500">
                    Requested <strong className="text-[#C5A55A]">{inquiry.products?.length || 0} trophy item(s)</strong> •{' '}
                    {new Date(inquiry.createdAt).toLocaleDateString()} at {new Date(inquiry.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <Link href={`/admin/inquiries/${inquiry.id}`}>
                  <Button size="sm" variant="outline" className="border-gray-700 bg-gray-800 text-gray-200 hover:text-white text-xs flex items-center space-x-1.5 h-8">
                    <Eye className="w-3.5 h-3.5 text-[#C5A55A]" />
                    <span>Open Quote</span>
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
