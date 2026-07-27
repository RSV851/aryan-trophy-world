'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/public/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Filter,
  Search,
  SlidersHorizontal,
  Trophy,
  Check,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package
} from 'lucide-react';

interface MasterEntity {
  id: string;
  name: string;
  slug: string;
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Params State
  const initialSearch = searchParams?.get('search') || '';
  const initialCategory = searchParams?.get('category') || '';
  const initialType = searchParams?.get('type') || '';
  const initialSort = searchParams?.get('sort') || 'newest';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedShape, setSelectedShape] = useState('');
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);

  // Master Data lists for filters
  const [categories, setCategories] = useState<MasterEntity[]>([]);
  const [types, setTypes] = useState<MasterEntity[]>([]);
  const [materials, setMaterials] = useState<MasterEntity[]>([]);
  const [themes, setThemes] = useState<MasterEntity[]>([]);
  const [shapes, setShapes] = useState<MasterEntity[]>([]);

  // Products Data
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch Master Data for Sidebar Filters
  useEffect(() => {
    async function loadMasters() {
      try {
        const [catRes, typeRes, matRes, themeRes, shapeRes] = await Promise.all([
          fetch('/api/v1/categories?limit=100').then((r) => r.json()),
          fetch('/api/v1/product-types?limit=100').then((r) => r.json()),
          fetch('/api/v1/materials?limit=100').then((r) => r.json()),
          fetch('/api/v1/themes?limit=100').then((r) => r.json()),
          fetch('/api/v1/shapes?limit=100').then((r) => r.json()),
        ]);

        if (catRes.data) setCategories(catRes.data.items || catRes.data || []);
        if (typeRes.data) setTypes(typeRes.data.items || typeRes.data || []);
        if (matRes.data) setMaterials(matRes.data.items || matRes.data || []);
        if (themeRes.data) setThemes(themeRes.data.items || themeRes.data || []);
        if (shapeRes.data) setShapes(shapeRes.data.items || shapeRes.data || []);
      } catch {}
    }
    loadMasters();
  }, []);

  // Fetch Products based on Active Filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/products?page=${page}&limit=12&sort=${sort}&search=${encodeURIComponent(search)}`;

      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (selectedType) url += `&type=${selectedType}`;
      if (selectedMaterial) url += `&material=${selectedMaterial}`;
      if (selectedTheme) url += `&theme=${selectedTheme}`;
      if (selectedShape) url += `&shape=${selectedShape}`;

      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.data || [];
        setProducts(Array.isArray(items) ? items : []);
        setTotalPages(json.data?.pagination?.totalPages || 1);
        setTotalItems(json.data?.pagination?.totalItems || (Array.isArray(items) ? items.length : 0));
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedType, selectedMaterial, selectedTheme, selectedShape, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedMaterial('');
    setSelectedTheme('');
    setSelectedShape('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div className="border-b border-gray-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A1F36] uppercase tracking-tight">
            Showroom Trophy Catalog
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-sans">
            Browse our full catalog of handcrafted awards, crystal trophies, academic medals, and wooden shields.
          </p>
        </div>

        <div className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
          Showing <strong>{totalItems}</strong> Catalog Items
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Faceted Filter Panel (1-Span) */}
        <div className="space-y-6 bg-[#F8FAFC] border border-gray-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1F36] font-serif flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#C5A55A]" />
              <span>Faceted Filters</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-[11px] text-gray-500 hover:text-[#1A1F36] p-0 h-auto font-semibold"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span>Reset</span>
            </Button>
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search trophies..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-white border-gray-300 text-xs h-10 focus:border-[#C5A55A]"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">Category</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  !selectedCategory ? 'bg-[#1A1F36] text-[#DFCA85]' : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <span>All Categories</span>
                {!selectedCategory && <Check className="w-3.5 h-3.5 text-[#C5A55A]" />}
              </button>
              {categories.map((c) => {
                const active = selectedCategory === c.slug;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setSelectedCategory(c.slug); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      active ? 'bg-[#1A1F36] text-[#DFCA85]' : 'text-gray-600 hover:bg-gray-200/60'
                    }`}
                  >
                    <span>{c.name}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#C5A55A]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Type Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">Product Format</label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => { setSelectedType(''); setPage(1); }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                  !selectedType ? 'bg-[#1A1F36] text-[#DFCA85]' : 'text-gray-600 hover:bg-gray-200/60'
                }`}
              >
                <span>All Formats</span>
                {!selectedType && <Check className="w-3.5 h-3.5 text-[#C5A55A]" />}
              </button>
              {types.map((t) => {
                const active = selectedType === t.slug;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setSelectedType(t.slug); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                      active ? 'bg-[#1A1F36] text-[#DFCA85]' : 'text-gray-600 hover:bg-gray-200/60'
                    }`}
                  >
                    <span>{t.name}</span>
                    {active && <Check className="w-3.5 h-3.5 text-[#C5A55A]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Materials Filter */}
          {materials.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block">Material</label>
              <div className="flex flex-wrap gap-1.5">
                {materials.map((m) => {
                  const active = selectedMaterial === m.slug;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { setSelectedMaterial(active ? '' : m.slug); setPage(1); }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                        active
                          ? 'bg-[#C5A55A] text-[#0F1322] border-[#C5A55A]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Catalog Grid (3-Span) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort Controls Bar */}
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-gray-600 font-mono">
              Displaying page {page} of {totalPages}
            </span>

            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C5A55A]" />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg px-3 py-1.5 focus:border-[#C5A55A] focus:outline-none"
              >
                <option value="newest">Sort by: Newest Releases</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Grid Content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="space-y-3 bg-white border border-gray-200 p-4 rounded-2xl">
                  <Skeleton className="h-48 w-full rounded-xl bg-gray-200" />
                  <Skeleton className="h-4 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-1/2 bg-gray-200" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-[#F8FAFC] border border-dashed border-gray-300 rounded-2xl p-16 text-center max-w-md mx-auto">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-2 opacity-40" />
              <h3 className="text-base font-bold text-[#1A1F36] uppercase font-serif">No Trophies Match Your Criteria</h3>
              <p className="text-xs text-gray-500 mt-1">Try resetting your filter selections or search keywords.</p>
              <Button
                size="sm"
                onClick={handleResetFilters}
                className="mt-4 bg-[#1A1F36] text-[#DFCA85] text-xs font-extrabold uppercase tracking-wider"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="border-gray-300 text-gray-700 text-xs font-bold uppercase h-10 px-4"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Previous</span>
              </Button>

              <span className="text-xs font-bold font-mono text-gray-600">
                Page {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="border-gray-300 text-gray-700 text-xs font-bold uppercase h-10 px-4"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicCatalogPage() {
  return (
    <Suspense fallback={
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C5A55A]" />
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
