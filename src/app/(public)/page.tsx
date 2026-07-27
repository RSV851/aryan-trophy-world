import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublicProducts, getPublicOwnerProfile, getPublicSettingsMap } from '@/lib/data/public-catalog';

export const revalidate = 60; // SSR refresh interval

export default async function HomePage() {
  const [featuredProducts, profile, settings] = await Promise.all([
    getPublicProducts({ isFeatured: true, limit: 8 }),
    getPublicOwnerProfile(),
    getPublicSettingsMap(),
  ]);

  const phone = profile?.phone || settings?.contact_phone || '+91 98765 43210';

  // 8 Bestsellers using the user's uploaded local trophy assets in /images/trophies/
  const defaultBestsellers = [
    {
      id: 'default-1',
      slug: 'champion-gold-cup',
      name: 'Champion Gold Cup',
      sku: 'AT-C01',
      priceRange: '₹18,499 ($249)',
      categoryName: 'Polished Metal & Mahogany',
      imageUrl: '/images/trophies/gold-cup.jpg',
    },
    {
      id: 'default-2',
      slug: 'golden-foot-award',
      name: 'Golden Foot Sports Award',
      sku: 'AT-S02',
      priceRange: '₹9,499 ($125)',
      categoryName: 'Professional Sports Series',
      imageUrl: '/images/trophies/golden-foot.jpg',
    },
    {
      id: 'default-3',
      slug: 'crystal-pinnacle',
      name: 'Crystal Pinnacle Star',
      sku: 'AT-CP03',
      priceRange: '₹22,999 ($310)',
      categoryName: 'Optical K9 Crystal',
      imageUrl: '/images/trophies/crystal-star.jpg',
    },
    {
      id: 'default-4',
      slug: 'radiant-shield',
      name: 'Radiant Victory Shield',
      sku: 'AT-RS04',
      priceRange: '₹14,299 ($189)',
      categoryName: 'Traditional Team Honors',
      imageUrl: '/images/trophies/victory-shield.jpg',
    },
    {
      id: 'default-5',
      slug: 'gold-star-trophy',
      name: 'Leadership Gold Star Trophy',
      sku: 'AT-GS05',
      priceRange: '₹12,999 ($165)',
      categoryName: 'Executive Excellence',
      imageUrl: '/images/trophies/gold-star.jpg',
    },
    {
      id: 'default-6',
      slug: 'olympic-victory-medal',
      name: 'Olympic Championship Medal',
      sku: 'AT-M06',
      priceRange: '₹4,999 ($65)',
      categoryName: 'Solid Brass & Cast Gold',
      imageUrl: '/images/trophies/victory-medal.jpg',
    },
    {
      id: 'default-7',
      slug: 'corporate-glass-plaque',
      name: 'Corporate Glass Plaque',
      sku: 'AT-GP07',
      priceRange: '₹16,499 ($215)',
      categoryName: 'Laser-Engraved Crystal',
      imageUrl: '/images/trophies/glass-plaque.jpg',
    },
    {
      id: 'default-8',
      slug: 'mahogany-honor-wooden',
      name: 'Mahogany Honor Plaque',
      sku: 'AT-MP08',
      priceRange: '₹11,499 ($149)',
      categoryName: 'Rosewood & Brass Casing',
      imageUrl: '/images/trophies/mahogany-plaque.jpg',
    },
  ];

  const dbProducts = (featuredProducts?.products || []).map((prod, index) => {
    // If DB product uses an external URL, map it to local user trophy image
    const fallbackLocalImages = [
      '/images/trophies/gold-cup.jpg',
      '/images/trophies/golden-foot.jpg',
      '/images/trophies/crystal-star.jpg',
      '/images/trophies/victory-shield.jpg',
      '/images/trophies/gold-star.jpg',
      '/images/trophies/victory-medal.jpg',
      '/images/trophies/glass-plaque.jpg',
      '/images/trophies/mahogany-plaque.jpg',
    ];
    const originalImg = prod.imageUrl || prod.images?.[0]?.imageUrl;
    const isExternal = !originalImg || originalImg.startsWith('http');
    return {
      ...prod,
      imageUrl: isExternal ? fallbackLocalImages[index % fallbackLocalImages.length] : originalImg,
    };
  });

  const displayProducts = dbProducts.length >= 8 
    ? dbProducts.slice(0, 8) 
    : [...dbProducts, ...defaultBestsellers.slice(dbProducts.length, 8)];

  return (
    <div className="w-full bg-black text-[#e5e2e1]">
      
      {/* BEGIN: HeroSection with Local Banner Image */}
      <section className="relative h-[55vh] sm:h-[60vh] md:h-[65vh] flex items-center overflow-hidden py-6 md:py-0" data-purpose="hero-banner">
        <div className="absolute inset-0 z-0">
          <Image
            alt="Real Gold Championship Trophy"
            src="/images/trophies/hero-banner.jpg"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/95" />
        </div>
        
        <div className="container-custom relative z-10 text-center w-full">
          <p className="text-[#f2ca50] font-sans font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[10px] sm:text-xs mb-3 sm:mb-4">
            Exclusive Engraving & Bespoke Crafting
          </p>
          
          {/* Responsive Banner Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-light mb-4 md:mb-6 leading-[1.15] text-white tracking-tight max-w-4xl mx-auto">
            Every trophy tells a <br className="hidden sm:inline" />
            <span className="italic font-normal text-[#f2ca50]">story worth engraving.</span>
          </h1>
          
          <p className="text-xs sm:text-sm md:text-base font-sans text-white/70 max-w-xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
            Complimentary custom engraving on every award. Handcrafted for tournaments, corporate honors, and champions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <Link href="/catalog" className="btn-primary w-full sm:w-auto px-8 sm:px-10 py-3 font-semibold rounded-full uppercase tracking-widest text-[10px] sm:text-[11px] text-center">
              Browse Collection
            </Link>
            <Link href="/contact" className="btn-secondary-glass w-full sm:w-auto px-8 sm:px-10 py-3 font-semibold rounded-full uppercase tracking-widest text-[10px] sm:text-[11px] text-center">
              Send Inquiry
            </Link>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[9px] sm:text-[10px] text-white/50 font-semibold uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1.5"><span className="text-[#f2ca50]">★</span> 200+ Reviews</span>
            <span className="flex items-center gap-1.5"><span className="text-[#f2ca50]">★</span> 15+ Years Exp</span>
            <span className="flex items-center gap-1.5"><span className="text-[#f2ca50]">★</span> 2000+ Projects</span>
          </div>
        </div>

        {/* Scroll Down Hint Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 text-white/50 text-[9px] uppercase tracking-[0.2em] pointer-events-none">
          <span>Scroll to explore</span>
          <span className="material-symbols-outlined text-base animate-bounce text-[#f2ca50]">keyboard_arrow_down</span>
        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: OccasionCategories */}
      <section className="section-padding bg-black" data-purpose="categories-grid">
        <div className="container-custom">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[#f2ca50] uppercase tracking-[0.2em] text-[10px] font-semibold mb-3">Our Collections</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-white">A trophy for every occasion.</h2>
            <p className="text-white/50 mt-4 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
              Explore our curated ranges meticulously designed for sports tournaments, corporate galas, and scholastic honors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Category Card 1 */}
            <Link href="/catalog?category=Sports" className="premium-glass p-8 sm:p-10 rounded-2xl group cursor-pointer transition-all duration-500 hover:-translate-y-1 block">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#f2ca50]/10 border border-[#f2ca50]/20 rounded-xl flex items-center justify-center mb-6 sm:mb-8 text-[#f2ca50] group-hover:bg-[#2563eb] group-hover:text-white group-hover:border-[#2563eb] transition-all">
                <span className="material-symbols-outlined text-2xl">emoji_events</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-3">Sports Awards</h3>
              <p className="text-white/40 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">Cups, tournament medals & champion trophies designed for athletes.</p>
              <span className="text-xs font-semibold text-[#f2ca50] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>

            {/* Category Card 2 */}
            <Link href="/catalog?category=Corporate" className="premium-glass p-8 sm:p-10 rounded-2xl group cursor-pointer transition-all duration-500 hover:-translate-y-1 block">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#f2ca50]/10 border border-[#f2ca50]/20 rounded-xl flex items-center justify-center mb-6 sm:mb-8 text-[#f2ca50] group-hover:bg-[#2563eb] group-hover:text-white group-hover:border-[#2563eb] transition-all">
                <span className="material-symbols-outlined text-2xl">business_center</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-3">Corporate Awards</h3>
              <p className="text-white/40 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">Crystal plaques & recognition gifts for enterprise excellence.</p>
              <span className="text-xs font-semibold text-[#f2ca50] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>

            {/* Category Card 3 */}
            <Link href="/catalog?category=Academic" className="premium-glass p-8 sm:p-10 rounded-2xl group cursor-pointer transition-all duration-500 hover:-translate-y-1 block sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#f2ca50]/10 border border-[#f2ca50]/20 rounded-xl flex items-center justify-center mb-6 sm:mb-8 text-[#f2ca50] group-hover:bg-[#2563eb] group-hover:text-white group-hover:border-[#2563eb] transition-all">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-light text-white mb-3">School Awards</h3>
              <p className="text-white/40 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">Honoring academic excellence with custom laser engravings.</p>
              <span className="text-xs font-semibold text-[#f2ca50] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>

          </div>
        </div>
      </section>
      {/* END: OccasionCategories */}

      {/* BEGIN: BestsellersProductGrid (8 Cards) */}
      <section className="section-padding bg-[#0a0a0a]" data-purpose="product-grid">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
            <div>
              <p className="text-[#f2ca50] uppercase tracking-[0.2em] text-[10px] font-semibold mb-3">Curated Selection</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-white">Bestsellers this season.</h2>
            </div>
            <Link href="/catalog" className="text-[#2563eb] text-[11px] font-bold uppercase tracking-widest border-b border-[#2563eb]/30 hover:border-[#2563eb] transition-all pb-1 self-start sm:self-auto">
              View All Products ({displayProducts.length})
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {displayProducts.map((prod: any) => {
              const img = prod.imageUrl || '/images/trophies/gold-cup.jpg';
              const cat = prod.categoryName || prod.category?.name || 'Prestige Collection';
              const price = prod.priceRange || (prod.pricingMatrix?.[0]?.pricePerPiece ? `₹${prod.pricingMatrix[0].pricePerPiece}` : '$249');
              
              return (
                <div key={prod.id} className="premium-glass rounded-2xl overflow-hidden group flex flex-col transition-all duration-300 hover:-translate-y-1">
                  <Link href={`/products/${prod.slug || prod.id}`} className="relative overflow-hidden aspect-[4/5] block bg-white/5">
                    <span className="absolute top-4 left-4 z-10 bg-[#2563eb]/90 backdrop-blur-md text-white text-[9px] px-3 py-1 rounded-full uppercase font-bold tracking-widest">
                      In Stock
                    </span>
                    <Image
                      alt={prod.name}
                      src={img}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${prod.slug || prod.id}`}>
                        <h3 className="text-lg font-display text-white mb-2 hover:text-[#f2ca50] transition-colors">{prod.name}</h3>
                      </Link>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-6">{cat}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-white font-semibold text-base">{price}</span>
                      <Link href={`/products/${prod.slug || prod.id}`} className="text-[#f2ca50] text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                        Inquiry
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* END: BestsellersProductGrid */}

      {/* BEGIN: CuratedRanges (Using User's Local Trophy Images) */}
      <section className="section-padding bg-black" data-purpose="curated-ranges">
        <div className="container-custom">
          <div className="mb-12 sm:mb-16">
            <p className="text-[#f2ca50] uppercase tracking-[0.2em] text-[10px] font-semibold mb-3">Shop by Category</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-white">Curated ranges.</h2>
          </div>
          
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Link href="/catalog?category=Sports" className="relative h-64 sm:h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Sports Tournament Trophy"
                src="/images/trophies/sports-trophy.jpg"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-lg sm:text-xl font-display text-white">Sports Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Cups, Medals & Tournaments</p>
              </div>
            </Link>

            <Link href="/catalog?category=Corporate" className="relative h-64 sm:h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Corporate Crystal Award"
                src="/images/trophies/corporate-award.jpg"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-lg sm:text-xl font-display text-white">Corporate Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Crystal & Executive Recognition</p>
              </div>
            </Link>

            <Link href="/catalog?category=Academic" className="relative h-64 sm:h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Academic Winner Medal"
                src="/images/trophies/academic-award.jpg"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-lg sm:text-xl font-display text-white">Academic Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Schools & Scholastic Events</p>
              </div>
            </Link>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/catalog?material=Crystal" className="relative h-64 sm:h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Optical Crystal Glass Award"
                src="/images/trophies/crystal-award.jpg"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-lg sm:text-xl font-display text-white">Crystal Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Premium Optical Glass</p>
              </div>
            </Link>

            <Link href="/catalog?material=Wooden" className="relative h-64 sm:h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Wooden Trophy Plaque"
                src="/images/trophies/wooden-award.jpg"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-lg sm:text-xl font-display text-white">Wooden Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Rosewood & Mahogany</p>
              </div>
            </Link>

            <Link href="/catalog?material=Metal" className="relative h-64 sm:h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Metal Winner Medals"
                src="/images/trophies/victory-medal.jpg"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-lg sm:text-xl font-display text-white">Metal Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Medals & Custom Castings</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      {/* END: CuratedRanges */}

      {/* BEGIN: FeaturesSection */}
      <section className="section-padding bg-black" data-purpose="features">
        <div className="container-custom">
          <div className="mb-12 sm:mb-16 text-center md:text-left">
            <p className="text-[#f2ca50] uppercase tracking-[0.2em] text-[10px] font-semibold mb-3">Why Choose Atelier</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-white">
              Craft you can trust, timelines <br className="hidden md:block" />you can plan.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            <div className="flex items-start group">
              <div className="mr-6 sm:mr-8 text-[#2563eb] group-hover:text-[#f2ca50] transition-colors duration-500 flex-shrink-0">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">verified</span>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-display text-white mb-2 sm:mb-3 uppercase tracking-wide">Premium Quality</h4>
                <p className="text-white/40 text-xs sm:text-sm leading-relaxed">Hand-selected materials and rigorous quality checks for every piece from our atelier.</p>
              </div>
            </div>

            <div className="flex items-start group">
              <div className="mr-6 sm:mr-8 text-[#2563eb] group-hover:text-[#f2ca50] transition-colors duration-500 flex-shrink-0">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">bolt</span>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-display text-white mb-2 sm:mb-3 uppercase tracking-wide">Fast Delivery</h4>
                <p className="text-white/40 text-xs sm:text-sm leading-relaxed">Enterprise-grade logistics with express shipping options available worldwide.</p>
              </div>
            </div>

            <div className="flex items-start group">
              <div className="mr-6 sm:mr-8 text-[#2563eb] group-hover:text-[#f2ca50] transition-colors duration-500 flex-shrink-0">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">groups</span>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-display text-white mb-2 sm:mb-3 uppercase tracking-wide">Bulk Solutions</h4>
                <p className="text-white/40 text-xs sm:text-sm leading-relaxed">Scalable production systems for corporate events and international tournaments.</p>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* END: FeaturesSection */}

      {/* BEGIN: TestimonialSection */}
      <section className="section-padding bg-[#0a0a0a] text-white" data-purpose="testimonials">
        <div className="container-custom text-center">
          <p className="text-[#f2ca50] uppercase tracking-[0.2em] text-[10px] font-semibold mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-display font-light mb-12 sm:mb-16">Kind words from our clients.</h2>
          <div className="max-w-4xl mx-auto premium-glass p-8 sm:p-12 md:p-16 rounded-3xl relative">
            <span className="absolute top-4 left-6 sm:top-8 sm:left-12 text-6xl sm:text-8xl text-[#f2ca50]/10 font-serif leading-none">“</span>
            <blockquote className="text-lg sm:text-xl md:text-2xl font-display italic leading-relaxed text-white/90 relative z-10 mb-8 sm:mb-10">
              "Atelier Première has been our partner for six seasons. The trophies always arrive on time and the engraving quality is truly world-class. A standard of excellence we rely on."
            </blockquote>
            <div className="flex flex-col items-center">
              <p className="font-bold uppercase tracking-[0.2em] text-[10px] sm:text-[11px] text-[#f2ca50]">Rohan Deshmukh</p>
              <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest mt-1">Sports Director, Pune Cricket League</p>
            </div>
          </div>
        </div>
      </section>
      {/* END: TestimonialSection */}

      {/* BEGIN: CallToActionBanner */}
      <section className="container-custom py-16 sm:py-24" data-purpose="cta-banner">
        <div className="btn-primary rounded-3xl p-8 sm:p-14 md:p-20 text-white relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-light mb-6 sm:mb-8 leading-tight">
              Planning an event? Let's craft <br className="hidden sm:inline" />the perfect award.
            </h2>
            <p className="text-white/80 max-w-xl mb-8 sm:mb-12 text-sm sm:text-base md:text-lg font-sans">
              Send your requirements and our executive team will return a bespoke proposal within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <Link href="/contact" className="bg-white text-[#2563eb] px-8 sm:px-12 py-4 font-bold rounded-full hover:bg-white/90 transition-all uppercase tracking-widest text-xs inline-block text-center w-full sm:w-auto">
                Send Inquiry
              </Link>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/60">Direct Atelier Line</span>
                <span className="text-xl sm:text-2xl font-display font-light">{phone}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: CallToActionBanner */}

    </div>
  );
}
