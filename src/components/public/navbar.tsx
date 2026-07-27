'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useInquiryStore } from '@/stores/inquiry-store';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  settings: Record<string, any>;
  profile: any;
}

export function Navbar({ settings }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalItems = useInquiryStore((s) => s.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const brandName = settings?.site_name || 'ATELIER PREMIÈRE';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Catalog', href: '/catalog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 premium-glass py-4 h-20 flex items-center bg-[#000000]/80 backdrop-blur-2xl border-b border-white/10" data-purpose="main-nav">
      <div className="container-custom flex items-center justify-between w-full">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-display font-light tracking-[0.2em] text-[#f2ca50] uppercase hover:opacity-90 transition-opacity">
          {brandName}
        </Link>

        {/* Navigation Links */}
        <ul className="hidden md:flex items-center space-x-10 text-[11px] uppercase tracking-[0.2em] font-semibold text-white/70">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`transition-colors ${
                    isActive
                      ? 'text-[#f2ca50] border-b border-[#f2ca50] pb-1'
                      : 'hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Search & Inquiry / Profile Action */}
        <div className="flex items-center gap-6">
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 px-4 text-xs text-white focus:border-[#2563eb] focus:ring-0 outline-none transition-all placeholder:text-white/30"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">search</span>
            </button>
          </form>

          {/* Wholesale Quotation Bag Button */}
          <Link href="/inquiry" title="Wholesale Quotation Basket" className="relative text-white/70 hover:text-white transition-colors flex items-center">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#f2ca50] text-[#000000] font-black text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg font-mono">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Admin Profile Link */}
          <Link href="/admin/login" title="Executive Studio CMS Login" className="text-white/70 hover:text-white transition-colors hidden sm:flex items-center">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/80 hover:text-[#f2ca50] p-1 focus:outline-none"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[#0a0a0a] border-b border-white/10 p-6 space-y-6 md:hidden z-50 shadow-2xl animate-in fade-in-50">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search awards catalog..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-5 text-sm text-white focus:border-[#2563eb] outline-none"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">
              <span className="material-symbols-outlined text-base">search</span>
            </button>
          </form>

          <ul className="space-y-4 text-xs uppercase tracking-[0.2em] font-semibold text-white/70">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-1.5 transition-colors ${
                    pathname === link.href ? 'text-[#f2ca50] font-black' : 'hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-white/10 flex justify-between">
              <Link
                href="/inquiry"
                onClick={() => setMobileOpen(false)}
                className="text-[#f2ca50] hover:underline flex items-center gap-2 py-1.5"
              >
                <span>Quotation Bag ({mounted ? totalItems : 0})</span>
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="text-white/50 hover:text-white py-1.5"
              >
                <span>CMS Admin</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
