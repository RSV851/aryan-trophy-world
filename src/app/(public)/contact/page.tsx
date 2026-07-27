import React from 'react';
import { getPublicOwnerProfile, getPublicSettingsMap } from '@/lib/data/public-catalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Clock, Send, Trophy, ShieldCheck, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Studio & Workshop | Aryan Trophy World',
  description: 'Visit our Mumbai atelier or contact our executive specialists for custom corporate trophy designing, wholesale tournament medals, and brand engraving.',
};

export const revalidate = 60; // SSR refresh interval

export default async function ContactPage() {
  const [profile, settings] = await Promise.all([
    getPublicOwnerProfile(),
    getPublicSettingsMap(),
  ]);

  const brandName = settings?.site_name || 'Aryan Trophy World';
  const phone = profile?.phone || settings?.contact_phone || '+91-9876543210';
  const email = profile?.email || settings?.contact_email || 'info@aryantrophyworld.com';
  const address = profile?.address ? `${profile.address}, ${profile.city || ''}, ${profile.state || ''} ${profile.pincode || ''}` : 'Shop 12, Trophy Market, MG Road, Mumbai, Maharashtra 400001';

  // Local Business Schema for Google Maps & Local SEO
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: brandName,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1000&auto=format&fit=crop&q=80',
    telephone: phone,
    email: email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: profile?.address || 'MG Road, Trophy Market',
      addressLocality: profile?.city || 'Mumbai',
      addressRegion: profile?.state || 'Maharashtra',
      postalCode: profile?.pincode || '400001',
      addressCountry: 'IN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    priceRange: '₹₹ - ₹₹₹₹',
  };

  return (
    <div className="w-full bg-white flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* Hero Banner */}
      <section className="bg-[#1A1F36] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#C5A55A]/30 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#090909] bg-[#C5A55A] px-4 py-1.5 rounded-full inline-block font-serif shadow-lg">
            Workshop & Showroom Coordinates
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-serif uppercase tracking-tight text-white">
            Connect With Our Atelier
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discuss custom corporate milestones, send vector artwork for laser engraving, or visit our studio showroom for tactile evaluation of crystal and metal structures.
          </p>
        </div>
      </section>

      {/* Workspace Section: Credentials + Direct Inquiry Box */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Coordinates & Hours (Span 5) */}
          <div className="lg:col-span-5 space-y-8 bg-[#1A1F36] text-white p-8 sm:p-10 rounded-3xl border-2 border-[#C5A55A] shadow-2xl relative overflow-hidden">
            <div className="space-y-2">
              <h2 className="text-2xl font-black font-serif uppercase tracking-tight text-white">
                Executive Headquarters
              </h2>
              <p className="text-xs text-gray-300">
                Managed directly by brand proprietor & senior manufacturing designers.
              </p>
            </div>

            <div className="space-y-6 pt-4 border-t border-white/10 text-sm">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A] flex items-center justify-center text-[#C5A55A] flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Showroom Address</p>
                  <p className="font-semibold text-white mt-0.5 leading-snug">{address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A] flex items-center justify-center text-[#C5A55A] flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Direct Telephone & WhatsApp</p>
                  <p className="font-mono font-black text-[#C5A55A] text-base mt-0.5">{phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A] flex items-center justify-center text-[#C5A55A] flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Electronic Quotations</p>
                  <p className="font-mono font-semibold text-white mt-0.5">{email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A] flex items-center justify-center text-[#C5A55A] flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Operational Studio Hours</p>
                  <p className="font-semibold text-white mt-0.5">Mon – Sat: 10:00 AM – 8:00 PM IST</p>
                  <p className="text-xs text-[#C5A55A] font-medium mt-0.5">* Urgent tournament dispatches supported 24/7</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-3 text-xs">
                <ShieldCheck className="w-6 h-6 text-[#C5A55A] flex-shrink-0" />
                <span>Verified OEM Business Facility. Free physical trophy preview available for verified corporate accounts.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Communication Portal (Span 7) */}
          <div className="lg:col-span-7 bg-gray-50 p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#C5A55A] bg-[#1A1F36] px-3 py-1 rounded-full inline-block">
                General Correspondence
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#1A1F36] uppercase">
                Send Direct Message to Studio
              </h2>
              <p className="text-xs text-gray-600">
                For custom trophy catalogs or wholesale pricing brackets, we strongly recommend utilizing our specialized quotation basket.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#1A1F36] uppercase tracking-wider">Your Full Name</label>
                  <Input placeholder="Executive Name" className="h-11 bg-white border-gray-300 rounded-xl text-xs font-semibold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#1A1F36] uppercase tracking-wider">Organization / Club</label>
                  <Input placeholder="Company Title" className="h-11 bg-white border-gray-300 rounded-xl text-xs font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#1A1F36] uppercase tracking-wider">Email Address</label>
                  <Input type="email" placeholder="name@company.com" className="h-11 bg-white border-gray-300 rounded-xl text-xs font-semibold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#1A1F36] uppercase tracking-wider">Telephone Number</label>
                  <Input placeholder="+91 9876543210" className="h-11 bg-white border-gray-300 rounded-xl text-xs font-semibold font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#1A1F36] uppercase tracking-wider">Message & Specification Requirements</label>
                <Textarea rows={5} placeholder="Describe desired materials, engraving details, or delivery deadlines..." className="bg-white border-gray-300 rounded-xl text-xs font-medium p-4 resize-none" />
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link href="/inquiry" className="w-full sm:flex-1">
                  <Button className="w-full h-14 bg-[#1A1F36] hover:bg-[#C5A55A] text-white hover:text-[#090909] font-black uppercase text-xs rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all duration-300">
                    <MessageSquare className="w-4 h-4" />
                    <span>Go To Wholesale Quotation Form</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
