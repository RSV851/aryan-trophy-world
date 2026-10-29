'use client';

import React from 'react';
import Link from 'next/link';
import { InstagramIcon, FacebookIcon, LinkedinIcon, WhatsappIcon } from '@/components/shared/social-icons';
import { Mail } from 'lucide-react';

interface FooterProps {
  settings?: Record<string, any>;
  profile?: any;
  categories?: any[];
}

export function Footer({ settings, profile }: FooterProps) {
  const brandName = settings?.site_name || profile?.businessName || "Aryan's Trophy World";
  const phone = profile?.phone || settings?.contact_phone || '+91 98765 43210';
  const email = profile?.email || settings?.contact_email || 'concierge@aryantrophyworld.com';
  
  // 1. Headquarters Address strictly from CMS Site Settings main store
  const hqStreet = settings?.contact_street_address || profile?.address || 'Shop 12, Trophy Market, MG Road';
  const hqCity = settings?.contact_city || profile?.city || 'Mumbai';
  const hqState = settings?.contact_state || 'Maharashtra';
  const hqPostal = settings?.contact_postal_code || profile?.pincode || '400001';
  const hqFormattedAddress = `${hqStreet}, ${hqCity}, ${hqState} - ${hqPostal}`;

  // 2. Business Bio ONLY from business owner profile
  const bio = profile?.bio || 'Premier trophy & award atelier specializing in custom corporate awards, sports cups, and precision laser engraving.';

  // 3. Operating/Working Hours from CMS Site Settings ONLY
  const monFriHours = settings?.operating_hours_mon_fri || '10:00 - 20:00 IST';
  const satHours = settings?.operating_hours_saturday || '10:00 - 18:00 IST';
  const sunHours = settings?.operating_hours_sunday || 'By Appointment Only';

  // 4. Dynamic Footer Collections from CMS Site Settings
  let footerCollections: Array<{ label: string; url: string }> = [];
  try {
    const rawColls = settings?.footer_collections;
    const parsed = typeof rawColls === 'string' ? JSON.parse(rawColls) : (Array.isArray(rawColls) ? rawColls : []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      footerCollections = parsed;
    }
  } catch {
    footerCollections = [];
  }

  if (!footerCollections || footerCollections.length === 0) {
    footerCollections = [
      { label: 'Sports Series', url: '/catalog?category=Sports' },
      { label: 'Corporate Glass', url: '/catalog?material=Crystal' },
      { label: 'Academic Gold', url: '/catalog?material=Metal' },
      { label: 'Bespoke Casing', url: '/catalog?material=Wooden' },
      { label: 'Limited Range', url: '/catalog?collection=Premium' },
    ];
  }

  const facebookUrl = settings?.social_facebook || '#';
  const instagramUrl = settings?.social_instagram || '#';
  const linkedinUrl = settings?.social_linkedin || '#';
  const whatsappUrl = settings?.social_whatsapp || `https://wa.me/${phone.replace(/[^0-9]/g, '')}`;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card pt-12 mobile-mid:pt-16 phablet:pt-20 sm:pt-24 pb-8 mobile-mid:pb-12 sm:pb-16 border-t border-border text-foreground transition-colors duration-300" data-purpose="site-footer">
      <div className="container-custom">
        <div className="grid grid-cols-1 phablet:grid-cols-2 md:grid-cols-4 gap-8 mobile-mid:gap-10 phablet:gap-12 md:gap-16 mb-12 mobile-mid:mb-16 sm:mb-24">
          
          {/* Brand Info & Business Bio (Strictly from Profile) */}
          <div className="col-span-1 md:col-span-1">
            <div className="text-xl font-display font-light tracking-[0.2em] text-primary mb-8 uppercase">
              {brandName}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-xs font-light">
              {bio}
            </p>
            <div className="flex items-center space-x-5">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1" title="Instagram">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1" title="Facebook">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1" title="LinkedIn">
                <LinkedinIcon className="w-5 h-5" />
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1" title="WhatsApp">
                <WhatsappIcon className="w-5 h-5" />
              </a>
              <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Direct Mail">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="text-foreground font-bold uppercase tracking-[0.2em] text-[10px] mb-10">Navigation</h5>
            <ul className="space-y-5 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              <li><Link href="/admin/login" className="hover:text-primary transition-colors">Executive Dashboard</Link></li>
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Product Registry</Link></li>
              <li><Link href="/catalog" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Brand Story</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Studio</Link></li>
            </ul>
          </div>

          {/* Collections (Configurable via CMS Site Settings) */}
          <div>
            <h5 className="text-foreground font-bold uppercase tracking-[0.2em] text-[10px] mb-10">Collections</h5>
            <ul className="space-y-5 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              {footerCollections.map((item, idx) => (
                <li key={idx}>
                  <Link href={item.url || '/catalog'} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Headquarters & Working Hours (Strictly from CMS Site Settings) */}
          <div>
            <h5 className="text-foreground font-bold uppercase tracking-[0.2em] text-[10px] mb-10">Headquarters</h5>
            <div className="text-xs text-muted-foreground space-y-6 font-semibold tracking-wider">
              <p className="leading-relaxed">{hqFormattedAddress}</p>
              <p className="text-foreground font-mono text-sm">{phone}</p>
              
              <div className="pt-6 border-t border-border space-y-3">
                <p className="text-[9px] uppercase tracking-[0.3em] text-primary font-bold">Operating Hours</p>
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between text-[11px] gap-0.5 xl:gap-2">
                  <span className="text-foreground/80 shrink-0 font-medium">Mon - Fri:</span>
                  <span className="font-mono font-bold text-foreground whitespace-nowrap">{monFriHours}</span>
                </div>
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between text-[11px] gap-0.5 xl:gap-2">
                  <span className="text-foreground/80 shrink-0 font-medium">Saturday:</span>
                  <span className="font-mono font-bold text-foreground whitespace-nowrap">{satHours}</span>
                </div>
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between text-[11px] gap-0.5 xl:gap-2">
                  <span className="text-foreground/80 shrink-0 font-medium">Sunday:</span>
                  <span className="font-mono font-bold text-primary whitespace-nowrap">{sunHours}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright Footer */}
        <div className="pt-16 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] text-muted-foreground/60 uppercase tracking-[0.3em]">
            © {currentYear} {brandName}. SYSTEM V2.4.0
          </p>
          <div className="flex gap-8 text-[9px] text-muted-foreground/60 uppercase tracking-[0.3em]">
            <Link href="/about" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
