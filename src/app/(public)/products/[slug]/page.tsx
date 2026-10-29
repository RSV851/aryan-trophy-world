import React from 'react';
import { notFound } from 'next/navigation';
import { getPublicProductDetail, getRelatedProducts } from '@/lib/data/public-catalog';
import { ProductDetailClient } from '@/components/public/product-detail-client';
import { Metadata } from 'next';

export const revalidate = 60; // SSR refresh interval

// Helper to generate a fallback sample showroom product if database lookup returns null
function getFallbackShowroomProduct(slug: string) {
  const sampleMap: Record<string, any> = {
    'champion-gold-cup-trophy': {
      id: 'samp-1',
      slug: 'champion-gold-cup-trophy',
      name: 'Championship Gold Cup',
      sku: 'AT-CUP01',
      sizeUnit: 'cm',
      dimL: 22, dimB: 18, dimH: 45,
      detailedDescription: 'A masterpiece of optical crystal and electroplated aerospace-grade brass, designed to honor unparalleled athletic championship and tournament excellence.',
      priceRange: '₹18,499',
      numericPrice: 18499,
      categoryName: 'Sports',
      category: { name: 'Sports', slug: 'sports' },
      subcategory: { name: 'Cricket', slug: 'cricket' },
      type: { name: 'Trophy', slug: 'trophy' },
      materials: [{ name: 'Metal' }, { name: 'Wooden Base' }],
      themes: [{ name: 'Sports' }],
      shapes: [{ name: 'Cup' }],
      collections: [{ name: 'Premium Series' }],
      images: [
        { id: 'img-1', imageUrl: '/images/trophies/gold-cup.jpg', caption: 'Front angle studio showcase' },
        { id: 'img-2', imageUrl: '/images/trophies/sports-trophy.jpg', caption: 'Detail cup engraving view' },
        { id: 'img-3', imageUrl: '/images/trophies/crystal-star.jpg', caption: 'Base plate reflection' },
        { id: 'img-4', imageUrl: '/images/trophies/victory-shield.jpg', caption: 'Presentation packaging angle' },
      ],
      pricingMatrix: [
        { sizeLabel: 'Standard 12"', length: 16, breadth: 14, height: 32, weight: 850, quantity: 1, pricePerPiece: 18499 },
        { sizeLabel: 'Championship 15"', length: 19, breadth: 16, height: 38, weight: 1100, quantity: 5, pricePerPiece: 17499 },
        { sizeLabel: 'Grand 18" Obelisk', length: 22, breadth: 18, height: 45, weight: 1450, quantity: 25, pricePerPiece: 16499 },
        { sizeLabel: 'Supreme 22" Monument', length: 26, breadth: 22, height: 55, weight: 2100, quantity: 50, pricePerPiece: 15499 },
      ],
    },
    'golden-foot-football-award': {
      id: 'samp-2',
      slug: 'golden-foot-football-award',
      name: 'Golden Foot Striker Trophy',
      sku: 'AT-FTB02',
      sizeUnit: 'cm',
      dimL: 16, dimB: 14, dimH: 32,
      detailedDescription: 'Precision sculptured golden striker boot mounted on a solid weighted brushed matte black metallic base. Engineered for top league goal scorers.',
      priceRange: '₹9,499',
      numericPrice: 9499,
      category: { name: 'Sports', slug: 'sports' },
      subcategory: { name: 'Football', slug: 'football' },
      type: { name: 'Trophy', slug: 'trophy' },
      materials: [{ name: 'Cast Resin' }, { name: 'Solid Brass' }],
      themes: [{ name: 'Sports' }],
      shapes: [{ name: 'Figurine' }],
      collections: [{ name: 'Classic Range' }],
      images: [
        { id: 'img-1', imageUrl: '/images/trophies/golden-foot.jpg', caption: 'Golden boot front elevation' },
        { id: 'img-2', imageUrl: '/images/trophies/gold-cup.jpg', caption: 'League trophy variant' },
        { id: 'img-3', imageUrl: '/images/trophies/sports-trophy.jpg', caption: 'Engraving nameplate view' },
        { id: 'img-4', imageUrl: '/images/trophies/victory-medal.jpg', caption: 'Accompaniment medal view' },
      ],
      pricingMatrix: [
        { sizeLabel: 'Junior 10" Striker', length: 14, breadth: 12, height: 26, weight: 650, quantity: 1, pricePerPiece: 9499 },
        { sizeLabel: 'Pro 12" Striker', length: 16, breadth: 14, height: 32, weight: 950, quantity: 10, pricePerPiece: 8899 },
        { sizeLabel: 'Elite 15" Trophy', length: 20, breadth: 16, height: 38, weight: 1350, quantity: 25, pricePerPiece: 8299 },
        { sizeLabel: 'League Champion 18"', length: 24, breadth: 18, height: 46, weight: 1850, quantity: 50, pricePerPiece: 7699 },
      ],
    },
    'crystal-pinnacle-star-award': {
      id: 'samp-3',
      slug: 'crystal-pinnacle-star-award',
      name: 'Crystal Pinnacle Star Award',
      sku: 'AT-CRY03',
      sizeUnit: 'inch',
      dimL: 6, dimB: 5, dimH: 14,
      detailedDescription: 'Flawless optical K9 crystal pillar culminating in a beveled geometric recognition star. Refracts light with supreme elegance for corporate leadership honors.',
      priceRange: '₹22,999',
      numericPrice: 22999,
      category: { name: 'Corporate', slug: 'corporate' },
      subcategory: { name: 'Leadership', slug: 'leadership' },
      type: { name: 'Trophy', slug: 'trophy' },
      materials: [{ name: 'Optical K9 Crystal' }],
      themes: [{ name: 'Corporate' }],
      shapes: [{ name: 'Star' }],
      collections: [{ name: 'Premium Series' }],
      images: [
        { id: 'img-1', imageUrl: '/images/trophies/crystal-star.jpg', caption: 'Main optical crystal star' },
        { id: 'img-2', imageUrl: '/images/trophies/crystal-award.jpg', caption: 'Obelisk geometric refraction' },
        { id: 'img-3', imageUrl: '/images/trophies/glass-plaque.jpg', caption: 'Glass honor comparison' },
        { id: 'img-4', imageUrl: '/images/trophies/gold-star.jpg', caption: 'Gold star alternative' },
      ],
      pricingMatrix: [
        { sizeLabel: 'Executive 8" Star', length: 5, breadth: 4, height: 8, weight: 900, quantity: 1, pricePerPiece: 22999 },
        { sizeLabel: 'Vice-Chair 10" Star', length: 5.5, breadth: 4.5, height: 10, weight: 1200, quantity: 10, pricePerPiece: 21499 },
        { sizeLabel: 'Chairman 12" Star', length: 6, breadth: 5, height: 12, weight: 1600, quantity: 25, pricePerPiece: 19999 },
        { sizeLabel: 'Zenith 14" Obelisk', length: 7, breadth: 6, height: 14, weight: 2200, quantity: 50, pricePerPiece: 18499 },
      ],
    },
  };

  if (sampleMap[slug]) return sampleMap[slug];

  // Universal fallback for any custom slug not immediately matched in DB
  const titleName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    id: `samp-${slug}`,
    slug: slug,
    name: titleName || 'The Zenith Obelisk Trophy',
    sku: `TR-CRY-${slug.slice(0, 4).toUpperCase()}`,
    sizeUnit: 'cm',
    dimL: 18, dimB: 12, dimH: 35,
    detailedDescription: 'A masterpiece of optical crystal and brushed aerospace-grade aluminum, designed to honor unparalleled achievement with enduring prestige.',
    priceRange: '₹14,500',
    numericPrice: 14500,
    category: { name: 'Corporate Awards', slug: 'corporate' },
    subcategory: { name: 'Crystal Division', slug: 'crystal' },
    type: { name: 'Trophy', slug: 'trophy' },
    materials: [{ name: 'Optical Crystal' }, { name: 'Brushed Aluminum' }],
    themes: [{ name: 'Achievement' }],
    shapes: [{ name: 'Obelisk' }],
    collections: [{ name: 'Premium Series' }],
    images: [
      { id: 'img-1', imageUrl: '/images/trophies/crystal-award.jpg', caption: 'Main Obelisk Trophy' },
      { id: 'img-2', imageUrl: '/images/trophies/crystal-star.jpg', caption: 'Top geometric angle' },
      { id: 'img-3', imageUrl: '/images/trophies/gold-star.jpg', caption: 'Side elevation' },
      { id: 'img-4', imageUrl: '/images/trophies/glass-plaque.jpg', caption: 'Presentation setup' },
    ],
    pricingMatrix: [
      { sizeLabel: '7" Tier', length: 14, breadth: 10, height: 18, weight: 900, quantity: 1, pricePerPiece: 14500 },
      { sizeLabel: '8" Tier', length: 16, breadth: 11, height: 20, weight: 1100, quantity: 10, pricePerPiece: 13900 },
      { sizeLabel: '9" Tier', length: 18, breadth: 12, height: 23, weight: 1400, quantity: 25, pricePerPiece: 13400 },
      { sizeLabel: '10" Tier', length: 20, breadth: 14, height: 26, weight: 1800, quantity: 50, pricePerPiece: 12800 },
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product: any = await getPublicProductDetail(slug);
  if (!product) {
    return { title: 'Trophy Not Found | Aryan Trophy World' };
  }

  const img = product.images?.[0]?.imageUrl || '';
  const desc = product.detailedDescription || product.shortDescription || product.seoDescription || `Explore ${product.name} handcrafted by Aryan Trophy World. Custom engraving & wholesale bulk quotations.`;

  return {
    title: `${product.name} (${product.sku}) | Aryan Trophy World Showroom`,
    description: desc,
    openGraph: {
      title: `${product.name} | Aryan Trophy World`,
      description: desc,
      images: img ? [{ url: img }] : [],
      type: 'website',
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product: any = await getPublicProductDetail(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId || undefined, 4);

  // JSON-LD Structured Product Data for Google SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((i: any) => i.imageUrl) || ['/images/trophies/gold-cup.jpg'],
    description: product.detailedDescription || product.shortDescription || 'Custom premium trophy and recognition award.',
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Aryan Trophy World',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      price: product.pricingMatrix?.[0]?.pricePerPiece || '14500',
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${product.slug || product.id}`,
    },
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ProductDetailClient product={product} relatedProducts={relatedProducts || []} />
    </div>
  );
}
