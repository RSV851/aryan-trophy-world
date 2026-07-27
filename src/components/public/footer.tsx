'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Phone, Mail, MapPin, Globe, Share2, MessageCircle, ArrowUpRight } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-[#1A1F36] text-white border-t-4 border-[#C5A55A] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Atelier Mission */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A] flex items-center justify-center text-[#C5A55A]">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-serif text-white tracking-wide uppercase">
                Aryan Trophy <span className="text-[#C5A55A]">World</span>
              </span>
            </Link>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Premier manufacturer & wholesale supplier of prestige awards, custom crystal shields, academic medals, and corporate plaques in Mumbai. Crafting perfection since 2012.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[#C5A55A] hover:text-[#0F1322] text-gray-300 flex items-center justify-center transition-colors" title="Instagram">
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[#C5A55A] hover:text-[#0F1322] text-gray-300 flex items-center justify-center transition-colors" title="Facebook">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-[#C5A55A] hover:text-[#0F1322] text-gray-300 flex items-center justify-center transition-colors" title="LinkedIn">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C5A55A] font-serif border-b border-gray-800 pb-2">
              Showroom Navigation
            </h4>
            <ul className="space-y-2 text-xs text-gray-300 font-semibold">
              <li>
                <Link href="/" className="hover:text-[#C5A55A] transition-colors flex items-center justify-between">
                  <span>Home Showcase</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-600" />
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-[#C5A55A] transition-colors flex items-center justify-between">
                  <span>Trophy Catalog</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-600" />
                </Link>
              </li>
              <li>
                <Link href="/inquiry" className="hover:text-[#C5A55A] transition-colors flex items-center justify-between">
                  <span>Wholesale Inquiry Basket</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-600" />
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#C5A55A] transition-colors flex items-center justify-between">
                  <span>About Craftsmanship</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-600" />
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#C5A55A] transition-colors flex items-center justify-between">
                  <span>Contact Showroom</span>
                  <ArrowUpRight className="w-3 h-3 text-gray-600" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C5A55A] font-serif border-b border-gray-800 pb-2">
              Award Classifications
            </h4>
            <ul className="space-y-2 text-xs text-gray-300 font-medium">
              <li><Link href="/catalog?category=sports" className="hover:text-[#C5A55A]">Sports & Tournament Cups</Link></li>
              <li><Link href="/catalog?category=corporate" className="hover:text-[#C5A55A]">Corporate Recognition Crystal</Link></li>
              <li><Link href="/catalog?category=academic" className="hover:text-[#C5A55A]">Academic Honor Medals</Link></li>
              <li><Link href="/catalog?type=plaque" className="hover:text-[#C5A55A]">Custom Wooden Plaques</Link></li>
              <li><Link href="/catalog?type=pin" className="hover:text-[#C5A55A]">Custom Metal Lapel Pins</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Showroom Address */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C5A55A] font-serif border-b border-gray-800 pb-2">
              Showroom Headquarters
            </h4>
            <div className="space-y-2.5 text-xs text-gray-300 font-mono">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#C5A55A] shrink-0 mt-0.5" />
                <span>Shop 4, Prestige Trophy Towers, Industrial Estate, Mumbai, Maharashtra 400013</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+919820012345" className="hover:underline text-emerald-300 font-bold">+91 98200 12345</a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:sales@aryantrophyworld.com" className="hover:underline">sales@aryantrophyworld.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Portal Link */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 Aryan Trophy World. All Rights Reserved. Luxury Catalog Atelier.</p>
          <div className="flex items-center space-x-4">
            <Link href="/admin/login" className="hover:text-[#C5A55A] transition-colors underline font-mono">
              Executive Portal Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
