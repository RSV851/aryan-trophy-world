'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, RotateCcw, ArrowLeft, ArrowRight, X } from 'lucide-react';

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

  const [mobileOpen, setMobileOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [localSearch, setLocalSearch] = useState(searchParams?.get('search') || '');

  // Current active parameter getters
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
    if (key !== 'page') {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleFilter = (paramKey: string, currentVal: string, newVal: string) => {
    if (currentVal === newVal) {
      updateParam(paramKey, null);
    } else {
      updateParam(paramKey, newVal);
    }
  };

  const handleReset = () => {
    setFilterSearch('');
    setLocalSearch('');
    router.push(pathname);
  };

  const activeCount = [
    activeCategory !== 'all' ? 1 : 0,
    activeType !== 'all' ? 1 : 0,
    activeMaterial !== 'all' ? 1 : 0,
    activeTheme !== 'all' ? 1 : 0,
    activeCollection !== 'all' ? 1 : 0,
    searchParams?.get('search') ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const filterItem = (item: { name: string; slug: string }) => {
    if (!filterSearch.trim()) return true;
    return item.name.toLowerCase().includes(filterSearch.trim().toLowerCase());
  };

  return (
    <div className="bg-black text-[#e5e2e1] min-h-screen py-16 px-6 sm:px-12 max-w-[1440px] mx-auto">
      
      {/* Header & Breadcrumbs */}
      <div className="mb-12">
        <nav className="text-[#d0c5af] font-sans text-xs uppercase tracking-[0.2em] font-semibold mb-4 flex items-center space-x-2">
          <Link href="/" className="hover:text-[#f2ca50] transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-[#f2ca50]">CATALOG</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-display font-light text-white">The Collection</h1>
            <p className="text-white/60 mt-4 max-w-2xl text-base md:text-lg leading-relaxed">
              Discover our curated selection of bespoke awards, crafted with unparalleled precision from the finest materials.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center gap-2 border border-white/20"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#f2ca50]" />
              <span>Filters ({activeCount})</span>
            </button>
            <select
              value={`${activeSort}-${activeOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                const params = new URLSearchParams(searchParams?.toString() || '');
                params.set('sortBy', sort);
                params.set('sortOrder', order);
                router.push(`${pathname}?${params.toString()}`);
              }}
              className="bg-white/5 border border-white/20 text-xs font-semibold text-white px-4 py-2 rounded-lg uppercase tracking-widest outline-none focus:border-[#f2ca50]"
            >
              <option value="createdAt-desc" className="bg-[#131313]">Newest First</option>
              <option value="name-asc" className="bg-[#131313]">Name A-Z</option>
              <option value="name-desc" className="bg-[#131313]">Name Z-A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        
        {/* Sidebar Filters */}
        <aside className={`lg:col-span-1 lg:sticky top-28 flex flex-col gap-8 backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-xl p-6 ${
          mobileOpen ? 'block fixed inset-4 z-50 overflow-y-auto bg-[#131313] border-2 border-[#f2ca50]' : 'hidden lg:flex'
        }`}>
          {mobileOpen && (
            <div className="flex items-center justify-between lg:hidden pb-4 border-b border-white/10">
              <span className="font-display font-light text-xl text-white">Filter Showroom</span>
              <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Search filters input */}
          <div className="mb-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Search filters..."
                className="bg-white/5 border border-white/10 rounded-sm py-2 pl-3 pr-8 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#f2ca50] transition-all w-full"
              />
              <span className="material-symbols-outlined absolute right-2 text-[#f2ca50] text-lg pointer-events-none">search</span>
            </div>
          </div>

          {activeCount > 0 && (
            <button
              onClick={handleReset}
              className="w-full bg-[#2563eb]/20 hover:bg-[#2563eb]/40 text-[#2563eb] hover:text-white border border-[#2563eb]/50 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}

          {/* Category Accordion */}
          <details className="group border-b border-white/10 pb-4" open>
            <summary className="flex justify-between items-center cursor-pointer list-none">
              <h3 className="text-lg font-display text-[#f2ca50]">Category</h3>
              <span className="material-symbols-outlined text-[#f2ca50] transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <ul className="mt-4 space-y-3 font-sans text-sm">
              {(filters.categories || []).filter(filterItem).map((cat: any) => {
                const isChecked = activeCategory === cat.slug;
                return (
                  <li key={cat.id}>
                    <label className="flex items-center space-x-3 cursor-pointer group/item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFilter('categorySlug', activeCategory, cat.slug)}
                        className="custom-checkbox appearance-none w-4 h-4 border border-white/40 rounded-sm bg-transparent checked:bg-[#d4af37] transition-all cursor-pointer group-hover/item:border-[#f2ca50]"
                      />
                      <span className="text-white/80 group-hover/item:text-[#f2ca50] transition-colors">{cat.name}</span>
                    </label>
                  </li>
                );
              })}
              {(!filters.categories || filters.categories.length === 0) && (
                <li className="text-white/40 text-xs">No categories populated yet.</li>
              )}
            </ul>
          </details>

          {/* Type Accordion */}
          <details className="group border-b border-white/10 pb-4" open>
            <summary className="flex justify-between items-center cursor-pointer list-none">
              <h3 className="text-lg font-display text-[#f2ca50]">Award Type</h3>
              <span className="material-symbols-outlined text-[#f2ca50] transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <ul className="mt-4 space-y-3 font-sans text-sm">
              {(filters.productTypes || []).filter(filterItem).map((type: any) => {
                const isChecked = activeType === type.slug;
                return (
                  <li key={type.id}>
                    <label className="flex items-center space-x-3 cursor-pointer group/item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFilter('typeSlug', activeType, type.slug)}
                        className="custom-checkbox appearance-none w-4 h-4 border border-white/40 rounded-sm bg-transparent checked:bg-[#d4af37] transition-all cursor-pointer group-hover/item:border-[#f2ca50]"
                      />
                      <span className="text-white/80 group-hover/item:text-[#f2ca50] transition-colors">{type.name}</span>
                    </label>
                  </li>
                );
              })}
              {(!filters.productTypes || filters.productTypes.length === 0) && (
                <li className="text-white/40 text-xs">No product types found.</li>
              )}
            </ul>
          </details>

          {/* Material Accordion */}
          <details className="group border-b border-white/10 pb-4" open>
            <summary className="flex justify-between items-center cursor-pointer list-none">
              <h3 className="text-lg font-display text-[#f2ca50]">Material</h3>
              <span className="material-symbols-outlined text-[#f2ca50] transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <ul className="mt-4 space-y-3 font-sans text-sm">
              {(filters.materials || []).filter(filterItem).map((mat: any) => {
                const isChecked = activeMaterial === mat.slug;
                return (
                  <li key={mat.id}>
                    <label className="flex items-center space-x-3 cursor-pointer group/item">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleFilter('materialSlug', activeMaterial, mat.slug)}
                        className="custom-checkbox appearance-none w-4 h-4 border border-white/40 rounded-sm bg-transparent checked:bg-[#d4af37] transition-all cursor-pointer group-hover/item:border-[#f2ca50]"
                      />
                      <span className="text-white/80 group-hover/item:text-[#f2ca50] transition-colors">{mat.name}</span>
                    </label>
                  </li>
                );
              })}
              {(!filters.materials || filters.materials.length === 0) && (
                <li className="text-white/40 text-xs">No materials found.</li>
              )}
            </ul>
          </details>

          {/* Collection Accordion */}
          {filters.collections && filters.collections.length > 0 && (
            <details className="group pb-2" open>
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <h3 className="text-lg font-display text-[#f2ca50]">Collection</h3>
                <span className="material-symbols-outlined text-[#f2ca50] transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <ul className="mt-4 space-y-3 font-sans text-sm">
                {filters.collections.filter(filterItem).map((col: any) => {
                  const isChecked = activeCollection === col.slug;
                  return (
                    <li key={col.id}>
                      <label className="flex items-center space-x-3 cursor-pointer group/item">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFilter('collectionSlug', activeCollection, col.slug)}
                          className="custom-checkbox appearance-none w-4 h-4 border border-white/40 rounded-sm bg-transparent checked:bg-[#d4af37] transition-all cursor-pointer group-hover/item:border-[#f2ca50]"
                        />
                        <span className="text-white/80 group-hover/item:text-[#f2ca50] transition-colors">{col.name}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </details>
          )}

          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="btn-gold w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest lg:hidden mt-4"
            >
              Apply Selection & Close
            </button>
          )}
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          {products && products.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((prod: any) => {
                  const img = prod.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80';
                  const catName = prod.category?.name || 'Prestige Collection';
                  const typeName = prod.productType?.name || 'Award';
                  const price = prod.pricingMatrix?.[0]?.pricePerPiece ? `₹${prod.pricingMatrix?.[0]?.pricePerPiece}` : '$249';

                  return (
                    <div key={prod.id} className="premium-glass rounded-2xl overflow-hidden group flex flex-col transition-all duration-500 hover:-translate-y-1">
                      <Link href={`/products/${prod.slug || prod.id}`} className="relative overflow-hidden aspect-[4/5] block">
                        <span className="absolute top-4 left-4 z-10 bg-[#2563eb]/90 backdrop-blur-md text-white text-[9px] px-3 py-1 rounded-full uppercase font-bold tracking-widest">
                          {typeName}
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
                          <p className="text-white/40 text-[11px] uppercase tracking-wider mb-6">{catName}</p>
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

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-12 border-t border-white/10">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => updateParam('page', (pagination.page - 1).toString())}
                    className="premium-glass px-6 py-3 rounded-lg text-xs font-semibold text-white/80 disabled:opacity-30 disabled:pointer-events-none hover:text-[#f2ca50] transition-all flex items-center gap-2 uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  
                  <span className="text-xs uppercase tracking-widest font-mono text-[#f2ca50] bg-white/5 px-4 py-2 rounded-lg">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => updateParam('page', (pagination.page + 1).toString())}
                    className="premium-glass px-6 py-3 rounded-lg text-xs font-semibold text-white/80 disabled:opacity-30 disabled:pointer-events-none hover:text-[#f2ca50] transition-all flex items-center gap-2 uppercase tracking-wider"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="premium-glass rounded-2xl p-16 text-center space-y-6 max-w-xl mx-auto my-12 border border-white/10">
              <span className="material-symbols-outlined text-6xl text-[#f2ca50]">emoji_events</span>
              <h3 className="text-2xl font-display font-light text-white">No matches in our atelier registry</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                We couldn't find any trophies matching your specific filter refinement. Please adjust your criteria or reset filters to inspect our full showroom.
              </p>
              <button
                onClick={handleReset}
                className="btn-primary px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest"
              >
                Reset Filter Selection
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
