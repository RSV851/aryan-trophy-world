'use client';

import React from 'react';
import Link from 'next/link';

interface FooterProps {
  settings?: Record<string, any>;
  profile?: any;
  categories?: any[];
}

export function Footer({ settings, profile }: FooterProps) {
  const brandName = settings?.site_name || 'ATELIER PREMIÈRE';
  const phone = profile?.phone || settings?.contact_phone || '+91 98765 43210';
  const email = profile?.email || settings?.contact_email || 'atelier@aryantrophyworld.com';
  const address = profile?.address ? `${profile.address}, ${profile.city || ''} ${profile.pincode || ''}` : 'Atelier Suite 12, Vishva Complex, Viman Nagar, Pune 411014';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black pt-32 pb-16 border-t border-white/5 text-[#e5e2e1]" data-purpose="site-footer">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="text-xl font-display font-light tracking-[0.2em] text-[#f2ca50] mb-8 uppercase">
              {brandName}
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs">
              The pinnacle of luxury awards, medals, and corporate mementos. Crafting excellence for the world's most prestigious achievements since 2008.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-white/30 hover:text-[#2563eb] transition-colors" title="Official Website">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a href="#" className="text-white/30 hover:text-[#2563eb] transition-colors" title="Share Portfolio">
                <span className="material-symbols-outlined">share</span>
              </a>
              <a href={`mailto:${email}`} className="text-white/30 hover:text-[#2563eb] transition-colors" title="Direct Mail">
                <span className="material-symbols-outlined">mail</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="text-white font-bold uppercase tracking-[0.2em] text-[10px] mb-10">Navigation</h5>
            <ul className="space-y-5 text-xs text-white/40 uppercase tracking-widest font-semibold">
              <li><Link href="/admin/login" className="hover:text-[#f2ca50] transition-colors">Executive Dashboard</Link></li>
              <li><Link href="/catalog" className="hover:text-[#f2ca50] transition-colors">Product Registry</Link></li>
              <li><Link href="/catalog" className="hover:text-[#f2ca50] transition-colors">Categories</Link></li>
              <li><Link href="/about" className="hover:text-[#f2ca50] transition-colors">Brand Story</Link></li>
              <li><Link href="/contact" className="hover:text-[#f2ca50] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h5 className="text-white font-bold uppercase tracking-[0.2em] text-[10px] mb-10">Collections</h5>
            <ul className="space-y-5 text-xs text-white/40 uppercase tracking-widest font-semibold">
              <li><Link href="/catalog?category=Sports" className="hover:text-[#f2ca50] transition-colors">Sports Series</Link></li>
              <li><Link href="/catalog?material=Crystal" className="hover:text-[#f2ca50] transition-colors">Corporate Glass</Link></li>
              <li><Link href="/catalog?material=Metal" className="hover:text-[#f2ca50] transition-colors">Academic Gold</Link></li>
              <li><Link href="/catalog?material=Wooden" className="hover:text-[#f2ca50] transition-colors">Bespoke Casing</Link></li>
              <li><Link href="/catalog?collection=Premium" className="hover:text-[#f2ca50] transition-colors">Limited Range</Link></li>
            </ul>
          </div>

          {/* Headquarters */}
          <div>
            <h5 className="text-white font-bold uppercase tracking-[0.2em] text-[10px] mb-10">Headquarters</h5>
            <div className="text-xs text-white/40 space-y-6 font-semibold tracking-wider">
              <p className="leading-loose">{address}</p>
              <p className="text-white font-mono text-sm">{phone}</p>
              <div className="pt-6 border-t border-white/10 space-y-3">
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/30">Operating Hours</p>
                <p className="text-white/70">Mon - Sat: 10 AM - 8:30 PM</p>
                <p className="text-white/70">Sun: By Appointment Only</p>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright Footer */}
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.3em]">
            © {currentYear} {brandName}. SYSTEM V2.4.0
          </p>
          <div className="flex gap-8 text-[9px] text-white/20 uppercase tracking-[0.3em]">
            <Link href="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
