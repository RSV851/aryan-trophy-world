import React, { Suspense } from 'react';
import { getPublicProducts, getPublicFiltersData, PublicProductsQuery } from '@/lib/data/public-catalog';
import { CatalogClient } from '@/components/public/catalog-client';
import { Loader2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Award Catalog & Showroom | Aryan Trophy World',
  description: 'Explore custom luxury trophies, championship medals, optical crystal monuments, and executive recognition plaques with transparent wholesale pricing tiers.',
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
        <div className="min-h-[70vh] w-full flex flex-col items-center justify-center space-y-3 text-[#1A1F36]">
          <Loader2 className="w-10 h-10 animate-spin text-[#C5A55A]" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Initializing Executive Showroom Repository...
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
