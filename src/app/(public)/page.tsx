'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductCard, ProductCardProps } from '@/components/public/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trophy,
  Search,
  ArrowRight,
  Sparkles,
  Award,
  ShieldCheck,
  Truck,
  CheckCircle2,
  ChevronRight,
  Building2,
  Medal,
  Star
} from 'lucide-react';

export default function PublicHomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/v1/products?featured=true&limit=8', { cache: 'no-store' }).then((r) => r.json()),
          fetch('/api/v1/categories?limit=6', { cache: 'no-store' }).then((r) => r.json()),
        ]);

        if (prodRes.success && prodRes.data) {
          const items = prodRes.data.items || prodRes.data || [];
          setFeaturedProducts(Array.isArray(items) ? items : []);
        }

        if (catRes.success && catRes.data) {
          const catItems = catRes.data.items || catRes.data || [];
          setCategories(Array.isArray(catItems) ? catItems : []);
        }
      } catch {
        // Fallback gracefully if API is warming up
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/catalog');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative bg-[#1A1F36] text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b-4 border-[#C5A55A]">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A55A]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-[#C5A55A]/10 border border-[#C5A55A]/40 text-[#DFCA85] text-xs font-extrabold uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#C5A55A]" />
            <span>Prestige Awards & Wholesale Showroom • Mumbai</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif text-white uppercase tracking-tight leading-tight">
            Award Excellence With <br className="hidden sm:inline" />
            <span className="text-[#C5A55A]">Premium Customized Trophies</span>
          </h1>

          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Discover optical crystal awards, championship sports cups, academic honor medals, and laser-engraved corporate shields crafted for high-prestige ceremonies.
          </p>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by trophy title, SKU, crystal, wooden plaque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 bg-white text-[#0F172A] placeholder:text-gray-400 font-medium text-sm h-14 rounded-2xl border-2 border-transparent focus:border-[#C5A55A] shadow-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto h-14 px-8 bg-[#C5A55A] hover:bg-[#d5b568] text-[#0F1322] font-black uppercase tracking-wider text-xs rounded-2xl shadow-[0_0_25px_rgba(197,165,90,0.4)] shrink-0 flex items-center justify-center space-x-2"
            >
              <span>Search Showroom</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Button>
          </form>

          {/* Quick Keywords */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-gray-400 font-mono">
            <span className="font-semibold text-gray-500">Popular Queries:</span>
            {['Crystal Award', 'Cricket Trophy', 'Corporate Shield', 'Metal Medal', 'Acrylic Plaque'].map((kw) => (
              <Link
                key={kw}
                href={`/catalog?search=${encodeURIComponent(kw)}`}
                className="bg-gray-800/80 hover:bg-[#C5A55A] hover:text-[#0F1322] px-3 py-1 rounded-lg text-gray-300 transition-colors"
              >
                {kw}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Category Cards Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-[#C5A55A] tracking-widest block font-mono">
              Classifications
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#1A1F36] uppercase tracking-tight">
              Explore Award Categories
            </h2>
          </div>
          <Link href="/catalog" className="text-xs font-bold text-[#1A1F36] hover:text-[#C5A55A] uppercase tracking-wider flex items-center space-x-1">
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {(categories.length > 0 ? categories : [
            { name: 'Sports Trophies & Tournament Cups', slug: 'sports', icon: Trophy, desc: 'Cricket, Football, Golf, Tennis & Championship Cups' },
            { name: 'Corporate Optical Crystal Awards', slug: 'corporate', icon: Building2, desc: 'Laser engraved optical glass, Star performance trophies' },
            { name: 'Academic & Honor Medals', slug: 'academic', icon: Medal, desc: 'Gold, Silver & Bronze Die-struck Custom Medals' },
          ]).map((cat, idx) => (
            <Link
              key={cat.id || idx}
              href={`/catalog?category=${cat.slug || 'all'}`}
              className="group bg-[#F8FAFC] border border-gray-200 hover:border-[#C5A55A] p-8 rounded-2xl transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1A1F36] text-[#C5A55A] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                  <Trophy className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-serif text-[#1A1F36] group-hover:text-[#C5A55A] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {cat.description || cat.desc || 'Premium customized award creations for ceremonies.'}
                  </p>
                </div>
              </div>

              <div className="pt-6 flex items-center text-xs font-extrabold uppercase text-[#C5A55A] group-hover:translate-x-1 transition-transform">
                <span>Browse Catalog</span>
                <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Showroom Trophies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-[#C5A55A] tracking-widest block font-mono">
              Handcrafted Collection
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#1A1F36] uppercase tracking-tight">
              Featured Showroom Trophies
            </h2>
          </div>
          <Link href="/catalog" className="text-xs font-bold text-[#1A1F36] hover:text-[#C5A55A] uppercase tracking-wider flex items-center space-x-1">
            <span>Explore Full Showroom</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-3 bg-white border border-gray-200 p-4 rounded-2xl">
                <Skeleton className="h-48 w-full rounded-xl bg-gray-200" />
                <Skeleton className="h-4 w-3/4 bg-gray-200" />
                <Skeleton className="h-4 w-1/2 bg-gray-200" />
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="bg-[#F8FAFC] border border-dashed border-gray-300 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-2 opacity-50" />
            <h3 className="text-base font-bold text-[#1A1F36]">Showroom Catalog Updating</h3>
            <p className="text-xs text-gray-500 mt-1">Browse our full catalog to discover all custom trophy items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Craftsmanship & Quality Story */}
      <section className="bg-[#F8FAFC] border-y border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase text-[#C5A55A] tracking-widest font-mono">
              Uncompromising Quality
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A1F36] uppercase tracking-tight">
              Why Corporate Leaders Choose Aryan Trophy World
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Sub-Micron Laser Engraving', desc: 'Precision CNC etching and 3D sub-surface laser engraving inside pure optical crystal blocks.', icon: Sparkles },
              { title: 'Italian Marble & Optical Glass', desc: 'Sourced from high-density quarries and K9 optical glass foundries for maximum brilliance.', icon: Award },
              { title: 'Express Bulk Production', desc: 'In-house manufacturing facility capable of delivering 1,000+ custom awards within tight event deadlines.', icon: ShieldCheck },
              { title: 'Pan-India Insured Logistics', desc: 'Custom shockproof wooden crate packaging ensuring zero damage during express transit.', icon: Truck },
            ].map((pillar, idx) => (
              <div key={idx} className="bg-white border border-gray-200 p-6 rounded-2xl space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-[#1A1F36] text-[#C5A55A] flex items-center justify-center">
                  <pillar.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold font-serif text-[#1A1F36]">{pillar.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-sans">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Wholesale Quote CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1A1F36] text-white border-2 border-[#C5A55A] rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-2xl relative z-10">
            <span className="text-xs font-black uppercase text-[#C5A55A] tracking-widest font-mono">
              Wholesale Quotations
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif text-white uppercase tracking-tight">
              Organizing an Upcoming Sports Event or Annual Gala?
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
              Add multiple items to your Inquiry Basket and receive a comprehensive direct wholesale estimate with tiered quantity discounts within 2 hours.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link href="/inquiry">
              <Button
                size="lg"
                className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#0F1322] font-black uppercase tracking-wider text-xs h-14 px-8 rounded-2xl shadow-[0_0_30px_rgba(197,165,90,0.4)] flex items-center space-x-2"
              >
                <span>Request Custom Quote</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
