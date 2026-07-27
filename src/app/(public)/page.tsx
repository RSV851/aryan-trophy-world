import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublicProducts, getPublicOwnerProfile, getPublicSettingsMap } from '@/lib/data/public-catalog';

export const revalidate = 60; // SSR refresh interval

export default async function HomePage() {
  const [featuredProducts, profile, settings] = await Promise.all([
    getPublicProducts({ isFeatured: true, limit: 4 }),
    getPublicOwnerProfile(),
    getPublicSettingsMap(),
  ]);

  const phone = profile?.phone || settings?.contact_phone || '+91 98765 43210';

  // Fallback items if DB doesn't have enough featured products yet
  const displayProducts = featuredProducts.products && featuredProducts.products.length > 0 ? featuredProducts.products.slice(0, 4) : [
    {
      id: '1',
      slug: 'champion-gold-cup',
      name: 'Champion Gold Cup',
      sku: 'AT-C01',
      priceRange: '₹18,499 ($249)',
      categoryName: 'Polished Metal & Mahogany',
      imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      slug: 'golden-foot-award',
      name: 'Golden Foot Award',
      sku: 'AT-S02',
      priceRange: '₹9,499 ($125)',
      categoryName: 'Professional Sports Series',
      imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      slug: 'crystal-pinnacle',
      name: 'Crystal Pinnacle',
      sku: 'AT-CP03',
      priceRange: '₹22,999 ($310)',
      categoryName: 'Premium Optical K9 Crystal',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      slug: 'radiant-shield',
      name: 'Radiant Shield',
      sku: 'AT-RS04',
      priceRange: '₹14,299 ($189)',
      categoryName: 'Traditional Team Honors',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="w-full bg-black text-[#e5e2e1]">
      
      {/* BEGIN: HeroSection */}
      <section className="relative h-[90vh] flex items-center overflow-hidden" data-purpose="hero-banner">
        <div className="absolute inset-0 z-0">
          <Image
            alt="Hero Background"
            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1600&auto=format&fit=crop&q=80"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
        </div>
        
        <div className="container-custom relative z-10 text-center">
          <p className="text-[#f2ca50] font-sans font-semibold uppercase tracking-[0.3em] text-[10px] mb-6">
            Exclusive Engraving
          </p>
          <h1 className="text-5xl md:text-8xl font-display font-light mb-8 leading-tight text-white">
            Every trophy tells a <br />
            <span className="italic">story worth engraving.</span>
          </h1>
          <p className="text-lg font-sans text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Complimentary engraving on every award. Handcrafted for those who demand nothing less than perfection.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/catalog" className="btn-primary px-12 py-4 font-semibold rounded-full uppercase tracking-widest text-[11px] block">
              Browse Collection
            </Link>
            <Link href="/inquiry" className="btn-secondary-glass px-12 py-4 font-semibold rounded-full uppercase tracking-widest text-[11px] block">
              Send Inquiry
            </Link>
          </div>
          <div className="mt-16 flex items-center justify-center space-x-12 text-[10px] text-white/40 font-semibold uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><span className="text-[#f2ca50]">★</span> 200+ Reviews</span>
            <span className="flex items-center gap-2"><span className="text-[#f2ca50]">★</span> 15+ Years Exp</span>
            <span className="flex items-center gap-2"><span className="text-[#f2ca50]">★</span> 2000+ Projects</span>
          </div>
        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: OccasionCategories */}
      <section className="section-padding bg-black" data-purpose="categories-grid">
        <div className="container-custom">
          <div className="text-center mb-20">
            <p className="text-[#f2ca50] uppercase tracking-[0.2em] text-[10px] font-semibold mb-4">Our Collections</p>
            <h2 className="text-4xl md:text-5xl font-display font-light text-white">A trophy for every occasion.</h2>
            <p className="text-white/50 mt-6 max-w-xl mx-auto text-sm leading-relaxed">
              Explore our curated ranges meticulously designed for sports, corporate, and scholastic achievements.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Category Card 1 */}
            <Link href="/catalog?category=Sports" className="premium-glass p-10 rounded-2xl group cursor-pointer transition-all duration-500 hover:-translate-y-1 block">
              <div className="w-14 h-14 bg-[#f2ca50]/10 border border-[#f2ca50]/20 rounded-xl flex items-center justify-center mb-8 text-[#f2ca50] group-hover:bg-[#2563eb] group-hover:text-white group-hover:border-[#2563eb] transition-all">
                <span className="material-symbols-outlined text-2xl">emoji_events</span>
              </div>
              <h3 className="text-2xl font-display font-light text-white mb-4">Sports Awards</h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">Cups, medals & tournament trophies designed for athletes.</p>
              <span className="text-xs font-semibold text-[#f2ca50] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>

            {/* Category Card 2 */}
            <Link href="/catalog?category=Corporate" className="premium-glass p-10 rounded-2xl group cursor-pointer transition-all duration-500 hover:-translate-y-1 block">
              <div className="w-14 h-14 bg-[#f2ca50]/10 border border-[#f2ca50]/20 rounded-xl flex items-center justify-center mb-8 text-[#f2ca50] group-hover:bg-[#2563eb] group-hover:text-white group-hover:border-[#2563eb] transition-all">
                <span className="material-symbols-outlined text-2xl">business_center</span>
              </div>
              <h3 className="text-2xl font-display font-light text-white mb-4">Corporate Awards</h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">Crystal plaques & recognition gifts for enterprise excellence.</p>
              <span className="text-xs font-semibold text-[#f2ca50] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>

            {/* Category Card 3 */}
            <Link href="/catalog?category=Academic" className="premium-glass p-10 rounded-2xl group cursor-pointer transition-all duration-500 hover:-translate-y-1 block">
              <div className="w-14 h-14 bg-[#f2ca50]/10 border border-[#f2ca50]/20 rounded-xl flex items-center justify-center mb-8 text-[#f2ca50] group-hover:bg-[#2563eb] group-hover:text-white group-hover:border-[#2563eb] transition-all">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <h3 className="text-2xl font-display font-light text-white mb-4">School Awards</h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">Honoring academic excellence with custom engravings.</p>
              <span className="text-xs font-semibold text-[#f2ca50] uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>

          </div>
        </div>
      </section>
      {/* END: OccasionCategories */}

      {/* BEGIN: BestsellersProductGrid */}
      <section className="section-padding bg-[#0a0a0a]" data-purpose="product-grid">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-[#f2ca50] uppercase tracking-[0.2em] text-[10px] font-semibold mb-4">Curated Selection</p>
              <h2 className="text-4xl md:text-5xl font-display font-light text-white">Bestsellers this season.</h2>
            </div>
            <Link href="/catalog" className="text-[#2563eb] text-[11px] font-bold uppercase tracking-widest border-b border-[#2563eb]/30 hover:border-[#2563eb] transition-all pb-1 mb-2">
              View All Products
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((prod: any) => {
              const img = prod.imageUrl || prod.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80';
              const cat = prod.categoryName || prod.category?.name || 'Prestige Collection';
              const price = prod.priceRange || prod.pricingMatrix?.[0]?.pricePerPiece ? `₹${prod.pricingMatrix?.[0]?.pricePerPiece}` : '$249';
              
              return (
                <div key={prod.id} className="premium-glass rounded-2xl overflow-hidden group flex flex-col">
                  <Link href={`/products/${prod.slug || prod.id}`} className="relative overflow-hidden aspect-[4/5] block">
                    <span className="absolute top-4 left-4 z-10 bg-[#2563eb]/90 backdrop-blur-md text-white text-[9px] px-3 py-1 rounded-full uppercase font-bold tracking-widest">
                      In Stock
                    </span>
                    <Image
                      alt={prod.name}
                      src={img}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${prod.slug || prod.id}`}>
                        <h3 className="text-xl font-display text-white mb-2 hover:text-[#f2ca50] transition-colors">{prod.name}</h3>
                      </Link>
                      <p className="text-white/40 text-[11px] uppercase tracking-wider mb-6">{cat}</p>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <span className="text-white font-semibold text-lg">{price}</span>
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

      {/* BEGIN: CuratedRanges (Shop by Category) */}
      <section className="section-padding bg-black" data-purpose="curated-ranges">
        <div className="container-custom">
          <div className="mb-16">
            <p className="text-[#f2ca50] uppercase tracking-[0.2em] text-[10px] font-semibold mb-4">Shop by Category</p>
            <h2 className="text-4xl md:text-5xl font-display font-light text-white">Curated ranges.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Row 1 */}
            <Link href="/catalog?category=Sports" className="relative h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Sports Awards"
                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-xl font-display text-white">Sports Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Cups, Medals & Tournament</p>
              </div>
            </Link>

            <Link href="/catalog?category=Corporate" className="relative h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Corporate Awards"
                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-xl font-display text-white">Corporate Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Crystal & Recognition</p>
              </div>
            </Link>

            <Link href="/catalog?category=Academic" className="relative h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Academic Awards"
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-xl font-display text-white">Academic Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Schools & Annual Events</p>
              </div>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Row 2 */}
            <Link href="/catalog?material=Crystal" className="relative h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Crystal Awards"
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-xl font-display text-white">Crystal Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Premium Optical Glass</p>
              </div>
            </Link>

            <Link href="/catalog?material=Wooden" className="relative h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Wooden Awards"
                src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-xl font-display text-white">Wooden Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Rosewood & Mahogany</p>
              </div>
            </Link>

            <Link href="/catalog?material=Metal" className="relative h-80 overflow-hidden rounded-2xl group cursor-pointer border border-white/10 block">
              <Image
                alt="Metal Awards"
                src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-8 premium-glass border-t-0 rounded-b-2xl">
                <h4 className="text-xl font-display text-white">Metal Awards</h4>
                <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Medals & Custom Spins</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
      {/* END: CuratedRanges */}

      {/* BEGIN: FeaturesSection */}
      <section className="section-padding bg-black" data-purpose="features">
        <div className="container-custom">
          <div className="mb-20 text-center md:text-left">
            <p className="text-[#f2ca50] uppercase tracking-[0.2em] text-[10px] font-semibold mb-4">Why Choose Atelier</p>
            <h2 className="text-4xl md:text-5xl font-display font-light text-white">
              Craft you can trust, timelines <br className="hidden md:block" />you can plan.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">
            
            <div className="flex items-start group">
              <div className="mr-8 text-[#2563eb] group-hover:text-[#f2ca50] transition-colors duration-500">
                <span className="material-symbols-outlined text-4xl">verified</span>
              </div>
              <div>
                <h4 className="text-lg font-display text-white mb-3 uppercase tracking-wide">Premium Quality</h4>
                <p className="text-white/40 text-sm leading-relaxed">Hand-selected materials and rigorous quality checks for every piece from our atelier.</p>
              </div>
            </div>

            <div className="flex items-start group">
              <div className="mr-8 text-[#2563eb] group-hover:text-[#f2ca50] transition-colors duration-500">
                <span className="material-symbols-outlined text-4xl">bolt</span>
              </div>
              <div>
                <h4 className="text-lg font-display text-white mb-3 uppercase tracking-wide">Fast Delivery</h4>
                <p className="text-white/40 text-sm leading-relaxed">Enterprise-grade logistics with express shipping options available worldwide.</p>
              </div>
            </div>

            <div className="flex items-start group">
              <div className="mr-8 text-[#2563eb] group-hover:text-[#f2ca50] transition-colors duration-500">
                <span className="material-symbols-outlined text-4xl">groups</span>
              </div>
              <div>
                <h4 className="text-lg font-display text-white mb-3 uppercase tracking-wide">Bulk Solutions</h4>
                <p className="text-white/40 text-sm leading-relaxed">Scalable production systems for corporate events and international tournaments.</p>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* END: FeaturesSection */}

      {/* BEGIN: TestimonialSection */}
      <section className="section-padding bg-[#0a0a0a] text-white" data-purpose="testimonials">
        <div className="container-custom text-center">
          <p className="text-[#f2ca50] uppercase tracking-[0.2em] text-[10px] font-semibold mb-4">Testimonials</p>
          <h2 className="text-4xl font-display font-light mb-20">Kind words from our clients.</h2>
          <div className="max-w-4xl mx-auto premium-glass p-16 rounded-3xl relative">
            <span className="absolute top-10 left-16 text-8xl text-[#f2ca50]/10 font-serif leading-none">“</span>
            <blockquote className="text-2xl font-display italic leading-relaxed text-white/90 relative z-10 mb-10">
              "Atelier Première has been our partner for six seasons. The trophies always arrive on time and the engraving quality is truly world-class. A standard of excellence we rely on."
            </blockquote>
            <div className="flex flex-col items-center">
              <p className="font-bold uppercase tracking-[0.2em] text-[11px] text-[#f2ca50]">Rohan Deshmukh</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">Sports Director, Pune Cricket League</p>
            </div>
          </div>
        </div>
      </section>
      {/* END: TestimonialSection */}

      {/* BEGIN: CallToActionBanner */}
      <section className="container-custom py-24" data-purpose="cta-banner">
        <div className="btn-primary rounded-3xl p-16 md:p-24 text-white relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-light mb-8 leading-tight">
              Planning an event? Let's craft <br />the perfect award.
            </h2>
            <p className="text-white/70 max-w-xl mb-12 text-lg font-sans">
              Send your requirements and our executive team will return a bespoke proposal within 24 hours.
            </p>
            <div className="flex flex-wrap items-center gap-10">
              <Link href="/inquiry" className="bg-white text-[#2563eb] px-12 py-5 font-bold rounded-full hover:bg-white/90 transition-all uppercase tracking-widest text-xs inline-block">
                Send Inquiry
              </Link>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50">Direct Atelier Line</span>
                <span className="text-2xl font-display font-light">{phone}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: CallToActionBanner */}

    </div>
  );
}
