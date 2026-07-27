import React from 'react';
import Link from 'next/link';
import { Trophy, MapPin, Phone, Mail, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FooterProps {
  settings: Record<string, any>;
  profile: any;
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function Footer({ settings, profile, categories }: FooterProps) {
  const brandName = settings?.site_name || process.env.NEXT_PUBLIC_SITE_NAME || 'Aryan Trophy World';
  const phone = profile?.phone || settings?.contact_phone || '+91-9876543210';
  const email = profile?.email || settings?.contact_email || 'info@aryantrophyworld.com';
  const address = profile?.address ? `${profile.address}, ${profile.city || ''}, ${profile.state || ''} ${profile.pincode || ''}` : 'Shop 12, Trophy Market, MG Road, Mumbai, Maharashtra 400001';
  const bio = profile?.bio || settings?.site_description || 'Premier designer and creator of custom championship trophies, executive plaques, crystal monuments, and precision badges.';

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1F36] text-white border-t border-[#C5A55A]/30 relative overflow-hidden">
      {/* Subtle luxury background gradient glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C5A55A]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Col 1: Brand Heritage */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A55A] flex items-center justify-center text-[#090909] font-black shadow-[0_0_15px_rgba(197,165,90,0.3)]">
                <Trophy className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold uppercase font-serif tracking-tight text-white">
                {brandName}
              </span>
            </Link>
            <p className="text-xs text-gray-300 leading-relaxed font-sans pr-4">
              {bio}
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs font-semibold text-[#C5A55A] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Prestige Manufacturer</span>
            </div>
          </div>

          {/* Col 2: Showroom Collections */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C5A55A] font-serif">
              Award Classifications
            </h3>
            <ul className="space-y-2 text-xs font-medium text-gray-300">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/catalog?categorySlug=${cat.slug}`}
                    className="hover:text-[#C5A55A] transition-colors flex items-center space-x-1.5"
                  >
                    <ArrowRight className="w-3 h-3 text-[#C5A55A]" />
                    <span>{cat.name} Awards</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/catalog" className="text-[#C5A55A] font-bold hover:underline inline-flex items-center space-x-1 pt-1">
                  <span>Browse Full Showroom</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Guidance */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C5A55A] font-serif">
              Client Guidance
            </h3>
            <ul className="space-y-2.5 text-xs font-medium text-gray-300">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Our Craftsmanship Heritage</Link>
              </li>
              <li>
                <Link href="/inquiry" className="hover:text-white transition-colors">Wholesale Inquiry Process</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Custom Logo & Engraving Support</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Bulk Corporate Quotation Requests</Link>
              </li>
              <li className="pt-2 text-[11px] text-[#C5A55A]/90 font-mono italic">
                * Zero e-commerce signup required. Simply select awards & submit custom inquiry.
              </li>
            </ul>
          </div>

          {/* Col 4: Workshop Coordinates */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#C5A55A] font-serif">
              Workshop & Studio
            </h3>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#C5A55A] flex-shrink-0 mt-0.5" />
                <span className="leading-tight">{address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#C5A55A] flex-shrink-0" />
                <span className="font-mono font-semibold text-white">{phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#C5A55A] flex-shrink-0" />
                <span className="font-mono text-white">{email}</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-gray-400">
                <Clock className="w-3.5 h-3.5 text-[#C5A55A]" />
                <span>Mon – Sat: 10:00 AM – 8:00 PM IST</span>
              </div>
            </div>
            <div className="pt-2">
              <Link href="/inquiry">
                <Button className="w-full bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase text-[11px] h-9 rounded-lg shadow-md">
                  Request Immediate Quote
                </Button>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar / Copyright */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© {currentYear} {brandName}. All rights reserved. Precision crafted for excellence.</p>
          <div className="mt-4 sm:mt-0 flex items-center space-x-6">
            <Link href="/admin/login" className="hover:text-[#C5A55A] font-mono transition-colors">
              Executive CMS Access
            </Link>
            <span>•</span>
            <span className="text-[#C5A55A] font-serif font-bold tracking-wider">
              The Trophy Atelier
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
