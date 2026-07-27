'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';
import {
  LayoutDashboard,
  Trophy,
  MessageSquareQuote,
  Layers,
  Image as ImageIcon,
  Settings,
  UserCheck,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  X,
  Tag,
  FolderTree,
  Box,
  Palette,
  Sparkles,
  Bookmark,
  Shapes as ShapesIcon
} from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { title: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Products Catalog', href: '/admin/products', icon: Trophy },
  { title: 'Customer Inquiries', href: '/admin/inquiries', icon: MessageSquareQuote },
  {
    title: 'Master Data',
    icon: Layers,
    children: [
      { title: 'Product Types', href: '/admin/types', icon: Tag },
      { title: 'Categories', href: '/admin/categories', icon: FolderTree },
      { title: 'Subcategories', href: '/admin/subcategories', icon: Box },
      { title: 'Materials', href: '/admin/materials', icon: Palette },
      { title: 'Themes', href: '/admin/themes', icon: Sparkles },
      { title: 'Shapes', href: '/admin/shapes', icon: ShapesIcon },
      { title: 'Collections', href: '/admin/collections', icon: Bookmark },
    ],
  },
  { title: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { title: 'Site Settings', href: '/admin/settings', icon: Settings },
  { title: 'Business Profile', href: '/admin/profile', icon: UserCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const [openAccordion, setOpenAccordion] = useState<string | null>('Master Data');

  const toggleAccordion = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  const isActiveRoute = (href?: string) => {
    if (!href) return false;
    if (href === '/admin' && pathname === '/admin') return true;
    if (href !== '/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#111827] border-r border-gray-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800/80 bg-[#090909]">
          <Link href="/admin" className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#C5A55A]/10 border border-[#C5A55A]/50 flex items-center justify-center text-[#C5A55A] shrink-0 shadow-[0_0_15px_rgba(197,165,90,0.2)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-white uppercase truncate font-serif">
                Aryan Trophy
              </span>
              <span className="text-[10px] text-[#C5A55A] tracking-wider uppercase font-semibold">
                CMS Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.href);
            const isAccordion = !!item.children;
            const isOpen = openAccordion === item.title;

            if (isAccordion) {
              const hasActiveChild = item.children?.some((child) =>
                pathname.startsWith(child.href)
              );
              return (
                <div key={item.title} className="space-y-1">
                  <button
                    onClick={() => toggleAccordion(item.title)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
                      hasActiveChild
                        ? 'text-[#C5A55A] bg-[#C5A55A]/10 border border-[#C5A55A]/30'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pl-6 space-y-1 pt-1">
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname.startsWith(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs transition-all duration-200 ${
                              childActive
                                ? 'text-[#C5A55A] bg-[#C5A55A]/15 font-semibold border-l-2 border-[#C5A55A]'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                            }`}
                          >
                            <ChildIcon className="w-3.5 h-3.5 shrink-0 text-[#C5A55A]/70" />
                            <span>{child.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href!}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
                  active
                    ? 'text-[#C5A55A] bg-[#C5A55A]/15 font-bold shadow-[0_0_15px_rgba(197,165,90,0.15)] border-l-4 border-[#C5A55A]'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C5A55A]' : 'text-gray-400'}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Badge */}
        <div className="p-4 border-t border-gray-800/80 bg-[#090909]">
          <div className="bg-[#111827] border border-gray-800 rounded-lg p-3 text-center shadow-inner">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
              System Status
            </p>
            <div className="flex items-center justify-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300">Live & Operational</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
