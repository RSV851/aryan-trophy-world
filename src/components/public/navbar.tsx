'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  settings: Record<string, any>;
  profile?: any;
}

export function Navbar({ settings }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check initial theme preference or default to dark
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
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

  const brandName = settings?.site_name || 'ATELIER PREMIÈRE';

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Catalog', href: '/catalog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 py-4 h-20 flex items-center bg-black border-b border-white/10 w-full" data-purpose="main-nav">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between w-full">
        
        {/* Logo */}
        <Link 
          href="/" 
          className="text-base sm:text-lg md:text-xl font-display font-light tracking-[0.15em] sm:tracking-[0.2em] text-[#f2ca50] uppercase hover:opacity-90 transition-opacity truncate max-w-[200px] sm:max-w-none"
        >
          {brandName}
        </Link>

        {/* Navigation Links (Desktop & Tablet Lg) */}
        <ul className="hidden md:flex items-center space-x-6 lg:space-x-10 text-[11px] uppercase tracking-[0.2em] font-semibold text-white/70">
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

        {/* Right Section: Search & Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Desktop Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative hidden lg:block w-40 xl:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 px-4 text-xs text-white focus:border-[#2563eb] focus:ring-0 outline-none transition-all placeholder:text-white/30"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm hover:text-white transition-colors" aria-label="Search">
              <span className="material-symbols-outlined text-sm">search</span>
            </button>
          </form>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#f2ca50] hover:text-white transition-all flex items-center justify-center"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-white" />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            className="md:hidden text-white/80 hover:text-[#f2ca50] p-1.5 focus:outline-none rounded-lg bg-white/5 border border-white/10"
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
