import React from 'react';
import { notFound } from 'next/navigation';
import { getPublicProductDetail, getRelatedProducts } from '@/lib/data/public-catalog';
import { ProductDetailClient } from '@/components/public/product-detail-client';
import { Metadata } from 'next';

export const revalidate = 60; // SSR refresh interval

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductDetail(slug);
  if (!product) {
    return { title: 'Award Not Found | Aryan Trophy World' };
  }

  const defaultImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80';
  const img = product.images?.[0]?.imageUrl || defaultImg;

  const desc = product.detailedDescription || product.shortDescription || product.seoDescription || `Explore ${product.name} crafted by Aryan Trophy World. Request custom engraving & wholesale bulk quotations.`;

  return {
    title: `${product.name} (${product.sku}) | Custom Trophy Showroom`,
    description: desc,
    openGraph: {
      title: `${product.name} | Aryan Trophy World`,
      description: desc,
      images: [{ url: img }],
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
  const product = await getPublicProductDetail(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.categoryId || undefined, 4);

  // JSON-LD Structured Product Data for Google SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((i: any) => i.imageUrl) || [],
    description: product.detailedDescription || product.shortDescription || 'Custom premium trophy and recognition award.',
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Aryan Trophy World',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      price: product.pricingMatrix?.[0]?.pricePerPiece || '1000',
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${product.slug || product.id}`,
    },
  };

  return (
    <div className="w-full bg-white flex flex-col">
      {/* SEO Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </div>
  );
}
