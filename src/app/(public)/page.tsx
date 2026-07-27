import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublicProducts, getPublicCategories, getPublicSettingsMap } from '@/lib/data/public-catalog';
import { ProductCard } from '@/components/public/product-card';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Zap, Gem, Star, ChevronRight } from 'lucide-react';

export const revalidate = 60; // SSR refresh interval

export default async function HomePage() {
  const [featuredRes, categories, settings] = await Promise.all([
    getPublicProducts({ isFeatured: true, limit: 4 }),
    getPublicCategories(),
    getPublicSettingsMap(),
  ]);

  // Fallback to latest products if no specific items marked as featured yet
  const featuredProducts = featuredRes.products.length > 0 ? featuredRes.products : (await getPublicProducts({ limit: 4 })).products;
  const siteName = settings?.site_name || 'Aryan Trophy World';

  // Category placeholder imagery with upscale award motifs
  const categoryImages: Record<string, string> = {
    sports: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80',
    academic: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
    corporate: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    crystal: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    medals: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80',
    plaques: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&auto=format&fit=crop&q=80',
  };

  return (
    <div className="w-full flex flex-col overflow-x-hidden bg-white">
      
      {/* 1. HERO SHOWROOM SECTION (Navy & Championship Gold) */}
      <section className="relative bg-[#1A1F36] text-white overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-[#C5A55A]/30">
        {/* Luxury Background Glows */}
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-[#C5A55A]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#C5A55A]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Content Area */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2.5 bg-white/10 border border-[#C5A55A]/40 text-[#C5A55A] text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
              <Sparkles className="w-4 h-4 text-[#C5A55A] animate-pulse" />
              <span>The Premier Trophy & Award Atelier</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-serif text-white uppercase leading-[1.08]">
              Award Excellence with <span className="text-[#C5A55A]">Premium Trophies</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 font-sans leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Handcrafted monuments of victory, academic prestige, and corporate distinction. Engineered with grade-A metals and Italian crystal. Explore our wholesale catalog and request tailored quotes.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/catalog" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-14 px-8 bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase text-sm rounded-xl shadow-[0_0_25px_rgba(197,165,90,0.4)] flex items-center justify-center space-x-2.5 group">
                  <Trophy className="w-5 h-5 stroke-[2.5]" />
                  <span>Explore Catalog Showroom</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[3]" />
                </Button>
              </Link>
              <Link href="/inquiry" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-14 px-8 bg-white/5 hover:bg-white/10 text-white border-white/30 hover:border-[#C5A55A] font-extrabold uppercase text-sm rounded-xl transition-all flex items-center justify-center space-x-2">
                  <Award className="w-5 h-5 text-[#C5A55A]" />
                  <span>Wholesale Inquiry</span>
                </Button>
              </Link>
            </div>

            {/* Trust Ticker */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#C5A55A] font-serif">15+</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Years Mastery</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#C5A55A] font-serif">5,000+</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Corporate Awards</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#C5A55A] font-serif">100%</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Custom Engraved</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Monument Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none aspect-[4/5] rounded-3xl overflow-hidden border-2 border-[#C5A55A]/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-gradient-to-tr from-black via-gray-900 to-[#1A1F36]">
              <Image
                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1000&auto=format&fit=crop&q=80"
                alt="Championship Gold Trophy Monument"
                fill
                priority
                className="object-cover object-center transform hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F36] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/60 backdrop-blur-md rounded-2xl border border-[#C5A55A]/40">
                <div className="flex items-center space-x-2 text-[#C5A55A] text-xs font-extrabold uppercase mb-1">
                  <Gem className="w-4 h-4" />
                  <span>Executive Crystal Series</span>
                </div>
                <h3 className="text-xl font-bold font-serif text-white">The Royal Heritage Cup</h3>
                <p className="text-xs text-gray-300 mt-1">Available in sizes up to 3.5 ft with custom metal plating & teakwood base.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. AWARD CATEGORY SHOWCASE (6 Category Cards) */}
      <section className="py-20 bg-gray-50/70 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#C5A55A] bg-[#1A1F36] px-3 py-1 rounded-full">
                Classifications
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-serif text-[#1A1F36] mt-3 uppercase tracking-tight">
                Explore Award Categories
              </h2>
              <p className="text-sm text-gray-600 max-w-xl mt-1">
                From sports tournaments to milestone business achievements, select a specialized gallery to view tailored designs.
              </p>
            </div>
            <Link href="/catalog">
              <Button variant="outline" className="h-11 px-5 border-[#1A1F36] text-[#1A1F36] hover:bg-[#1A1F36] hover:text-[#C5A55A] font-bold uppercase text-xs rounded-xl flex items-center space-x-2">
                <span>View Full Showroom</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.slice(0, 6).map((cat) => {
              const bgImg = categoryImages[cat.slug] || categoryImages.sports;
              return (
                <Link
                  key={cat.id}
                  href={`/catalog?categorySlug=${cat.slug}`}
                  className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-500 bg-gray-900"
                >
                  <Image
                    src={bgImg}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-75 group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F36] via-[#1A1F36]/30 to-transparent" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-white z-10">
                    <div className="w-10 h-10 rounded-xl bg-[#C5A55A] text-[#090909] flex items-center justify-center font-black mb-3 shadow-md group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <h3 className="text-2xl font-black font-serif uppercase tracking-tight group-hover:text-[#C5A55A] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-300 line-clamp-2 mt-1 pr-6">
                      {cat.description || `Explore our tailored ${cat.name} trophies, medals, and recognition plaques.`}
                    </p>
                    <div className="pt-3 flex items-center text-xs font-extrabold text-[#C5A55A] uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                      <span>Explore {cat.name} Gallery</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[3]" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED TROPHIES & MEDALS */}
      <section className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#C5A55A] bg-[#1A1F36] px-3 py-1 rounded-full">
              Executive Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-[#1A1F36] uppercase tracking-tight">
              Featured Championship Awards
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Curated masterworks engineered with flawless weight balance and precision laser detailing. Click to view custom sizing tiers & wholesale pricing matrices.
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500 font-mono text-sm">
              Showroom inventory currently initializing. Please inspect catalog repository.
            </div>
          )}

          <div className="pt-6 text-center">
            <Link href="/catalog">
              <Button className="h-13 px-10 bg-[#1A1F36] hover:bg-[#C5A55A] text-white hover:text-[#090909] font-black uppercase text-xs rounded-xl shadow-lg transition-all duration-300 tracking-wider">
                <span>View All Showroom Products ({featuredRes.pagination?.total || 'Catalog'})</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US (Craftsmanship Heritage Pillars) */}
      <section className="py-20 bg-[#1A1F36] text-white px-4 sm:px-6 lg:px-8 border-y border-[#C5A55A]/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black font-serif uppercase tracking-tight text-white">
              Why Corporate Leaders Choose <span className="text-[#C5A55A]">Aryan Trophy World</span>
            </h2>
            <p className="text-xs text-gray-300 uppercase font-semibold tracking-widest">
              Unrivaled Quality Assurance & Direct Executive Wholesale Supply
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C5A55A] transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/50 flex items-center justify-center text-[#C5A55A] font-black mb-2">
                <Gem className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-serif uppercase text-white">Flawless Materials</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                We utilize high-density zinc alloy, optical grade-A Italian crystal, and sustainably sourced teakwood bases that never tarnish.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C5A55A] transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/50 flex items-center justify-center text-[#C5A55A] font-black mb-2">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-serif uppercase text-white">Laser Customization</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Complimentary UV printing, deep metallic engraving, and acrylic logo embedding executed within our Mumbai studio with zero blur.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C5A55A] transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/50 flex items-center justify-center text-[#C5A55A] font-black mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-serif uppercase text-white">2D Wholesale Grid</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                No hidden charges. Our transparent 2D pricing matrices let you compare custom dimensions against wholesale quantity thresholds instantly.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C5A55A] transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/50 flex items-center justify-center text-[#C5A55A] font-black mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-serif uppercase text-white">Zero Middlemen</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Deal directly with executive management. Submit multi-item quote baskets online for prompt phone or email consultation and dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CONSULTATION CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto rounded-3xl bg-[#1A1F36] text-white border-2 border-[#C5A55A]/40 p-10 sm:p-14 shadow-2xl relative overflow-hidden text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-black uppercase tracking-widest text-[#090909] bg-[#C5A55A] px-3 py-1 rounded-md">
              Custom Orders & Tournaments
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-serif text-white uppercase tracking-tight">
              Need Custom Corporate or Tournament Solutions?
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Our engineering team designs bespoke trophies from your sketch or corporate logo. Speak with our studio executive for immediate quotations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-shrink-0">
            <Link href="/inquiry">
              <Button className="w-full sm:w-auto h-14 px-8 bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase text-xs rounded-xl shadow-[0_0_25px_rgba(197,165,90,0.4)] flex items-center justify-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Submit Inquiry Basket</span>
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full sm:w-auto h-14 px-8 bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold uppercase text-xs rounded-xl transition-all">
                <span>Contact Workshop</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}
