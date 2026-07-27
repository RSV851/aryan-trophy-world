'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useInquiryStore } from '@/stores/inquiry-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Search, ShoppingBag, Menu, X, Phone, Mail, ChevronRight } from 'lucide-react';

interface NavbarProps {
  settings: Record<string, any>;
  profile: any;
}

export function Navbar({ settings, profile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const totalItems = useInquiryStore((s) => s.getTotalItems());

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const brandName = settings?.site_name || process.env.NEXT_PUBLIC_SITE_NAME || 'Aryan Trophy World';
  const phone = profile?.phone || settings?.contact_phone || '+91-9876543210';
  const email = profile?.email || settings?.contact_email || 'info@aryantrophyworld.com';

  const navLinks = [
    { name: 'Showroom Home', href: '/' },
    { name: 'Award Catalog', href: '/catalog' },
    { name: 'Our Craftsmanship', href: '/about' },
    { name: 'Contact Workshop', href: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#1A1F36]/95 backdrop-blur-md text-white shadow-xl py-2.5 border-b border-[#C5A55A]/30'
          : 'bg-[#1A1F36] text-white py-4 border-b border-[#1A1F36]/50'
      }`}
    >
      {/* Top Bar for Executive Contact Credentials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden md:flex items-center justify-between pb-3 mb-2 border-b border-white/10 text-xs text-gray-300">
        <div className="flex items-center space-x-6">
          <span className="flex items-center space-x-1.5 font-medium hover:text-[#C5A55A] transition-colors">
            <Phone className="w-3.5 h-3.5 text-[#C5A55A]" />
            <span>{phone}</span>
          </span>
          <span className="flex items-center space-x-1.5 font-medium hover:text-[#C5A55A] transition-colors">
            <Mail className="w-3.5 h-3.5 text-[#C5A55A]" />
            <span>{email}</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 font-semibold tracking-wide uppercase text-[11px] text-[#C5A55A]">
          <span>Custom Engraving & Wholesale Corporate Orders Available</span>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Identity / Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A55A] to-[#9A7D37] p-0.5 shadow-[0_0_20px_rgba(197,165,90,0.3)] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#1A1F36] rounded-[10px] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#C5A55A]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold uppercase tracking-tight font-serif text-white group-hover:text-[#C5A55A] transition-colors">
              {brandName}
            </span>
            <span className="text-[10px] uppercase font-semibold text-[#C5A55A] tracking-widest -mt-0.5">
              The Trophy Atelier
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold uppercase tracking-wider transition-all relative py-1 ${
                  isActive
                    ? 'text-[#C5A55A]'
                    : 'text-gray-200 hover:text-white'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C5A55A] rounded-full shadow-[0_0_8px_rgba(197,165,90,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar & Inquiry Basket Button */}
        <div className="hidden md:flex items-center space-x-4">
          <form onSubmit={handleSearchSubmit} className="relative w-48 xl:w-64">
            <Input
              type="text"
              placeholder="Search trophies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-8 pr-3 rounded-full text-xs focus:border-[#C5A55A] focus:bg-white/15 transition-all"
            />
            <Search className="w-4 h-4 text-gray-300 absolute left-2.5 top-2.5" />
          </form>

          <Link href="/inquiry">
            <Button
              className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase text-xs px-4 h-10 rounded-full shadow-[0_0_15px_rgba(197,165,90,0.3)] flex items-center space-x-2 relative group transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Inquiry Basket</span>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-mono text-[11px] font-black min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 animate-pulse border-2 border-[#1A1F36]">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center space-x-2 lg:hidden">
          <Link href="/inquiry">
            <Button
              size="icon"
              className="w-10 h-10 bg-[#C5A55A] text-[#090909] rounded-full relative shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Accordion Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1A1F36] border-t border-[#C5A55A]/30 px-4 pt-4 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Input
              type="text"
              placeholder="Search awards, materials, themes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-white/10 border-white/20 text-white pl-9 pr-4 rounded-xl text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          </form>
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-gray-200 hover:text-[#C5A55A] hover:bg-white/5 transition-colors"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-[#C5A55A]" />
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-white/10 flex flex-col space-y-2 text-xs text-gray-300">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-[#C5A55A]" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#C5A55A]" />
              <span>{email}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
