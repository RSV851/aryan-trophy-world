'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ProductCard } from '@/components/public/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, Search, X, SlidersHorizontal, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface CatalogClientProps {
  products: Array<any>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    categories: Array<any>;
    productTypes: Array<any>;
    materials: Array<any>;
    themes: Array<any>;
    shapes: Array<any>;
    collections: Array<any>;
  };
}

export function CatalogClient({ products, pagination, filters }: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams?.get('search') || '');

  // Current filter parameter getters
  const activeCategory = searchParams?.get('categorySlug') || 'all';
  const activeType = searchParams?.get('typeSlug') || 'all';
  const activeMaterial = searchParams?.get('materialSlug') || 'all';
  const activeTheme = searchParams?.get('themeSlug') || 'all';
  const activeCollection = searchParams?.get('collectionSlug') || 'all';
  const activeSort = searchParams?.get('sortBy') || 'createdAt';
  const activeOrder = searchParams?.get('sortOrder') || 'desc';

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (!value || value === 'all' || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Always reset to page 1 on filter modification
    if (key !== 'page') {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', localSearch.trim());
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    router.push(pathname);
  };

  const activeFilterCount = [
    activeCategory !== 'all' ? 1 : 0,
    activeType !== 'all' ? 1 : 0,
    activeMaterial !== 'all' ? 1 : 0,
    activeTheme !== 'all' ? 1 : 0,
    activeCollection !== 'all' ? 1 : 0,
    searchParams?.get('search') ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col space-y-8">
      
      {/* Showroom Title Header Bar */}
      <div className="bg-[#1A1F36] text-white rounded-2xl p-6 sm:p-10 border border-[#C5A55A]/30 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#090909] bg-[#C5A55A] px-3 py-1 rounded-md inline-block font-serif">
            Executive Repository
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-serif">
            Award Catalog Showroom
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            Inspect custom trophies, Olympic medals, and acrylic monuments. Use multi-tier structural filters to refine awards and add items to your quote basket.
          </p>
        </div>
        <div className="flex items-center space-x-3 relative z-10">
          <Button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            variant="outline"
            className="lg:hidden bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold uppercase text-xs h-11 px-4 rounded-xl flex items-center space-x-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C5A55A]" />
            <span>Filters ({activeFilterCount})</span>
          </Button>
          {activeFilterCount > 0 && (
            <Button
              onClick={handleResetFilters}
              variant="ghost"
              className="text-xs font-bold uppercase tracking-wider text-[#C5A55A] hover:bg-white/10 px-3 h-11 rounded-xl flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Workspace: Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Filter Repository */}
        <aside
          className={`lg:block lg:col-span-1 space-y-6 bg-gray-50/80 p-6 rounded-2xl border border-gray-200 shadow-sm self-start sticky top-24 ${
            mobileFilterOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#1A1F36] font-serif flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#C5A55A]" />
              <span>Catalog Filters</span>
            </h2>
            {mobileFilterOpen && (
              <button onClick={() => setMobileFilterOpen(false)} className="text-gray-500 hover:text-black lg:hidden">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search Box Filter */}
          <form onSubmit={handleSearchSubmit} className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">Keyword Search</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Name, SKU, keyword..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="bg-white border-gray-300 pl-8 pr-3 h-10 rounded-xl text-xs"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>
          </form>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">Award Category</label>
            <select
              value={activeCategory}
              onChange={(e) => updateParam('categorySlug', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl h-10 px-3 text-xs font-medium text-gray-800 focus:border-[#C5A55A] focus:ring-1 focus:ring-[#C5A55A]"
            >
              <option value="all">All Categories ({filters.categories.length})</option>
              {filters.categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Type Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">Product Type</label>
            <select
              value={activeType}
              onChange={(e) => updateParam('typeSlug', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl h-10 px-3 text-xs font-medium text-gray-800 focus:border-[#C5A55A] focus:ring-1 focus:ring-[#C5A55A]"
            >
              <option value="all">All Types (Trophy, Medal, Pin...)</option>
              {filters.productTypes.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Material Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">Material Structure</label>
            <select
              value={activeMaterial}
              onChange={(e) => updateParam('materialSlug', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl h-10 px-3 text-xs font-medium text-gray-800 focus:border-[#C5A55A] focus:ring-1 focus:ring-[#C5A55A]"
            >
              <option value="all">All Materials (Metal, Crystal...)</option>
              {filters.materials.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">Event Theme</label>
            <select
              value={activeTheme}
              onChange={(e) => updateParam('themeSlug', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl h-10 px-3 text-xs font-medium text-gray-800 focus:border-[#C5A55A] focus:ring-1 focus:ring-[#C5A55A]"
            >
              <option value="all">All Themes (Sports, Academic...)</option>
              {filters.themes.map((th) => (
                <option key={th.id} value={th.slug}>
                  {th.name}
                </option>
              ))}
            </select>
          </div>

          {/* Collection Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">Curated Collection</label>
            <select
              value={activeCollection}
              onChange={(e) => updateParam('collectionSlug', e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl h-10 px-3 text-xs font-medium text-gray-800 focus:border-[#C5A55A] focus:ring-1 focus:ring-[#C5A55A]"
            >
              <option value="all">All Collections</option>
              {filters.collections.map((col) => (
                <option key={col.id} value={col.slug}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {activeFilterCount > 0 && (
            <Button
              onClick={handleResetFilters}
              variant="outline"
              className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold uppercase h-10 rounded-xl shadow-sm"
            >
              Reset All Filters
            </Button>
          )}
        </aside>

        {/* Right Product Showcase Workspace */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Controls Bar: Results Counter + Sorting Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Showing <span className="text-[#1A1F36] font-black">{products.length}</span> of <span className="text-[#1A1F36] font-black">{pagination.total}</span> awards
              {activeFilterCount > 0 && ` (Filtered)`}
            </span>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Sort By:</span>
              <select
                value={`${activeSort}_${activeOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('_');
                  updateParam('sortBy', sb);
                  updateParam('sortOrder', so);
                }}
                className="bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 px-3 py-1.5 h-9 focus:border-[#C5A55A]"
              >
                <option value="createdAt_desc">Newest Showroom Additions</option>
                <option value="featured_desc">Featured Excellence First</option>
                <option value="name_asc">Alphabetical (A - Z)</option>
                <option value="name_desc">Alphabetical (Z - A)</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-300 space-y-3">
              <div className="w-12 h-12 bg-[#1A1F36] text-[#C5A55A] rounded-xl flex items-center justify-center mx-auto shadow-md font-bold">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#1A1F36] uppercase">No Trophies Matched Criteria</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                We could not locate items matching your active filter combination. Please clear selected parameters to view our full collection.
              </p>
              <Button
                onClick={handleResetFilters}
                className="mt-2 bg-[#1A1F36] hover:bg-[#C5A55A] text-white hover:text-[#090909] font-extrabold uppercase text-xs h-10 px-6 rounded-xl shadow"
              >
                Show All Products
              </Button>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-8 border-t border-gray-200 flex items-center justify-between text-xs">
              <Button
                disabled={pagination.page <= 1}
                onClick={() => updateParam('page', String(pagination.page - 1))}
                variant="outline"
                className="h-10 px-4 font-bold uppercase rounded-xl border-gray-300"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span>Previous</span>
              </Button>

              <span className="font-bold text-gray-700">
                Page <span className="text-[#C5A55A] font-black">{pagination.page}</span> of {pagination.totalPages}
              </span>

              <Button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateParam('page', String(pagination.page + 1))}
                variant="outline"
                className="h-10 px-4 font-bold uppercase rounded-xl border-gray-300"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
