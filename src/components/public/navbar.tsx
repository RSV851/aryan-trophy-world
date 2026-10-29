'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Sun, Moon, Search } from 'lucide-react';

import Image from 'next/image';

import { SmartImage } from '@/components/ui/smart-image';
import { useSettingsStore } from '@/stores/settings-store';
import { Trophy } from 'lucide-react';

interface NavbarProps {
  settings: Record<string, any>;
  profile?: any;
}

export function Navbar({ settings, profile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const liveSettings = useSettingsStore((s) => s.settingsMap);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    // Sync initial state with documentElement class (set by 0ms head script)
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const activeSettings = Object.keys(liveSettings).length > 0 ? liveSettings : settings;
  const brandName = activeSettings?.site_name || profile?.businessName || "Aryan's Trophy World";
  const logoUrl = activeSettings?.site_logo || activeSettings?.logo_url || '';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Catalog', href: '/catalog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 py-4 h-20 flex items-center bg-background/95 backdrop-blur-md border-b border-border text-foreground transition-colors duration-300 w-full" data-purpose="main-nav">
      <div className="max-w-[1440px] mx-auto px-2.5 mobile-mid:px-3.5 mobile-lg:px-4 phablet:px-5 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between w-full gap-1.5 mobile-mid:gap-2 mobile-lg:gap-3 sm:gap-4">
        
        {/* Logo & Brand Title (Fluid 9-Tier Responsive - Never Truncates) */}
        <Link 
          href="/" 
          className="flex items-center space-x-1.5 mobile-mid:space-x-2 sm:space-x-3 text-primary uppercase hover:opacity-90 transition-all shrink-0"
        >
          <SmartImage
            src={logoUrl}
            alt={`${brandName} Logo`}
            className="w-8 h-8 mobile-mid:w-9 mobile-mid:h-9 mobile-lg:w-10 mobile-lg:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-card border border-primary/30 p-1 shrink-0 shadow-sm"
            imgClassName="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(242,202,80,0.3)]"
            fallbackIcon={<Trophy className="w-4 h-4 mobile-mid:w-5 mobile-mid:h-5 sm:w-6 sm:h-6 text-primary stroke-[2]" />}
          />
          <span className="font-serif font-bold text-[11px] mobile-mid:text-xs mobile-lg:text-sm phablet:text-base sm:text-base md:text-base lg:text-base xl:text-lg 2xl:text-xl tracking-tight mobile-lg:tracking-normal sm:tracking-wider lg:tracking-[0.1em] xl:tracking-[0.14em] whitespace-nowrap">
            {brandName}
          </span>
        </Link>

        {/* Navigation Links (Desktop & Tablet Lg) */}
        <ul className="hidden md:flex items-center space-x-3 md:space-x-4 lg:space-x-6 xl:space-x-8 text-[11px] lg:text-xs uppercase tracking-[0.12em] lg:tracking-[0.18em] font-semibold text-foreground/70 shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`transition-colors ${
                    isActive
                      ? 'text-primary border-b-2 border-primary pb-1'
                      : 'hover:text-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Section: Search & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Tablet (768px - 1024px) Z-Axis Floating Search Overlay */}
          {searchOpen ? (
            <div className="absolute top-[calc(100%-5px)] right-3 sm:right-6 md:right-8 lg:hidden z-50 animate-in fade-in slide-in-from-top-1 duration-200">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-card border border-border rounded-full py-1.5 px-3 shadow-2xl">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog..."
                  className="w-40 sm:w-48 bg-transparent py-0.5 pl-2 pr-14 text-xs text-foreground outline-none placeholder:text-foreground/40 font-sans"
                />
                <div className="absolute right-2 flex items-center space-x-1.5">
                  <button
                    type="submit"
                    aria-label="Submit Search"
                    className="text-primary hover:opacity-80 p-1 transition-colors flex items-center justify-center"
                    title="Search"
                  >
                    <span className="material-symbols-outlined text-sm leading-none">search</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Close Search"
                    className="text-foreground/50 hover:text-foreground p-1 transition-colors flex items-center justify-center"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open Search"
              className="hidden md:flex lg:hidden p-2 rounded-full bg-card hover:bg-muted border border-border text-primary transition-all items-center justify-center shadow-sm"
              title="Search Catalog"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Desktop Search Form (> 1024px) */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-28 xl:w-44">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-card border border-border rounded-full py-1.5 px-4 text-xs text-foreground focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-foreground/40 shadow-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 text-sm hover:text-primary transition-colors" aria-label="Search">
              <span className="material-symbols-outlined text-sm">search</span>
            </button>
          </form>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-full bg-card hover:bg-muted border border-border text-primary transition-all flex items-center justify-center shadow-sm cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            className="md:hidden text-foreground/80 hover:text-primary p-1.5 focus:outline-none rounded-lg bg-card border border-border"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileOpen && (
        <div className="absolute top-20 left-0 right-0 bg-black border-b border-white/10 p-6 space-y-6 md:hidden z-50 shadow-2xl animate-in fade-in-50">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
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
                  className={`block py-2 transition-colors ${
                    pathname === link.href ? 'text-[#f2ca50] font-black' : 'hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
