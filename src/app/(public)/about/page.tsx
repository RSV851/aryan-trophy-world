import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { getPublicOwnerProfile, getPublicSettingsMap } from '@/lib/data/public-catalog';
import { Trophy, ShieldCheck, Award, Gem, CheckCircle2, Sparkles, ArrowRight, Layers, Hammer, Compass, Package } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Our Craftsmanship & Heritage | Aryan Trophy World',
  description: 'Learn about Aryan Trophy World’s 15+ years of excellence in high-precision corporate awards, tournament medals, and optical crystal monuments.',
};

export const revalidate = 60; // SSR refresh interval

export default async function AboutPage() {
  const [profile, settings] = await Promise.all([
    getPublicOwnerProfile(),
    getPublicSettingsMap(),
  ]);

  const brandName = settings?.site_name || 'Aryan Trophy World';
  const bio = profile?.bio || 'Aryan Trophy World stands at the forefront of monumental award engineering. Born out of a passion for celebrating human achievement, our atelier blends traditional metallurgy with state-of-the-art Italian diamond laser technology.';

  const manufacturingSteps = [
    {
      num: '01',
      title: 'Architectural CAD & 3D Prototyping',
      desc: 'Every custom trophy commission begins with sub-millimeter vector design and 3D architectural rendering to verify structural balance and proportion.',
      icon: Compass,
    },
    {
      num: '02',
      title: 'Precision Metallurgy & Crystal Cutting',
      desc: 'High-purity K9 optical crystal blocks and aerospace-grade aluminum alloys are shaped using multi-axis CNC milling and waterjet cutters.',
      icon: Hammer,
    },
    {
      num: '03',
      title: 'Diamond Laser Etching & Electroplating',
      desc: 'Corporate insignia, recipient names, and tournament graphics are etched directly into the substrate using high-frequency diamond lasers and 24K gold plating.',
      icon: Sparkles,
    },
    {
      num: '04',
      title: 'QC Auditing & Velvet Packaging',
      desc: 'Each completed piece undergoes rigorous weight balance auditing and hand polishing before being secured in custom velvet presentation cases.',
      icon: Package,
    },
  ];

  const craftsmanshipPillars = [
    {
      icon: Gem,
      title: 'Optical K9 Crystal Purity',
      desc: 'We strictly utilize ultra-clear optical grade K9 crystal with zero internal bubbles, providing prismatic light dispersion across every hand-bevelled edge.',
    },
    {
      icon: Trophy,
      title: 'Heavyweight Solid Balance',
      desc: 'Our awards are built on substantial Belgian black marble, solid teak, or kilned rosewood bases, delivering a tactile sensation of weight and prestige.',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Composite Plastics',
      desc: 'We never compromise on materials. Every component is forged from solid metal, natural wood, or optical crystal to guarantee permanent durability.',
    },
    {
      icon: Award,
      title: 'Direct Wholesale Pricing Matrix',
      desc: 'Our direct manufacturing facility provides transparent tier pricing matrix brackets for national sports leagues, corporate summits, and universities.',
    },
  ];

  const storyHeadline = settings?.about_story_headline || 'Where Precision Metallurgy Meets Artistry';
  const storyText = settings?.about_story_text || bio;
  const storyImage = settings?.about_story_image || '';
  const yearsBadge = settings?.about_years_badge || '15+ Years';
  const yearsSubtext = settings?.about_years_subtext || 'Heritage of In-House Precision Manufacturing';

  return (
    <div className="min-h-screen bg-background text-foreground pt-28 sm:pt-36 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PAGE HEADER */}
        <header className="text-center mb-24 space-y-6 relative">
          <div className="inline-flex items-center space-x-2 bg-card px-4 py-1.5 rounded-full border border-border shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs uppercase font-mono tracking-[0.25em] text-primary font-bold">
              The Art of Recognition & Heritage
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display text-foreground tracking-tight font-normal max-w-4xl mx-auto leading-[1.15]">
            Crafting Monuments of <span className="text-primary font-light italic">Distinction</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Every victory deserves more than a standard placeholder. At {brandName}, we engineer prestige physical symbols that capture milestone human achievements, corporate summits, and championship victories for generations.
          </p>
        </header>

        {/* HERITAGE STORY & PROPRIETOR SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-32">
          
          {/* Left Collage Showcase (6 Cols) */}
          <div className="lg:col-span-6 relative">
            <SmartImage
              src={storyImage}
              alt="Story Banner"
              className="relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-border shadow-lg bg-muted group"
              imgClassName="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              fallbackIcon={<Trophy className="w-20 h-20 text-primary/40 stroke-[1.5]" />}
            />

            {/* Floating Stat Card */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 w-64 sm:w-72 p-6 bg-card/95 backdrop-blur-2xl rounded-2xl border border-primary/40 shadow-2xl space-y-2 hidden sm:block">
              <div className="flex items-center space-x-2 text-primary">
                <Trophy className="w-5 h-5" />
                <span className="text-2xl font-black font-mono">{yearsBadge}</span>
              </div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block font-sans">
                {yearsSubtext}
              </span>
            </div>
          </div>

          {/* Right Text Description (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20 inline-block">
              Our Story & Philosophy
            </span>
            
            <h2 className="text-3xl sm:text-5xl font-display text-foreground font-light tracking-wide leading-tight">
              {storyHeadline}
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
              {storyText}
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-muted-foreground">
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-card border border-border shadow-sm">
                <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Zero Composite Plastics</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-card border border-border shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Heavyweight Solid Balance</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-card border border-border shadow-sm">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Flawless K9 Optical Crystal</span>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-card border border-border shadow-sm">
                <Award className="w-5 h-5 text-primary flex-shrink-0" />
                <span>Direct Workshop Tier Pricing</span>
              </div>
            </div>
          </div>

        </section>

        {/* 4-STAGE INTERNAL FACTORY PROTOCOL */}
        <section className="mb-32 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-primary font-mono">Uncompromising Quality</span>
            <h2 className="text-3xl sm:text-5xl font-display text-foreground tracking-tight font-light">
              Our 4-Stage Manufacturing Protocol
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {manufacturingSteps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-card backdrop-blur-2xl border border-border hover:border-primary/60 rounded-2xl p-7 flex flex-col justify-between space-y-6 transition-all duration-300 group hover:-translate-y-1.5 shadow-sm hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/30">
                        STAGE {step.num}
                      </span>
                      <IconComp className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-lg font-display text-foreground font-normal group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed font-light">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CRAFTSMANSHIP PILLARS GRID */}
        <section className="mb-32 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-primary font-mono">Standards of Excellence</span>
            <h2 className="text-3xl sm:text-5xl font-display text-foreground tracking-tight font-light">
              Why Prestigious Brands Choose {brandName}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {craftsmanshipPillars.map((pillar, idx) => {
              const IconComponent = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-card backdrop-blur-2xl border border-border hover:border-primary/60 rounded-2xl p-8 flex items-start space-x-6 transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-7 h-7 stroke-[2]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display text-foreground font-normal group-hover:text-primary transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CALL TO ACTION BOX */}
        <div className="bg-card border-2 border-primary/40 rounded-3xl p-10 sm:p-16 text-center space-y-8 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-primary">
              Elevate Your Next Recognition Event
            </span>
            <h2 className="text-3xl sm:text-5xl font-display text-foreground font-light tracking-tight">
              Ready to Commission a Masterpiece?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
              Explore our full showroom catalog or connect with our executive consultants to receive custom vector mockups and bulk wholesale matrix quotations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <Link href="/catalog" className="btn-group-1 px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:scale-105 transition-all flex items-center justify-center space-x-2 w-full sm:w-auto">
              <span>Explore Showroom Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="btn-group-2 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center w-full sm:w-auto">
              <span>Contact Concierge & Workshop</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
