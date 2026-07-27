import React, { Suspense } from 'react';
import { getPublicProducts, getPublicFiltersData, PublicProductsQuery } from '@/lib/data/public-catalog';
import { CatalogClient } from '@/components/public/catalog-client';
import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Collection | AURA & Atelier Award Registry',
  description: 'Discover our curated selection of bespoke luxury awards, championship trophies, medals, and crystal monuments crafted with unparalleled precision.',
};

export const revalidate = 30; // SSR revalidation

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const query: PublicProductsQuery = {
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: 12,
    search: params.search,
    categorySlug: params.categorySlug,
    typeSlug: params.typeSlug,
    materialSlug: params.materialSlug,
    themeSlug: params.themeSlug,
    collectionSlug: params.collectionSlug,
    sortBy: (params.sortBy as any) || 'createdAt',
    sortOrder: (params.sortOrder as any) || 'desc',
  };

  const [productsData, filtersData] = await Promise.all([
    getPublicProducts(query),
    getPublicFiltersData(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] w-full bg-black flex flex-col items-center justify-center space-y-4 text-white">
          <Loader2 className="w-10 h-10 animate-spin text-[#f2ca50]" />
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/50">
            Initializing Atelier Collection Registry...
          </p>
        </div>
      }
    >
      <CatalogClient
        products={productsData.products}
        pagination={productsData.pagination}
        filters={filtersData}
      />
    </Suspense>
  );
}
