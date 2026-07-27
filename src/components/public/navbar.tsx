'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useInquiryBasketStore } from '@/stores/inquiry-basket-store';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  ShoppingBag,
  Phone,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';

export function PublicNavbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = useInquiryBasketStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Trophy Catalog', href: '/catalog' },
    { label: 'About Atelier', href: '/about' },
    { label: 'Contact & Showroom', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-gray-200/80 shadow-xs transition-all">
      {/* Top Notification Bar */}
      <div className="bg-[#1A1F36] text-[#DFCA85] text-[11px] font-semibold py-1.5 px-4 text-center tracking-wider uppercase flex items-center justify-center space-x-3">
        <span>🏆 Premier Manufacturer of Custom Crystal Awards & Championship Trophies in Mumbai</span>
        <span className="hidden sm:inline text-gray-500">•</span>
        <a href="tel:+919820012345" className="hidden sm:inline hover:underline text-white font-bold flex items-center space-x-1">
          <Phone className="w-3 h-3 text-[#C5A55A] mr-1" />
          <span>Call: +91 98200 12345</span>
        </a>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-xl bg-[#1A1F36] border border-[#C5A55A]/40 flex items-center justify-center text-[#C5A55A] shadow-md group-hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black font-serif text-[#1A1F36] tracking-tight uppercase block leading-none">
              Aryan Trophy <span className="text-[#C5A55A]">World</span>
            </span>
            <span className="text-[10px] text-gray-500 tracking-widest font-bold uppercase block mt-1">
              The Trophy Atelier • Mumbai
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs uppercase tracking-widest font-bold transition-colors py-1 border-b-2 ${
                  isActive
                    ? 'text-[#C5A55A] border-[#C5A55A]'
                    : 'text-gray-700 border-transparent hover:text-[#1A1F36] hover:border-gray-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Inquiry Basket Button */}
          <Link href="/inquiry">
            <Button
              size="sm"
              className="bg-[#1A1F36] hover:bg-[#0F1322] text-[#DFCA85] font-extrabold uppercase tracking-wider text-xs h-11 px-4 sm:px-5 rounded-xl shadow-md flex items-center space-x-2.5 relative border border-[#C5A55A]/30"
            >
              <ShoppingBag className="w-4 h-4 text-[#C5A55A]" />
              <span className="hidden sm:inline">Inquiry Basket</span>
              <span className="w-5 h-5 rounded-full bg-[#C5A55A] text-[#0F1322] font-black text-[11px] flex items-center justify-center shrink-0">
                {totalCount}
              </span>
            </Button>
          </Link>

          {/* Admin Login Shortcut Icon */}
          <Link href="/admin/login" className="hidden lg:flex" title="Admin Portal Login">
            <Button variant="ghost" size="icon" className="w-10 h-10 text-gray-500 hover:text-[#1A1F36]">
              <ShieldCheck className="w-5 h-5" />
            </Button>
          </Link>

          {/* Mobile Drawer Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-[#1A1F36]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1A1F36] border-b border-gray-800 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-bold text-gray-200 hover:text-[#C5A55A] uppercase tracking-wider py-2 border-b border-gray-800 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-3">
            <a
              href="tel:+919820012345"
              className="w-full bg-[#C5A55A] text-[#0F1322] font-black uppercase text-xs h-11 rounded-xl flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Showroom Direct</span>
            </a>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center text-xs text-gray-400 hover:text-white py-2"
            >
              Admin CMS Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
