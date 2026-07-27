import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPublicOwnerProfile, getPublicSettingsMap } from '@/lib/data/public-catalog';
import { Button } from '@/components/ui/button';
import { Trophy, ShieldCheck, Award, Gem, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Craftsmanship & Heritage | Aryan Trophy World',
  description: 'Discover our 15+ years of excellence crafting high-precision corporate awards, Olympic championship trophies, and optical crystal plaques in Mumbai.',
};

export const revalidate = 60; // SSR refresh interval

export default async function AboutPage() {
  const [profile, settings] = await Promise.all([
    getPublicOwnerProfile(),
    getPublicSettingsMap(),
  ]);

  const brandName = settings?.site_name || 'Aryan Trophy World';
  const bio = profile?.bio || 'Aryan Trophy World stands at the forefront of monumental award engineering. Born out of a passion for celebrating human achievement, our Mumbai atelier blends century-old traditional metallurgy with state-of-the-art Italian laser technology.';

  return (
    <div className="w-full bg-white flex flex-col">
      
      {/* 1. HERO HERITAGE BANNER */}
      <section className="bg-[#1A1F36] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#C5A55A]/30 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A55A]/5 rounded-full blur-[160px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-[#C5A55A]/40 text-[#C5A55A] text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest font-serif shadow-md">
            <Trophy className="w-4 h-4 text-[#C5A55A]" />
            <span>The Art of Recognition</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-serif uppercase tracking-tight text-white leading-tight">
            Crafting Monuments of <span className="text-[#C5A55A]">Distinction</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 font-sans max-w-2xl mx-auto leading-relaxed">
            Every victory deserves more than a standard trinket. At {brandName}, we engineer prestige physical symbols that capture milestone achievements, corporate excellence, and championship glories forever.
          </p>
        </div>
      </section>

      {/* 2. THE ATELIER HERITAGE (Story + proprietor profile) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Visual Collage (Col Span 6) */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-[#1A1F36] shadow-2xl bg-gray-900">
              <Image
                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1000&auto=format&fit=crop&q=80"
                alt="Championship Gold Award Craftsmanship"
                fill
                priority
                className="object-cover opacity-90 hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-64 p-6 bg-[#1A1F36] text-white rounded-2xl border-2 border-[#C5A55A] shadow-2xl hidden sm:block">
              <span className="text-3xl font-black text-[#C5A55A] font-serif block">100%</span>
              <span className="text-xs text-gray-300 font-bold uppercase tracking-wider mt-1 block">In-House Production & QC Engineering</span>
            </div>
          </div>

          {/* Right Text Content (Col Span 6) */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-[#C5A55A] bg-[#1A1F36] px-3.5 py-1 rounded-full inline-block font-serif">
              Our Heritage
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-[#1A1F36] uppercase tracking-tight leading-tight">
              Where Precision Meets Architecture
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              {bio}
            </p>

            <div className="pt-4 grid grid-cols-2 gap-4 text-xs font-bold text-[#1A1F36]">
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <ShieldCheck className="w-5 h-5 text-[#C5A55A] flex-shrink-0" />
                <span>Zero Composite Plastics Used</span>
              </div>
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <CheckCircle2 className="w-5 h-5 text-[#C5A55A] flex-shrink-0" />
                <span>Heavyweight Solid Balance</span>
              </div>
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <Sparkles className="w-5 h-5 text-[#C5A55A] flex-shrink-0" />
                <span>Flawless Optical Crystal</span>
              </div>
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200">
                <Award className="w-5 h-5 text-[#C5A55A] flex-shrink-0" />
                <span>Direct Executive Quotations</span>
              </div>
            </div>

            <div className="pt-6">
              <Link href="/catalog">
                <Button className="h-13 px-8 bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase text-xs rounded-xl shadow-lg flex items-center space-x-2">
                  <span>Explore Trophy Collections</span>
                  <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 3. THE 4-STAGE MANUFACTURING PROCESS */}
      <section className="py-24 bg-gray-50/80 border-t border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#C5A55A] bg-[#1A1F36] px-3.5 py-1 rounded-full inline-block font-serif">
              Studio Methodology
            </span>
            <h2 className="text-3xl font-black font-serif uppercase text-[#1A1F36] tracking-tight">
              Our 4-Stage Manufacturing Protocol
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              We govern every phase of trophy production internally to assure immaculate polish, precision dimensions, and punctual event delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="bg-white p-7 rounded-3xl border border-gray-200 hover:border-[#C5A55A] shadow-sm hover:shadow-xl transition-all space-y-4 relative">
              <span className="absolute top-6 right-6 font-mono text-3xl font-black text-gray-200">01</span>
              <div className="w-12 h-12 rounded-2xl bg-[#1A1F36] text-[#C5A55A] flex items-center justify-center font-black">
                <Gem className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold font-serif uppercase text-[#1A1F36]">CAD Sizing & Blueprints</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                We translate client logos and tournament logos into exact 3D models, balancing physical center of gravity across chosen height dimensions.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-gray-200 hover:border-[#C5A55A] shadow-sm hover:shadow-xl transition-all space-y-4 relative">
              <span className="absolute top-6 right-6 font-mono text-3xl font-black text-gray-200">02</span>
              <div className="w-12 h-12 rounded-2xl bg-[#1A1F36] text-[#C5A55A] flex items-center justify-center font-black">
                <Award className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold font-serif uppercase text-[#1A1F36]">Die-Casting & Polish</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                High-density metals and optical crystal structures undergo multi-phase die-casting and manual hand-polishing to achieve a flawless mirror glow.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-gray-200 hover:border-[#C5A55A] shadow-sm hover:shadow-xl transition-all space-y-4 relative">
              <span className="absolute top-6 right-6 font-mono text-3xl font-black text-gray-200">03</span>
              <div className="w-12 h-12 rounded-2xl bg-[#1A1F36] text-[#C5A55A] flex items-center justify-center font-black">
                <Sparkles className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold font-serif uppercase text-[#1A1F36]">Laser & UV Embedding</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Custom individual recipient names, corporate crests, and tournament dates are applied via deep laser etching or vibrant metallic UV flatbeds.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-gray-200 hover:border-[#C5A55A] shadow-sm hover:shadow-xl transition-all space-y-4 relative">
              <span className="absolute top-6 right-6 font-mono text-3xl font-black text-gray-200">04</span>
              <div className="w-12 h-12 rounded-2xl bg-[#1A1F36] text-[#C5A55A] flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold font-serif uppercase text-[#1A1F36]">QC & Velvet Presentation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every completed piece undergoes stringent white-glove quality control before packaging inside custom plush velvet presentation enclosures.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION CONSULTATION */}
      <section className="py-20 bg-[#1A1F36] text-white px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black font-serif uppercase text-white tracking-tight">
            Ready to Commission Your Custom Awards?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">
            Experience factory-direct precision and personalized consultations without intermediary retail markups.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/inquiry">
              <Button className="h-14 px-8 bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase text-xs rounded-xl shadow-[0_0_30px_rgba(197,165,90,0.4)]">
                Start Quotation Basket
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="h-14 px-8 bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold uppercase text-xs rounded-xl">
                Contact Executive Workshop
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
