import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SmartImage } from '@/components/ui/smart-image';
import { Trophy } from 'lucide-react';
import { getPublicProducts, getPublicOwnerProfile, getPublicSettingsMap } from '@/lib/data/public-catalog';

export const revalidate = 0; // Dynamic 0-second revalidation for instant homepage updates

export default async function HomePage() {
  const [featuredCollectionRes, bestsellerCollectionRes, profile, settings] = await Promise.all([
    getPublicProducts({ collectionSlug: 'featured', limit: 8 }),
    getPublicProducts({ collectionSlug: 'best-sellers', limit: 8 }),
    getPublicOwnerProfile(),
    getPublicSettingsMap(),
  ]);

  const phone = profile?.phone || settings?.contact_phone || '+91 98765 43210';
  const heroBanner = settings?.hero_banner_image || '';
  const heroHeadline = settings?.hero_headline || 'Every trophy tells a story worth engraving.';
  const heroSubtitle = settings?.hero_subtitle || 'Complimentary custom engraving on every award. Handcrafted for tournaments, corporate honors, and champions.';

  const featuredProducts = (featuredCollectionRes?.products || []).slice(0, 8);
  const displayProducts = (bestsellerCollectionRes?.products || []).slice(0, 8);

  const curatedCards = [
    { id: 1, title: settings?.curated_card_1_title || 'Sports Awards', image: settings?.curated_card_1_image || '', link: settings?.curated_card_1_link || '/catalog?categorySlug=sports-trophies' },
    { id: 2, title: settings?.curated_card_2_title || 'Corporate Awards', image: settings?.curated_card_2_image || '', link: settings?.curated_card_2_link || '/catalog?categorySlug=corporate-awards' },
    { id: 3, title: settings?.curated_card_3_title || 'Academic Honors', image: settings?.curated_card_3_image || '', link: settings?.curated_card_3_link || '/catalog?categorySlug=academic-excellence' },
    { id: 4, title: settings?.curated_card_4_title || 'Crystal Monuments', image: settings?.curated_card_4_image || '', link: settings?.curated_card_4_link || '/catalog?materialSlug=crystal' },
    { id: 5, title: settings?.curated_card_5_title || 'Victory Medals', image: settings?.curated_card_5_image || '', link: settings?.curated_card_5_link || '/catalog?typeSlug=medal' },
    { id: 6, title: settings?.curated_card_6_title || 'Bespoke Plaques', image: settings?.curated_card_6_image || '', link: settings?.curated_card_6_link || '/catalog?typeSlug=plaque' },
  ];

  return (
    <div className="w-full bg-background text-foreground transition-colors duration-300">
      
      {/* BEGIN: HeroSection with Dynamic DB Banner Image & Headline */}
      <section className="relative min-h-[480px] sm:min-h-[540px] md:min-h-[580px] h-auto sm:h-[60vh] md:h-[65vh] flex items-center overflow-hidden py-8 mobile-mid:py-10 sm:py-12 md:py-0 bg-card border-b border-border" data-purpose="hero-banner">
        <div className="absolute inset-0 z-0">
          <SmartImage
            alt="Hero Banner"
            src={heroBanner}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover object-center"
            fallbackIcon={<div className="w-full h-full bg-gradient-to-br from-background via-card to-background opacity-80" />}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/95" />
        </div>
        
        <div className="container-custom relative z-10 text-center w-full my-auto py-4">
          <p className="text-primary font-sans font-semibold uppercase tracking-[0.2em] mobile-mid:tracking-[0.25em] sm:tracking-[0.3em] text-[9px] mobile-mid:text-[10px] sm:text-xs mb-2 mobile-mid:mb-3 sm:mb-4">
            Exclusive Engraving & Bespoke Crafting
          </p>
          
          {/* Dynamic Hero Headline */}
          <h1 className="text-2xl mobile-mid:text-3xl mobile-lg:text-4xl phablet:text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-light mb-3 mobile-mid:mb-4 md:mb-6 leading-[1.15] text-foreground tracking-tight max-w-4xl mx-auto">
            {heroHeadline}
          </h1>
          
          {/* Dynamic Hero Subtitle */}
          <p className="text-[11px] mobile-mid:text-xs mobile-lg:text-xs phablet:text-sm sm:text-sm md:text-base font-sans text-muted-foreground max-w-xl mx-auto mb-4 mobile-mid:mb-6 sm:mb-8 leading-relaxed px-1 mobile-mid:px-2">
            {heroSubtitle}
          </p>
          
          <div className="flex flex-col mobile-lg:flex-row items-center justify-center gap-2.5 mobile-mid:gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none">
            <Link href="/catalog" className="btn-primary w-full mobile-lg:w-auto px-6 mobile-mid:px-8 sm:px-10 py-2.5 mobile-mid:py-3 font-semibold rounded-full uppercase tracking-widest text-[10px] sm:text-[11px] text-center">
              Browse Collection
            </Link>
            <Link href="/contact" className="btn-secondary-glass w-full mobile-lg:w-auto px-6 mobile-mid:px-8 sm:px-10 py-2.5 mobile-mid:py-3 font-semibold rounded-full uppercase tracking-widest text-[10px] sm:text-[11px] text-center border border-border bg-card text-foreground hover:bg-muted">
              Send Inquiry
            </Link>
          </div>

          <div className="mt-5 mobile-mid:mt-6 sm:mt-8 pb-4 sm:pb-6 flex flex-wrap items-center justify-center gap-2.5 mobile-mid:gap-4 sm:gap-8 text-[8px] mobile-mid:text-[9px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-[0.15em] mobile-mid:tracking-[0.2em]">
            <span className="flex items-center gap-1"><span className="text-primary">★</span> 200+ Reviews</span>
            <span className="flex items-center gap-1"><span className="text-primary">★</span> 15+ Years Exp</span>
            <span className="flex items-center gap-1"><span className="text-primary">★</span> 2000+ Projects</span>
          </div>
        </div>

        {/* Scroll Down Hint Indicator (Hidden on small mobile where height is tight, visible on sm: 640px+) */}
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center gap-0.5 text-muted-foreground text-[8px] mobile-mid:text-[9px] uppercase tracking-[0.2em] pointer-events-none">
          <span>Scroll to explore</span>
          <span className="material-symbols-outlined text-sm mobile-mid:text-base animate-bounce text-primary">keyboard_arrow_down</span>
        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: OccasionCategories */}
      <section className="section-padding bg-background" data-purpose="categories-grid">
        <div className="container-custom">
          <div className="text-center mb-8 mobile-mid:mb-12 sm:mb-16">
            <p className="text-primary uppercase tracking-[0.2em] text-[9px] mobile-mid:text-[10px] font-semibold mb-2 mobile-mid:mb-3">Our Collections</p>
            <h2 className="text-2xl mobile-mid:text-3xl sm:text-4xl md:text-5xl font-display font-light text-foreground">A trophy for every occasion.</h2>
            <p className="text-muted-foreground mt-3 mobile-mid:mt-4 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
              Explore our curated ranges meticulously designed for sports tournaments, corporate galas, and scholastic honors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 phablet:grid-cols-2 lg:grid-cols-3 gap-4 mobile-mid:gap-6 sm:gap-8">
            
            {/* Category Card 1 */}
            <Link href="/catalog?category=Sports" className="bg-card border border-border p-8 sm:p-10 rounded-2xl group cursor-pointer transition-all duration-500 hover:-translate-y-1 block shadow-sm hover:shadow-md">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-6 sm:mb-8 text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                <span className="material-symbols-outlined text-2xl">emoji_events</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-light text-foreground mb-3">Sports Awards</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">Cups, tournament medals & champion trophies designed for athletes.</p>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>

            {/* Category Card 2 */}
            <Link href="/catalog?category=Corporate" className="bg-card border border-border p-8 sm:p-10 rounded-2xl group cursor-pointer transition-all duration-500 hover:-translate-y-1 block shadow-sm hover:shadow-md">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-6 sm:mb-8 text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                <span className="material-symbols-outlined text-2xl">business_center</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-light text-foreground mb-3">Corporate Awards</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">Crystal plaques & recognition gifts for enterprise excellence.</p>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>

            {/* Category Card 3 */}
            <Link href="/catalog?category=Academic" className="bg-card border border-border p-8 sm:p-10 rounded-2xl group cursor-pointer transition-all duration-500 hover:-translate-y-1 block sm:col-span-2 lg:col-span-1 shadow-sm hover:shadow-md">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mb-6 sm:mb-8 text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-light text-foreground mb-3">School Awards</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">Honoring academic excellence with custom laser engravings.</p>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Explore <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </Link>

          </div>
        </div>
      </section>
      {/* END: OccasionCategories */}

      {/* BEGIN: Featured Masterpieces Showcase Section */}
      <section className="section-padding bg-card/40 border-y border-border" data-purpose="featured-products">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
            <div>
              <p className="text-primary uppercase tracking-[0.2em] text-[10px] font-semibold mb-3 flex items-center gap-1.5">
                <span>★</span> <span>Featured Atelier Collection</span>
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-foreground">
                Featured Masterpieces.
              </h2>
            </div>
            <Link href="/catalog?collection=featured" className="text-primary text-[11px] font-bold uppercase tracking-widest border-b border-primary/30 hover:border-primary transition-all pb-1 self-start sm:self-auto">
              View Featured Collection ({featuredCollectionRes?.pagination?.total ?? featuredProducts.length})
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="col-span-full text-center py-16 px-6 bg-card border border-border rounded-2xl">
              <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">Featured Showroom</p>
              <h3 className="text-xl font-display text-foreground mb-2">No Featured Products Currently Listed</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                Assign products to the 'Featured' collection in CMS to feature them here.
              </p>
              <Link href="/admin/products/create" className="btn-primary inline-block px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full">
                Add Featured Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 phablet:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mobile-mid:gap-6 sm:gap-8">
              {featuredProducts.map((prod: any, idx: number) => {
                const img = prod.imageUrl || '/images/trophies/gold-cup.jpg';
                const cat = prod.categoryName || prod.category?.name || 'Featured Collection';
                const price = prod.priceRange || (prod.pricingMatrix?.[0]?.pricePerPiece ? `₹${prod.pricingMatrix[0].pricePerPiece}` : '$249');
                // Strict Card Visibility: 2 on Mobile (<768px), 4 on Tabs (768px-1023px), 8 on Desktop (1024px+)
                const visibilityClass = idx >= 4 ? 'hidden lg:flex' : idx >= 2 ? 'hidden md:flex' : 'flex';

                return (
                  <div key={prod.id} className={`${visibilityClass} bg-card rounded-2xl overflow-hidden group flex-col transition-all duration-300 hover:-translate-y-1 border border-border shadow-sm`}>
                    <Link href={`/products/${prod.slug || prod.id}`} className="relative overflow-hidden aspect-[4/5] block bg-muted/40 w-full">
                      <span className="absolute top-4 left-4 z-10 bg-primary text-white text-[9px] px-3 py-1 rounded-full uppercase font-black tracking-widest flex items-center gap-1 shadow-lg">
                        <span>★</span> <span>Featured</span>
                      </span>
                      <SmartImage
                        alt={prod.name}
                        src={img}
                        className="w-full h-full"
                        imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        fallbackIcon={<Trophy className="w-16 h-16 text-primary/50 stroke-[1.5]" />}
                      />
                    </Link>
                    <div className="p-4 mobile-mid:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/products/${prod.slug || prod.id}`}>
                          <h3 className="text-base mobile-mid:text-lg font-display text-foreground mb-2 hover:text-primary transition-colors">{prod.name}</h3>
                        </Link>
                        <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-4 mobile-mid:mb-6">{cat}</p>
                      </div>
                      <div className="flex items-center justify-between pt-3 mobile-mid:pt-4 border-t border-border">
                        <span className="text-primary font-bold text-sm mobile-mid:text-base">{price}</span>
                        <Link href={`/products/${prod.slug || prod.id}`} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:text-foreground transition-colors">
                          Inquiry
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      {/* END: Featured Masterpieces Showcase Section */}

      {/* BEGIN: BestsellersProductGrid (8 Cards) */}
      <section className="section-padding bg-background" data-purpose="product-grid">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 mobile-mid:mb-12 sm:mb-16 gap-3 mobile-mid:gap-4">
            <div>
              <p className="text-primary uppercase tracking-[0.2em] text-[9px] mobile-mid:text-[10px] font-semibold mb-2 mobile-mid:mb-3">Curated Selection</p>
              <h2 className="text-2xl mobile-mid:text-3xl sm:text-4xl md:text-5xl font-display font-light text-foreground">Bestsellers this season.</h2>
            </div>
            <Link href="/catalog" className="text-primary text-[10px] mobile-mid:text-[11px] font-bold uppercase tracking-widest border-b border-primary/30 hover:border-primary transition-all pb-1 self-start sm:self-auto">
              View All Products ({bestsellerCollectionRes?.pagination?.total ?? displayProducts.length})
            </Link>
          </div>
          
          {displayProducts.length === 0 ? (
            <div className="col-span-full text-center py-16 px-6 bg-card border border-border rounded-2xl">
              <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">Showroom Catalog</p>
              <h3 className="text-xl font-display text-foreground mb-2">No Products Currently Listed</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                Our catalog database is currently being populated. Use the Executive CMS to add new trophies and awards.
              </p>
              <Link href="/admin/products/create" className="btn-primary inline-block px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-full">
                Add First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 phablet:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mobile-mid:gap-6 sm:gap-8">
              {displayProducts.map((prod: any, idx: number) => {
              const img = prod.imageUrl || '/images/trophies/gold-cup.jpg';
              const cat = prod.categoryName || prod.category?.name || 'Prestige Collection';
              const price = prod.priceRange || (prod.pricingMatrix?.[0]?.pricePerPiece ? `₹${prod.pricingMatrix[0].pricePerPiece}` : '$249');
              // Strict Card Visibility: 2 on Mobile (<768px), 4 on Tabs (768px-1023px), 8 on Desktop (1024px+)
              const visibilityClass = idx >= 4 ? 'hidden lg:flex' : idx >= 2 ? 'hidden md:flex' : 'flex';
              
              return (
                <div key={prod.id} className={`${visibilityClass} bg-card rounded-2xl overflow-hidden group flex-col transition-all duration-300 hover:-translate-y-1 border border-border shadow-sm`}>
                  <Link href={`/products/${prod.slug || prod.id}`} className="relative overflow-hidden aspect-[4/5] block bg-muted/40 w-full">
                    <span className="absolute top-4 left-4 z-10 bg-primary/90 backdrop-blur-md text-white text-[9px] px-3 py-1 rounded-full uppercase font-bold tracking-widest">
                      In Stock
                    </span>
                    <SmartImage
                      alt={prod.name}
                      src={img}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      fallbackIcon={<Trophy className="w-16 h-16 text-primary/50 stroke-[1.5]" />}
                    />
                  </Link>
                  <div className="p-4 mobile-mid:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/products/${prod.slug || prod.id}`}>
                        <h3 className="text-base mobile-mid:text-lg font-display text-foreground mb-2 hover:text-primary transition-colors">{prod.name}</h3>
                      </Link>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wider mb-4 mobile-mid:mb-6">{cat}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 mobile-mid:pt-4 border-t border-border">
                      <span className="text-foreground font-semibold text-sm mobile-mid:text-base">{price}</span>
                      <Link href={`/products/${prod.slug || prod.id}`} className="text-primary text-[10px] font-bold uppercase tracking-widest hover:text-foreground transition-colors">
                        Inquiry
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </section>
      {/* END: BestsellersProductGrid */}

      {/* BEGIN: CuratedRanges (Using User's Local Trophy Images) */}
      <section className="section-padding bg-background" data-purpose="curated-ranges">
        <div className="container-custom">
          <div className="mb-8 mobile-mid:mb-12 sm:mb-16">
            <p className="text-primary uppercase tracking-[0.2em] text-[9px] mobile-mid:text-[10px] font-semibold mb-2 mobile-mid:mb-3">Shop by Category</p>
            <h2 className="text-2xl mobile-mid:text-3xl sm:text-4xl md:text-5xl font-display font-light text-foreground">Curated ranges.</h2>
          </div>
             {/* 6 Curated Cards Grid */}
          <div className="grid grid-cols-1 phablet:grid-cols-2 lg:grid-cols-3 gap-4 mobile-mid:gap-6">
            {curatedCards.map((card) => (
              <Link key={card.id} href={card.link} className="relative h-64 sm:h-80 overflow-hidden rounded-2xl group cursor-pointer border border-border block bg-card shadow-sm">
                <SmartImage
                  alt={card.title}
                  src={card.image}
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  fallbackIcon={<Trophy className="w-16 h-16 text-primary/40 stroke-[1.5]" />}
                />
                <div className="absolute inset-0 bg-background/30 group-hover:bg-background/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-card/90 backdrop-blur-md border-t border-border rounded-b-2xl">
                  <h4 className="text-lg sm:text-xl font-display text-foreground">{card.title}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Explore Range</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* END: CuratedRanges */}

      {/* BEGIN: FeaturesSection */}
      <section className="section-padding bg-card border-y border-border" data-purpose="features">
        <div className="container-custom">
          <div className="mb-12 sm:mb-16 text-center md:text-left">
            <p className="text-primary uppercase tracking-[0.2em] text-[10px] font-semibold mb-3">Why Choose Atelier</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-light text-foreground">
              Craft you can trust, timelines <br className="hidden md:block" />you can plan.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            <div className="flex items-start group">
              <div className="mr-6 sm:mr-8 text-primary group-hover:text-gold transition-colors duration-500 flex-shrink-0">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">verified</span>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-display text-foreground mb-2 sm:mb-3 uppercase tracking-wide">Premium Quality</h4>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">Hand-selected materials and rigorous quality checks for every piece from our atelier.</p>
              </div>
            </div>

            <div className="flex items-start group">
              <div className="mr-6 sm:mr-8 text-primary group-hover:text-gold transition-colors duration-500 flex-shrink-0">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">bolt</span>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-display text-foreground mb-2 sm:mb-3 uppercase tracking-wide">Fast Delivery</h4>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">Enterprise-grade logistics with express shipping options available worldwide.</p>
              </div>
            </div>

            <div className="flex items-start group">
              <div className="mr-6 sm:mr-8 text-primary group-hover:text-gold transition-colors duration-500 flex-shrink-0">
                <span className="material-symbols-outlined text-3xl sm:text-4xl">groups</span>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-display text-foreground mb-2 sm:mb-3 uppercase tracking-wide">Bulk Solutions</h4>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">Scalable production systems for corporate events and international tournaments.</p>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* END: FeaturesSection */}

      {/* BEGIN: TestimonialSection */}
      <section className="section-padding bg-background text-foreground" data-purpose="testimonials">
        <div className="container-custom text-center">
          <p className="text-primary uppercase tracking-[0.2em] text-[10px] font-semibold mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-display font-light mb-12 sm:mb-16">Kind words from our clients.</h2>
          <div className="max-w-4xl mx-auto bg-card border border-border p-8 sm:p-12 md:p-16 rounded-3xl relative shadow-md">
            <span className="absolute top-4 left-6 sm:top-8 sm:left-12 text-6xl sm:text-8xl text-primary/10 font-serif leading-none">“</span>
            <blockquote className="text-lg sm:text-xl md:text-2xl font-display italic leading-relaxed text-foreground/90 relative z-10 mb-8 sm:mb-10">
              "Atelier Première has been our partner for six seasons. The trophies always arrive on time and the engraving quality is truly world-class. A standard of excellence we rely on."
            </blockquote>
            <div className="flex flex-col items-center">
              <p className="font-bold uppercase tracking-[0.2em] text-[10px] sm:text-[11px] text-primary">Rohan Deshmukh</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Sports Director, Pune Cricket League</p>
            </div>
          </div>
        </div>
      </section>
      {/* END: TestimonialSection */}

      {/* BEGIN: CallToActionBanner */}
      <section className="container-custom py-16 sm:py-24" data-purpose="cta-banner">
        <div className="bg-gradient-to-r from-primary via-purple-700 to-primary rounded-3xl p-8 sm:p-14 md:p-20 text-white relative overflow-hidden group shadow-xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-light mb-6 sm:mb-8 leading-tight">
              Planning an event? Let's craft <br className="hidden sm:inline" />the perfect award.
            </h2>
            <p className="text-white/90 max-w-xl mb-8 sm:mb-12 text-sm sm:text-base md:text-lg font-sans">
              Send your requirements and our executive team will return a bespoke proposal within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
              <Link href="/contact" className="btn-group-2 px-8 sm:px-12 py-4 font-bold rounded-full transition-all uppercase tracking-widest text-xs inline-block text-center w-full sm:w-auto shadow-md">
                Send Inquiry
              </Link>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/80">Direct Atelier Line</span>
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
