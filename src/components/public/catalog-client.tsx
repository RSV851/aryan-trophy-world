'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SlidersHorizontal, RotateCcw, ArrowLeft, ArrowRight, X, Check, Sparkles, Ruler, DollarSign } from 'lucide-react';
import { useInquiryStore } from '@/stores/inquiry-store';
import { toast } from 'sonner';

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
    subcategories?: Array<any>;
    productTypes: Array<any>;
    materials: Array<any>;
    themes: Array<any>;
    shapes: Array<any>;
    collections: Array<any>;
  };
}

// Damerau-Levenshtein distance algorithm (supports adjacent letter swaps like "palqeu" vs "plaque" as just 1 edit per swap)
function getDamerauLevenshteinDistance(a: string, b: string): number {
  const lenA = a.length;
  const lenB = b.length;
  const matrix: number[][] = Array.from({ length: lenB + 1 }, () => Array(lenA + 1).fill(0));

  for (let i = 0; i <= lenB; i++) matrix[i][0] = i;
  for (let j = 0; j <= lenA; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition check (e.g. typing "al" instead of "la", or "eu" instead of "ue")
      if (
        i > 1 &&
        j > 1 &&
        b.charAt(i - 1) === a.charAt(j - 2) &&
        b.charAt(i - 2) === a.charAt(j - 1)
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }
  return matrix[lenB][lenA];
}

const CORE_VOCABULARY = [
  'trophy', 'trophies', 'plaque', 'plaques', 'medal', 'medals', 'pin', 'pins', 'badge', 'badges',
  'crystal', 'wooden', 'wood', 'metal', 'acrylic', 'glass', 'resin', 'marble', 'rosewood', 'mahogany', 'walnut',
  'sports', 'academic', 'corporate', 'religious', 'cricket', 'football', 'basketball', 'debate', 'science', 'arts',
  'cup', 'shield', 'star', 'tower', 'monument', 'obelisk', 'excellence', 'service', 'achievement', 'honor', 'victory',
  'premium', 'classic', 'budget', 'gold', 'silver', 'bronze', 'custom'
];

function normalizeTypoToken(token: string): string {
  if (CORE_VOCABULARY.includes(token)) return token;

  // Requested generous tolerances: up to 3-4 edits for standard words and up to 4-5 edits for longer keywords (5+ characters)
  const maxAllowance = token.length >= 7 ? 5 : (token.length >= 5 ? 4 : (token.length >= 3 ? 3 : 1));

  let bestMatch: string | null = null;
  let minDistance = Infinity;

  for (const vocab of CORE_VOCABULARY) {
    const dist = getDamerauLevenshteinDistance(vocab, token);
    // Full word similarity check
    if (dist <= maxAllowance && dist < minDistance && dist <= Math.floor(Math.max(vocab.length, token.length) * 0.6)) {
      minDistance = dist;
      bestMatch = vocab;
    }
    // Root-prefix check (e.g. comparing "palq" directly to the "plaq" root of "plaque")
    if (vocab.length >= token.length && token.length >= 3) {
      const prefix = vocab.slice(0, token.length);
      const pDist = getDamerauLevenshteinDistance(prefix, token);
      if (pDist <= (token.length >= 4 ? 2 : 1) && pDist < minDistance) {
        minDistance = pDist;
        bestMatch = vocab;
      }
    }
  }

  return bestMatch || token;
}

// Multi-Attribute Matcher with Vocabulary Canonicalization (Prevents "plated" pins/trophies from falsely matching "plaque")
function isFuzzyMultiAttributeMatch(item: any, searchQuery: string): boolean {
  if (!searchQuery || searchQuery.trim() === '') return true;
  
  const rawTokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (rawTokens.length === 0) return true;

  // Canonicalize every search keyword token against Core Vocabulary to heal typos before evaluating products
  const tokens = rawTokens.map(normalizeTypoToken);

  // Aggregate authentic specifications and attributes from this specific product item
  const rawMetadata = [
    item.name,
    item.sku,
    item.categoryName,
    item.categorySlug,
    item.subcategoryName,
    item.subcategorySlug,
    item.typeName,
    item.typeSlug,
    item.materialSlug,
    Array.isArray(item.materials) ? item.materials.join(' ') : item.materials,
    item.themeSlug,
    item.shapeSlug,
    item.collectionSlug,
    item.detailedDescription,
    item.shortDescription,
  ].filter(Boolean).join(' ').toLowerCase();

  const words = Array.from(new Set(rawMetadata.split(/[^a-z0-9]+/))).filter((w: string) => w && w.length > 1);

  // Every canonicalized search keyword token must match an attribute in the item
  return tokens.every((token) => {
    // 1. Direct exact substring or keyword inclusion
    if (rawMetadata.includes(token)) return true;

    // 2. Strict product match (max 1 typo edit) to prevent word collisions like "plaque" matching "plated" or "wood" matching "gold"
    return words.some((word: any) => {
      const w = word as string;
      if (Math.abs(w.length - token.length) > 1) return false;
      return getDamerauLevenshteinDistance(w, token) <= 1;
    });
  });
}

export function CatalogClient({ products: dbProducts, pagination, filters }: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const addItem = useInquiryStore((s) => s.addItem);
  const isInInquiry = useInquiryStore((s) => s.isInInquiry);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isProductInInquiry = (id: string) => (mounted ? isInInquiry(id) : false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  // Interactive Price Range State (matching reference image)
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);

  // Interactive L, B, H Measures & Dimensions Dual Point Range State
  const [minLen, setMinLen] = useState(0);
  const [maxLen, setMaxLen] = useState(100);
  const [minBreadth, setMinBreadth] = useState(0);
  const [maxBreadth, setMaxBreadth] = useState(100);
  const [minHeight, setMinHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(150);

  // Helper to get selected array from comma-separated URL params
  const getSelectedArray = (paramVal: string | null): string[] => {
    if (!paramVal || paramVal === 'all' || paramVal === '') return ['all'];
    return paramVal.split(',').filter(Boolean);
  };

  // Current active parameter arrays (multi-select & redirect fallbacks supported)
  const selectedCategories = getSelectedArray(searchParams?.get('categorySlug') || searchParams?.get('category'));
  const selectedSubcategories = getSelectedArray(searchParams?.get('subcategorySlug') || searchParams?.get('subcategory'));
  const selectedTypes = getSelectedArray(searchParams?.get('typeSlug') || searchParams?.get('type'));
  const selectedMaterials = getSelectedArray(searchParams?.get('materialSlug') || searchParams?.get('material'));
  const selectedThemes = getSelectedArray(searchParams?.get('themeSlug') || searchParams?.get('theme'));
  const selectedShapes = getSelectedArray(searchParams?.get('shapeSlug') || searchParams?.get('shape'));
  const selectedSizes = getSelectedArray(searchParams?.get('sizeUnit'));
  const selectedCollections = getSelectedArray(searchParams?.get('collectionSlug') || searchParams?.get('collection'));
  const selectedAvailability = getSelectedArray(searchParams?.get('availability'));

  const activeSort = searchParams?.get('sortBy') || 'recommended';
  const activeOrder = searchParams?.get('sortOrder') || 'desc';
  const activeSearch = searchParams?.get('search') || '';

  // Toggle multi-select checkbox parameters
  const toggleMultiParam = (paramKey: string, currentSelected: string[], targetSlug: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '');

    if (targetSlug === 'all') {
      params.delete(paramKey);
      if (paramKey === 'categorySlug') {
        params.delete('subcategorySlug');
      }
    } else {
      let newArray = currentSelected.filter((s) => s !== 'all');
      if (newArray.includes(targetSlug)) {
        newArray = newArray.filter((s) => s !== targetSlug);
      } else {
        newArray.push(targetSlug);
      }

      if (newArray.length === 0) {
        params.delete(paramKey);
        if (paramKey === 'categorySlug') {
          params.delete('subcategorySlug');
        }
      } else {
        params.set(paramKey, newArray.join(','));
        if (paramKey === 'categorySlug' && newArray.length === 0) {
          params.delete('subcategorySlug');
        }
      }
    }

    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Clear specific category subcategories independently (Issue #2 fix)
  const handleClearCategorySubs = (catSubSlugs: string[]) => {
    const newSubs = selectedSubcategories.filter((s) => s !== 'all' && !catSubSlugs.includes(s));
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newSubs.length === 0) {
      params.delete('subcategorySlug');
    } else {
      params.set('subcategorySlug', newSubs.join(','));
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    setFilterSearch('');
    setMinPrice(0);
    setMaxPrice(100000);
    setMinLen(0);
    setMaxLen(100);
    setMinBreadth(0);
    setMaxBreadth(100);
    setMinHeight(0);
    setMaxHeight(150);
    router.push(pathname, { scroll: false });
  };

  const activeCount = [
    !selectedCategories.includes('all') ? selectedCategories.length : 0,
    !selectedSubcategories.includes('all') ? selectedSubcategories.length : 0,
    !selectedTypes.includes('all') ? selectedTypes.length : 0,
    !selectedMaterials.includes('all') ? selectedMaterials.length : 0,
    !selectedThemes.includes('all') ? selectedThemes.length : 0,
    !selectedShapes.includes('all') ? selectedShapes.length : 0,
    !selectedSizes.includes('all') ? selectedSizes.length : 0,
    !selectedCollections.includes('all') ? selectedCollections.length : 0,
    !selectedAvailability.includes('all') ? selectedAvailability.length : 0,
    minPrice > 0 || maxPrice < 100000 ? 1 : 0,
    minLen > 0 || maxLen < 100 || minBreadth > 0 || maxBreadth < 100 || minHeight > 0 || maxHeight < 150 ? 1 : 0,
    activeSearch ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Process DB products and apply all active filters & sliders
  const combinedProducts = useMemo(() => {
    const merged = (dbProducts || []).map((p) => {
      const numPrice = p.numericPrice || parseInt(String(p.priceRange).replace(/[^0-9]/g, ''), 10) || 15000;
      return {
        ...p,
        imageUrl: p.imageUrl || '',
        categorySlug: p.categorySlug || 'all',
        subcategorySlug: p.subcategorySlug || 'all',
        typeSlug: p.typeSlug || 'all',
        materialSlug: p.materialSlug || 'all',
        themeSlug: p.themeSlug || 'all',
        shapeSlug: p.shapeSlug || 'all',
        collectionSlug: p.collectionSlug || 'premium',
        availability: p.availability || 'in_stock',
        numericPrice: numPrice,
        dimL: p.dimL || 20,
        dimB: p.dimB || 15,
        dimH: p.dimH || 35,
      };
    });

    // Apply slider range filtering & active search matching (SQL already handles category/material/theme/collection filtering)
    return merged.filter((item) => {

      // Price Slider filter
      const p = item.numericPrice || 15000;
      if (p < minPrice || p > maxPrice) return false;

      // L, B, H Dimensions filter (Dual MIN/MAX check)
      const dl = item.dimL || 20;
      const db = item.dimB || 15;
      const dh = item.dimH || 35;
      if (dl < minLen || dl > maxLen) return false;
      if (db < minBreadth || db > maxBreadth) return false;
      if (dh < minHeight || dh > maxHeight) return false;

      // Multi-Attribute & Fuzzy Typo-Tolerant Keyword Search (searches Names, Categories, Subcategories, Types, Materials, Themes & Shapes)
      if (activeSearch && !isFuzzyMultiAttributeMatch(item, activeSearch)) return false;

      return true;
    });
  }, [
    dbProducts,
    selectedCategories,
    selectedSubcategories,
    selectedTypes,
    selectedMaterials,
    selectedThemes,
    selectedShapes,
    selectedSizes,
    selectedCollections,
    selectedAvailability,
    minPrice,
    maxPrice,
    minLen,
    maxLen,
    minBreadth,
    maxBreadth,
    minHeight,
    maxHeight,
    activeSearch,
  ]);

  // Master Lists for accordions
  const masterCategories = useMemo(() => {
    const cats = (filters.categories && filters.categories.length > 0) ? filters.categories : [
      { id: 'cat-1', name: 'Sports', slug: 'sports' },
      { id: 'cat-2', name: 'Academic', slug: 'academic' },
      { id: 'cat-3', name: 'Corporate', slug: 'corporate' },
    ];
    const subcats: Array<any> = (filters.subcategories && filters.subcategories.length > 0) ? filters.subcategories : [
      { id: 'sub-1', categoryId: 'cat-1', name: 'Cricket', slug: 'cricket' },
      { id: 'sub-2', categoryId: 'cat-1', name: 'Football', slug: 'football' },
      { id: 'sub-3', categoryId: 'cat-1', name: 'Basketball', slug: 'basketball' },
      { id: 'sub-4', categoryId: 'cat-1', name: 'Athletics', slug: 'athletics' },
      { id: 'sub-5', categoryId: 'cat-2', name: 'Science', slug: 'science' },
      { id: 'sub-6', categoryId: 'cat-2', name: 'Arts', slug: 'arts' },
      { id: 'sub-7', categoryId: 'cat-2', name: 'Debate', slug: 'debate' },
      { id: 'sub-8', categoryId: 'cat-3', name: 'Achievement', slug: 'achievement' },
      { id: 'sub-9', categoryId: 'cat-3', name: 'Service', slug: 'service' },
      { id: 'sub-10', categoryId: 'cat-3', name: 'Leadership', slug: 'leadership' },
    ];
    return cats.map((cat: any) => ({
      ...cat,
      subs: subcats.filter((s: any) => s.categoryId === cat.id || (cat.slug === 'sports' && ['cricket','football','basketball','athletics'].includes(s.slug)) || (cat.slug === 'academic' && ['science','arts','debate'].includes(s.slug)) || (cat.slug === 'corporate' && ['achievement','service','leadership'].includes(s.slug))),
    }));
  }, [filters.categories, filters.subcategories]);

  const masterTypes = (filters.productTypes && filters.productTypes.length > 0) ? filters.productTypes : [
    { id: 't-1', name: 'Trophy', slug: 'trophy' },
    { id: 't-2', name: 'Medal', slug: 'medal' },
    { id: 't-3', name: 'Plaque', slug: 'plaque' },
    { id: 't-4', name: 'Cup', slug: 'cup' },
    { id: 't-5', name: 'Pin', slug: 'pin' },
  ];

  const masterMaterials = (filters.materials && filters.materials.length > 0) ? filters.materials : [
    { id: 'm-1', name: 'Metal', slug: 'metal' },
    { id: 'm-2', name: 'Wooden', slug: 'wooden' },
    { id: 'm-3', name: 'Crystal', slug: 'crystal' },
    { id: 'm-4', name: 'Acrylic', slug: 'acrylic' },
    { id: 'm-5', name: 'Resin', slug: 'resin' },
  ];

  const masterThemes = (filters.themes && filters.themes.length > 0) ? filters.themes : [
    { id: 'th-1', name: 'Sports', slug: 'sports' },
    { id: 'th-2', name: 'Academic', slug: 'academic' },
    { id: 'th-3', name: 'Corporate', slug: 'corporate' },
    { id: 'th-4', name: 'General', slug: 'general' },
  ];

  const masterShapes = (filters.shapes && filters.shapes.length > 0) ? filters.shapes : [
    { id: 'sh-1', name: 'Cup', slug: 'cup' },
    { id: 'sh-2', name: 'Shield', slug: 'shield' },
    { id: 'sh-3', name: 'Star', slug: 'star' },
    { id: 'sh-4', name: 'Figurine', slug: 'figurine' },
  ];

  const masterSizes = [
    { id: 'sz-1', name: 'Centimeters (cm)', slug: 'cm' },
    { id: 'sz-2', name: 'Inches (in)', slug: 'inch' },
    { id: 'sz-3', name: 'Millimeters (mm)', slug: 'mm' },
    { id: 'sz-4', name: 'Feet (ft)', slug: 'feet' },
  ];

  const masterCollections = (filters.collections && filters.collections.length > 0) ? filters.collections : [
    { id: 'col-1', name: 'Premium Series', slug: 'premium' },
    { id: 'col-2', name: 'Classic Range', slug: 'classic' },
    { id: 'col-3', name: 'Budget Excellence', slug: 'budget' },
  ];

  const masterAvailability = [
    { id: 'av-1', name: 'In Stock & Ready', slug: 'in_stock' },
    { id: 'av-2', name: 'Custom Order (Engraving)', slug: 'custom_order' },
    { id: 'av-3', name: 'Wholesale Batch Only', slug: 'wholesale_batch' },
  ];

  // 4-SCENARIO HIERARCHICAL SECTION & GROUPING ENGINE (FINAL DESIGNS)
  const groupedShowroom = useMemo(() => {
    const sections: Array<{
      sectionTitle: string;
      sectionSubtitle?: string;
      isScenario1?: boolean;
      itemsDirect?: typeof combinedProducts;
      innerCategorySections?: Array<{
        categoryTitle: string;
        subsections: Array<{
          subTitle: string;
          items: typeof combinedProducts;
        }>;
      }>;
    }> = [];

    const hasSecondaryFilters =
      !selectedMaterials.includes('all') ||
      !selectedThemes.includes('all') ||
      !selectedShapes.includes('all') ||
      !selectedCollections.includes('all');

    // SCENARIO 4: Search Query Active
    if (activeSearch && activeSearch.trim() !== '') {
      const directMatches = combinedProducts.filter((p) =>
        p.name?.toLowerCase().includes(activeSearch.toLowerCase())
      );
      const otherMatches = combinedProducts.filter(
        (p) => !p.name?.toLowerCase().includes(activeSearch.toLowerCase())
      );

      const catMap = new Map<string, typeof combinedProducts>();
      otherMatches.forEach((p) => {
        const cName = p.categoryName || 'Catalog Showcase';
        if (!catMap.has(cName)) catMap.set(cName, []);
        catMap.get(cName)!.push(p);
      });

      const subList: Array<{ subTitle: string; items: typeof combinedProducts }> = [];
      if (directMatches.length > 0) {
        subList.push({
          subTitle: `Direct Title Matches (${directMatches.length})`,
          items: directMatches,
        });
      }
      catMap.forEach((items, catName) => {
        subList.push({
          subTitle: `${catName} Category Matches`,
          items,
        });
      });

      sections.push({
        sectionTitle: `Search Results for "${activeSearch}"`,
        sectionSubtitle: `Found ${combinedProducts.length} awards matching query`,
        innerCategorySections: [
          {
            categoryTitle: `Matching Results`,
            subsections: subList,
          },
        ],
      });
      return sections;
    }

    // SCENARIO 3: Secondary Filters Selected (Case A, B, C Handling)
    if (hasSecondaryFilters) {
      const numActiveSecondaryTabs =
        (!selectedMaterials.includes('all') ? 1 : 0) +
        (!selectedThemes.includes('all') ? 1 : 0) +
        (!selectedShapes.includes('all') ? 1 : 0) +
        (!selectedCollections.includes('all') ? 1 : 0);

      const activeMats = selectedMaterials.includes('all') ? ['all'] : selectedMaterials;
      const activeThms = selectedThemes.includes('all') ? ['all'] : selectedThemes;
      const activeShps = selectedShapes.includes('all') ? ['all'] : selectedShapes;
      const activeCols = selectedCollections.includes('all') ? ['all'] : selectedCollections;

      // Build Cross-Product Combinations
      const combos: Array<{ title: string; prefixTitle: string; mat?: string; thm?: string; shp?: string; col?: string }> = [];
      activeMats.forEach((mat) => {
        activeThms.forEach((thm) => {
          activeShps.forEach((shp) => {
            activeCols.forEach((col) => {
              const parts: string[] = [];
              let singlePrefix = '';
              if (mat !== 'all') {
                const mObj = masterMaterials.find((m) => m.slug === mat);
                const name = mObj ? mObj.name : mat;
                parts.push(`💎 ${name}`);
                singlePrefix = `CRAFT MATERIAL: ${name.toUpperCase()}`;
              }
              if (thm !== 'all') {
                const tObj = masterThemes.find((t) => t.slug === thm);
                const name = tObj ? tObj.name : thm;
                parts.push(`🎓 ${name}`);
                singlePrefix = `DESIGN THEME: ${name.toUpperCase()}`;
              }
              if (shp !== 'all') {
                const sObj = masterShapes.find((s) => s.slug === shp);
                const name = sObj ? sObj.name : shp;
                parts.push(`⚡ ${name}`);
                singlePrefix = `TROPHY SHAPE: ${name.toUpperCase()}`;
              }
              if (col !== 'all') {
                const cObj = masterCollections.find((c) => c.slug === col);
                const name = cObj ? cObj.name : col;
                parts.push(`🏆 ${name}`);
                singlePrefix = `COLLECTION: ${name.toUpperCase()}`;
              }

              if (parts.length > 0) {
                const comboTitle = numActiveSecondaryTabs === 1 ? singlePrefix : `COMBINATION: ${parts.join('  •  ')}`;
                combos.push({ title: comboTitle, prefixTitle: singlePrefix, mat, thm, shp, col });
              }
            });
          });
        });
      });

      const formatSlug = (str?: string) => (str || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      combos.forEach((combo) => {
        const comboItems = combinedProducts.filter((p) => {
          if (combo.mat && combo.mat !== 'all') {
            const targetMat = formatSlug(combo.mat);
            const matchesMat =
              formatSlug(p.materialSlug) === targetMat ||
              p.materials?.some((m: string) => formatSlug(m).includes(targetMat) || targetMat.includes(formatSlug(m)));
            if (!matchesMat) return false;
          }
          if (combo.thm && combo.thm !== 'all') {
            const targetThm = formatSlug(combo.thm);
            const matchesThm =
              formatSlug(p.themeSlug) === targetThm ||
              p.themes?.some((t: string) => formatSlug(t).includes(targetThm) || targetThm.includes(formatSlug(t)));
            if (!matchesThm) return false;
          }
          if (combo.shp && combo.shp !== 'all') {
            const targetShp = formatSlug(combo.shp);
            const matchesShp =
              formatSlug(p.shapeSlug) === targetShp ||
              p.shapes?.some((s: string) => formatSlug(s).includes(targetShp) || targetShp.includes(formatSlug(s)));
            if (!matchesShp) return false;
          }
          if (combo.col && combo.col !== 'all') {
            const targetCol = formatSlug(combo.col);
            const matchesCol =
              formatSlug(p.collectionSlug) === targetCol ||
              p.collections?.some((c: string) => formatSlug(c).includes(targetCol) || targetCol.includes(formatSlug(c)));
            if (!matchesCol) return false;
          }
          return true;
        });

        // Fallback: If comboItems is empty but backend SQL returned combinedProducts for this active secondary filter, use combinedProducts
        const itemsToUse = comboItems.length > 0 ? comboItems : combinedProducts;

        if (itemsToUse.length > 0) {
          // CASE C: Multiple Secondary Filter Tabs Selected -> Direct Horizontal Card Row under Combination Header
          if (numActiveSecondaryTabs > 1) {
            sections.push({
              sectionTitle: combo.title,
              sectionSubtitle: `Displaying ${itemsToUse.length} designs matching this combination`,
              isScenario1: true,
              itemsDirect: itemsToUse,
            });
          } else {
            // CASE A & CASE B: Single Secondary Filter Tab Selected -> Category Inner Sections -> Subcategory Groups -> Cards
            const catMap = new Map<string, typeof combinedProducts>();
            itemsToUse.forEach((p) => {
              const cName = p.categoryName || 'General Showcase';
              if (!catMap.has(cName)) catMap.set(cName, []);
              catMap.get(cName)!.push(p);
            });

            const innerCatSections: Array<{
              categoryTitle: string;
              subsections: Array<{ subTitle: string; items: typeof combinedProducts }>;
            }> = [];

            catMap.forEach((cItems, catName) => {
              const subMap = new Map<string, typeof combinedProducts>();
              cItems.forEach((p) => {
                const sName = p.subcategoryName || 'Featured Series';
                if (!subMap.has(sName)) subMap.set(sName, []);
                subMap.get(sName)!.push(p);
              });

              const subList: Array<{ subTitle: string; items: typeof combinedProducts }> = [];
              subMap.forEach((sItems, subName) => {
                subList.push({ subTitle: `${subName} Series`, items: sItems });
              });

              innerCatSections.push({
                categoryTitle: `${catName} Category`,
                subsections: subList,
              });
            });

            sections.push({
              sectionTitle: combo.title,
              sectionSubtitle: `Displaying ${comboItems.length} designs matching this attribute`,
              innerCategorySections: innerCatSections,
            });
          }
        }
      });

      if (sections.length > 0) return sections;
    }

    // SCENARIO 2: Category or Multiple Categories Selected
    if (!selectedCategories.includes('all')) {
      selectedCategories.forEach((catSlug) => {
        const catObj = masterCategories.find((c) => c.slug === catSlug);
        const catName = catObj ? catObj.name : catSlug;
        const catItems = combinedProducts.filter((p) => p.categorySlug === catSlug || p.categoryName?.toLowerCase() === catName.toLowerCase());

        if (catItems.length > 0) {
          const subMap = new Map<string, typeof combinedProducts>();
          catItems.forEach((p) => {
            const sName = p.subcategoryName || 'Featured Series';
            if (!subMap.has(sName)) subMap.set(sName, []);
            subMap.get(sName)!.push(p);
          });

          const subList: Array<{ subTitle: string; items: typeof combinedProducts }> = [];
          subMap.forEach((sItems, subName) => {
            subList.push({ subTitle: `${subName} Series`, items: sItems });
          });

          sections.push({
            sectionTitle: `${catName} Category`,
            sectionSubtitle: `Handcrafted ${catName.toLowerCase()} championship & corporate awards`,
            innerCategorySections: [
              {
                categoryTitle: `${catName} Category`,
                subsections: subList,
              },
            ],
          });
        }
      });

      if (sections.length > 0) return sections;
    }

    // SCENARIO 1: Default / All Selected (No Filters Active)
    masterCategories.forEach((catObj) => {
      const catItems = combinedProducts.filter((p) => {
        return (
          p.categoryId === catObj.id ||
          p.categorySlug?.toLowerCase() === catObj.slug?.toLowerCase() ||
          p.categoryName?.toLowerCase() === catObj.name?.toLowerCase()
        );
      });

      if (catItems.length > 0) {
        sections.push({
          sectionTitle: `${catObj.name} Category`,
          sectionSubtitle: `Curated ${catObj.name.toLowerCase()} championship & recognition monuments`,
          isScenario1: true,
          itemsDirect: catItems,
        });
      }
    });

    const capturedIds = new Set(sections.flatMap((sec) => sec.itemsDirect?.map((i) => i.id) || sec.innerCategorySections?.flatMap((c) => c.subsections.flatMap((sub) => sub.items.map((i) => i.id))) || []));
    const remainder = combinedProducts.filter((i) => !capturedIds.has(i.id));

    if (remainder.length > 0) {
      sections.push({
        sectionTitle: 'Atelier Heritage Showcase',
        sectionSubtitle: 'Handcrafted trophies and precision monuments',
        isScenario1: true,
        itemsDirect: remainder,
      });
    }

    return sections;
  }, [
    combinedProducts,
    selectedCategories,
    selectedSubcategories,
    selectedTypes,
    selectedMaterials,
    selectedThemes,
    selectedShapes,
    selectedCollections,
    activeSearch,
    masterCategories,
    masterMaterials,
    masterThemes,
    masterShapes,
    masterCollections,
  ]);

  // HELPER: Render Product Card with Badges & Availability Ribbon
  const renderProductCard = (prod: (typeof combinedProducts)[0]) => {
    const img = prod.imageUrl || '/images/trophies/gold-cup.jpg';
    const catLabel = prod.categoryName || 'Prestige Collection';
    const subLabel = prod.subcategoryName ? ` • ${prod.subcategoryName}` : '';
    const typeLabel = prod.typeName || 'AWARD';

    // Availability Status fetched directly from DB
    const rawAvail = (prod.availability || 'in_stock').toLowerCase();
    const availBadgeText =
      rawAvail === 'in_stock'
        ? 'IN STOCK'
        : rawAvail === 'pre_order'
        ? 'PRE-ORDER'
        : rawAvail === 'bespoke'
        ? 'BESPOKE'
        : 'IN STOCK';

    const rawNum = prod.numericPrice || parseInt(String(prod.priceRange || '').replace(/[^0-9]/g, ''), 10) || 14999;
    const minStartingPrice = isNaN(rawNum) ? '₹14,999' : `₹${rawNum.toLocaleString('en-IN')}`;
    const dims = `${prod.dimL || 20} × ${prod.dimB || 15} × ${prod.dimH || 35} ${prod.sizeUnit || 'cm'}`;

    return (
      <div
        key={prod.id}
        className="w-[280px] sm:w-[320px] max-w-[340px] shrink-0 group flex flex-col rounded-2xl overflow-hidden bg-card border border-border hover:border-primary hover:shadow-md transition-all duration-500 hover:-translate-y-1.5 relative"
      >
        {/* Top Image Showcase Container */}
        <Link href={`/products/${prod.slug || prod.id}`} className="relative aspect-[4/5] overflow-hidden block bg-muted/40">
          
          {/* Top-Left Horizontal Product Type Pill Badge */}
          <span className="absolute top-3.5 left-3.5 z-10 bg-card/90 backdrop-blur-md text-primary border border-primary/40 text-[9px] font-mono px-3 py-1 rounded-full uppercase font-bold tracking-widest shadow-md">
            {typeLabel}
          </span>

          {/* Top-Right Vertical Ribbon Bookmark Availability Badge (Direct DB Status) */}
          <div className="absolute top-0 right-3.5 z-20 flex flex-col items-center">
            <div className="bg-primary text-white text-[9px] font-black uppercase tracking-tighter px-2 pt-2.5 pb-1 shadow-xl text-center leading-none rounded-b-sm border-x border-b border-black/30 font-mono">
              <span>{availBadgeText}</span>
            </div>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[7px] border-t-primary" />
          </div>

          {/* Dimensions Label */}
          <span className="absolute bottom-3 right-3 z-10 bg-card/90 text-foreground border border-border text-[9px] font-mono px-2.5 py-1 rounded uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">
            {dims}
          </span>

          <Image
            alt={prod.name}
            src={img}
            fill
            sizes="320px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
        </Link>

        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <p className="text-primary/80 text-[10px] uppercase font-bold tracking-widest mb-1 font-sans">
              {catLabel}{subLabel}
            </p>
            <Link href={`/products/${prod.slug || prod.id}`}>
              <h3 className="text-base sm:text-lg font-display font-normal text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {prod.name}
              </h3>
            </Link>
            <p className="text-muted-foreground text-[10px] font-mono mt-1 uppercase tracking-wider">
              SKU: {prod.sku || 'AT-GEN'}
            </p>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold font-sans">As low as</p>
              <span className="text-primary font-bold text-base sm:text-lg tracking-tight font-sans">
                {minStartingPrice}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem({
                  productId: prod.id,
                  slug: prod.slug || prod.id,
                  name: prod.name,
                  sku: prod.sku || 'AT-GEN',
                  imageUrl: img,
                  priceRange: minStartingPrice,
                  categoryName: catLabel || 'Trophy Collection',
                  quantity: 25,
                });
                toast.success(`${prod.sku || prod.name} added to your Inquiry & Contact form!`);
              }}
              className={`font-black px-3.5 py-2 rounded-xl text-[9px] uppercase tracking-widest transition-all duration-300 shadow-md ${
                isProductInInquiry(prod.id)
                  ? 'bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-700'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {isProductInInquiry(prod.id) ? '✓ IN INQUIRY' : '+ ADD INQUIRY'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // SPECIAL HELPER 1: Render ALL Button WITHOUT Checkbox (Issue #1 Fix)
  const renderAllButton = (label: string, isSelected: boolean, onClick: () => void, isSub: boolean = false) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all font-sans ${isSub ? 'text-[11px] py-1.5' : 'text-xs'} ${
          isSelected
            ? 'bg-primary text-white font-extrabold shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground bg-muted/40'
        }`}
      >
        <span className="uppercase tracking-wider select-none">{label}</span>
      </button>
    );
  };

  // HELPER 2: Render Multi-Select Checkbox Option (For standard items only)
  const renderCheckboxOption = (paramKey: string, currentSelected: string[], item: { name: string; slug: string }, isSub: boolean = false) => {
    const isChecked = currentSelected.includes(item.slug);
    return (
      <div
        key={item.slug}
        onClick={() => toggleMultiParam(paramKey, currentSelected, item.slug)}
        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-all font-sans ${isSub ? 'text-[11px]' : 'text-xs'} ${
          isChecked ? 'bg-primary/10 text-primary font-bold border border-primary/40 shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <div className="flex items-center space-x-3 pointer-events-none">
          <div
            className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
              isChecked ? 'bg-primary border-primary text-white' : 'border-border bg-transparent'
            }`}
          >
            {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
          </div>
          <span className="tracking-wide select-none">{item.name}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-white transition-colors duration-300">
      
      {/* Full-width responsive container without side gaps */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-10 sm:py-16">
        
        {/* Header & Breadcrumbs */}
        <div className="mb-10 sm:mb-14">
          <nav className="text-muted-foreground font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold mb-3 sm:mb-4 flex items-center space-x-2">
            <Link href="/" className="hover:text-primary transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-primary">SHOWROOM CATALOG</span>
            {!selectedCategories.includes('all') && (
              <>
                <span>/</span>
                <span className="text-foreground capitalize">{selectedCategories.join(', ')}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-light text-foreground tracking-tight">
                The Trophy Atelier Collection
              </h1>
              <p className="text-muted-foreground mt-3 sm:mt-4 max-w-2xl text-xs sm:text-base md:text-lg leading-relaxed font-sans">
                Explore our organized hierarchy of luxury sports cups, corporate memorials, and academic plaques. Customize price ranges, measurements, and specs below.
              </p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex-1 sm:flex-none bg-card hover:bg-muted text-foreground px-5 py-3 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 border border-border shadow-sm transition-all"
              >
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>Filters ({activeCount})</span>
              </button>

              {/* Sort Dropdown featuring ALL / RECOMMENDED option at top */}
              <select
                value={`${activeSort}-${activeOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  const params = new URLSearchParams(searchParams?.toString() || '');
                  params.set('sortBy', sort);
                  params.set('sortOrder', order);
                  router.push(`${pathname}?${params.toString()}`, { scroll: false });
                }}
                className="bg-card border border-border text-xs font-bold text-foreground px-4 py-3 rounded-xl uppercase tracking-widest outline-none focus:border-primary transition-colors w-full sm:w-auto cursor-pointer"
              >
                <option value="recommended-desc" className="bg-card text-foreground">All / Recommended</option>
                <option value="createdAt-desc" className="bg-card text-foreground">Newest Arrivals</option>
                <option value="name-asc" className="bg-card text-foreground">Name A - Z</option>
                <option value="name-desc" className="bg-card text-foreground">Name Z - A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Showroom Layout Grid (Sidebar + Main Content) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 sm:gap-10 items-start">
          
          {/* SIDEBAR FILTERS */}
          <aside
            className={`lg:col-span-1 lg:sticky lg:top-28 flex flex-col gap-6 backdrop-blur-2xl bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-md z-40 transition-all ${
              mobileOpen ? 'block fixed inset-4 z-50 overflow-y-auto bg-card border-2 border-primary shadow-2xl' : 'hidden lg:flex'
            }`}
          >
            {mobileOpen && (
              <div className="flex items-center justify-between lg:hidden pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-display font-medium text-xl text-foreground">Filter Showroom</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-6 h-6 text-primary" />
                </button>
              </div>
            )}

            {/* Search Filter Box */}
            <div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Search filter options..."
                  className="bg-background border border-border rounded-xl py-2.5 pl-3 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all w-full font-sans"
                />
                <span className="material-symbols-outlined absolute right-2.5 text-primary text-base pointer-events-none">search</span>
              </div>
            </div>

            {/* Clear Filters Action */}
            {activeCount > 0 && (
              <button
                onClick={handleReset}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/40 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Selected ({activeCount})</span>
              </button>
            )}

            {/* 1. CATEGORY & NESTED SUBCATEGORY ACCORDION */}
            <details className="group border-b border-border pb-5" open>
              <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                <span className="text-sm font-display font-medium text-primary tracking-wider uppercase flex items-center gap-2">
                  <span>1. Category</span>
                  {!selectedCategories.includes('all') && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180 text-lg">expand_more</span>
              </summary>

              <div className="mt-4 space-y-2.5">
                {renderAllButton('All Categories', selectedCategories.includes('all'), () => toggleMultiParam('categorySlug', selectedCategories, 'all'))}

                {masterCategories
                  .filter((c) => !filterSearch || c.name.toLowerCase().includes(filterSearch.toLowerCase()) || c.subs?.some((s: any) => s.name.toLowerCase().includes(filterSearch.toLowerCase())))
                  .map((cat) => {
                    const isSelected = selectedCategories.includes(cat.slug);
                    const catSubSlugs = cat.subs?.map((s: any) => s.slug) || [];
                    const isCatAllSubSelected = selectedSubcategories.includes('all') || !selectedSubcategories.some((slug) => catSubSlugs.includes(slug));

                    return (
                      <div key={cat.id} className="space-y-1">
                        {renderCheckboxOption('categorySlug', selectedCategories, { name: `${cat.name} (${cat.subs?.length || 0})`, slug: cat.slug })}

                        {/* NESTED SUBCATEGORIES: Expands directly beneath when Category is checked */}
                        {isSelected && cat.subs && cat.subs.length > 0 && (
                          <div className="pl-3.5 pr-1 py-2 my-1 border-l-2 border-primary/60 space-y-1.5 bg-muted/30 rounded-r-xl">
                            <p className="text-[10px] text-primary uppercase font-bold tracking-widest px-2 mb-1">
                              ↳ Select {cat.name} Series:
                            </p>
                            
                            {renderAllButton(`All ${cat.name} Series`, isCatAllSubSelected, () => handleClearCategorySubs(catSubSlugs), true)}

                            {cat.subs.map((sub: any) => renderCheckboxOption('subcategorySlug', selectedSubcategories, sub, true))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </details>

            {/* 2. AWARD TYPE ACCORDION */}
            <details className="group border-b border-border pb-5" open>
              <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                <span className="text-sm font-display font-medium text-primary tracking-wider uppercase flex items-center gap-2">
                  <span>2. Award Type</span>
                  {!selectedTypes.includes('all') && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180 text-lg">expand_more</span>
              </summary>
              <div className="mt-4 space-y-1.5">
                {renderAllButton('All Award Types', selectedTypes.includes('all'), () => toggleMultiParam('typeSlug', selectedTypes, 'all'))}
                {masterTypes
                  .filter((t) => !filterSearch || t.name.toLowerCase().includes(filterSearch.toLowerCase()))
                  .map((t) => renderCheckboxOption('typeSlug', selectedTypes, t))}
              </div>
            </details>

            {/* 3. MATERIAL ACCORDION */}
            <details className="group border-b border-border pb-5" open>
              <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                <span className="text-sm font-display font-medium text-primary tracking-wider uppercase flex items-center gap-2">
                  <span>3. Craft Material</span>
                  {!selectedMaterials.includes('all') && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180 text-lg">expand_more</span>
              </summary>
              <div className="mt-4 space-y-1.5">
                {renderAllButton('All Materials', selectedMaterials.includes('all'), () => toggleMultiParam('materialSlug', selectedMaterials, 'all'))}
                {masterMaterials
                  .filter((m) => !filterSearch || m.name.toLowerCase().includes(filterSearch.toLowerCase()))
                  .map((m) => renderCheckboxOption('materialSlug', selectedMaterials, m))}
              </div>
            </details>

            {/* 4. DESIGN THEME ACCORDION */}
            <details className="group border-b border-border pb-5" open>
              <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                <span className="text-sm font-display font-medium text-primary tracking-wider uppercase flex items-center gap-2">
                  <span>4. Design Theme</span>
                  {!selectedThemes.includes('all') && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180 text-lg">expand_more</span>
              </summary>
              <div className="mt-4 space-y-1.5">
                {renderAllButton('All Themes', selectedThemes.includes('all'), () => toggleMultiParam('themeSlug', selectedThemes, 'all'))}
                {masterThemes
                  .filter((th) => !filterSearch || th.name.toLowerCase().includes(filterSearch.toLowerCase()))
                  .map((th) => renderCheckboxOption('themeSlug', selectedThemes, th))}
              </div>
            </details>

            {/* 5. TROPHY SHAPE ACCORDION */}
            <details className="group border-b border-border pb-5" open>
              <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                <span className="text-sm font-display font-medium text-primary tracking-wider uppercase flex items-center gap-2">
                  <span>5. Trophy Shape</span>
                  {!selectedShapes.includes('all') && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180 text-lg">expand_more</span>
              </summary>
              <div className="mt-4 space-y-1.5">
                {renderAllButton('All Shapes', selectedShapes.includes('all'), () => toggleMultiParam('shapeSlug', selectedShapes, 'all'))}
                {masterShapes
                  .filter((s) => !filterSearch || s.name.toLowerCase().includes(filterSearch.toLowerCase()))
                  .map((s) => renderCheckboxOption('shapeSlug', selectedShapes, s))}
              </div>
            </details>

            {/* 6. SIZES & MEASURED DIMENSIONS (Dual MIN/MAX points for L, B, and H) */}
            <details className="group border-b border-border pb-5" open>
              <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                <span className="text-sm font-display font-medium text-primary tracking-wider uppercase flex items-center gap-2">
                  <span>6. Sizes & Measures</span>
                  {(!selectedSizes.includes('all') || minLen > 0 || maxLen < 100 || minBreadth > 0 || maxBreadth < 100 || minHeight > 0 || maxHeight < 150) && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </span>
                <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180 text-lg">expand_more</span>
              </summary>

              <div className="mt-4 space-y-5 font-sans">
                {renderAllButton('All Size Units & Measures', selectedSizes.includes('all') && minLen === 0 && maxLen === 100 && minBreadth === 0 && maxBreadth === 100 && minHeight === 0 && maxHeight === 150, () => {
                  setMinLen(0);
                  setMaxLen(100);
                  setMinBreadth(0);
                  setMaxBreadth(100);
                  setMinHeight(0);
                  setMaxHeight(150);
                  toggleMultiParam('sizeUnit', selectedSizes, 'all');
                })}

                <div className="space-y-1.5">
                  <p className="text-[10px] text-white/60 font-mono uppercase font-bold tracking-widest px-1">Measurement Units:</p>
                  {masterSizes
                    .filter((sz) => !filterSearch || sz.name.toLowerCase().includes(filterSearch.toLowerCase()))
                    .map((sz) => renderCheckboxOption('sizeUnit', selectedSizes, sz))}
                </div>

                {/* DUAL POINT RANGE BARS FOR L, B, H */}
                <div className="pt-3 border-t border-border space-y-5">
                  <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold tracking-wider uppercase">
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Measures & Dimensions (L × B × H)</span>
                  </div>

                  {/* Length (L) Dual Range Bar & Inputs */}
                  <div className="bg-muted/40 border border-border rounded-2xl p-3.5 space-y-4 shadow-inner">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-primary font-bold font-mono text-[11px] uppercase tracking-wider">Length (L) Range</span>
                      <span className="text-[10px] text-muted-foreground font-mono">Min & Max</span>
                    </div>

                    <div className="relative w-full h-6 flex items-center">
                      <div className="absolute w-full h-2 bg-muted rounded-full" />
                      <div
                        className="absolute h-2 bg-primary rounded-full transition-all"
                        style={{
                          left: `${Math.min(100, (minLen / 100) * 100)}%`,
                          right: `${Math.max(0, 100 - (maxLen / 100) * 100)}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={minLen}
                        onChange={(e) => setMinLen(Math.min(Number(e.target.value), maxLen - 1))}
                        className="absolute w-full pointer-events-none appearance-none bg-transparent h-2 z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:cursor-pointer shadow"
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={maxLen}
                        onChange={(e) => setMaxLen(Math.max(Number(e.target.value), minLen + 1))}
                        className="absolute w-full pointer-events-none appearance-none bg-transparent h-2 z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:cursor-pointer shadow"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-widest text-muted-foreground font-mono mb-1">MIN (L)</label>
                        <div className="flex items-center bg-background border border-border rounded-xl px-2.5 py-1.5 focus-within:border-primary">
                          <input
                            type="number"
                            min={0}
                            max={maxLen}
                            value={minLen}
                            onChange={(e) => setMinLen(Math.min(Number(e.target.value) || 0, maxLen))}
                            className="w-full bg-transparent text-foreground font-mono text-xs font-bold outline-none border-none p-0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-widest text-muted-foreground font-mono mb-1">MAX (L)</label>
                        <div className="flex items-center bg-background border border-border rounded-xl px-2.5 py-1.5 focus-within:border-primary">
                          <input
                            type="number"
                            min={minLen}
                            max={200}
                            value={maxLen}
                            onChange={(e) => setMaxLen(Math.max(Number(e.target.value) || minLen, minLen))}
                            className="w-full bg-transparent text-foreground font-mono text-xs font-bold outline-none border-none p-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Breadth / Width (B) Dual Range Bar & Inputs */}
                  <div className="bg-muted/40 border border-border rounded-2xl p-3.5 space-y-4 shadow-inner">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-primary font-bold font-mono text-[11px] uppercase tracking-wider">Breadth (B) Range</span>
                      <span className="text-[10px] text-muted-foreground font-mono">Min & Max</span>
                    </div>

                    <div className="relative w-full h-6 flex items-center">
                      <div className="absolute w-full h-2 bg-muted rounded-full" />
                      <div
                        className="absolute h-2 bg-primary rounded-full transition-all"
                        style={{
                          left: `${Math.min(100, (minBreadth / 100) * 100)}%`,
                          right: `${Math.max(0, 100 - (maxBreadth / 100) * 100)}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={minBreadth}
                        onChange={(e) => setMinBreadth(Math.min(Number(e.target.value), maxBreadth - 1))}
                        className="absolute w-full pointer-events-none appearance-none bg-transparent h-2 z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:cursor-pointer shadow"
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={maxBreadth}
                        onChange={(e) => setMaxBreadth(Math.max(Number(e.target.value), minBreadth + 1))}
                        className="absolute w-full pointer-events-none appearance-none bg-transparent h-2 z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:cursor-pointer shadow"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-widest text-muted-foreground font-mono mb-1">MIN (B)</label>
                        <div className="flex items-center bg-background border border-border rounded-xl px-2.5 py-1.5 focus-within:border-primary">
                          <input
                            type="number"
                            min={0}
                            max={maxBreadth}
                            value={minBreadth}
                            onChange={(e) => setMinBreadth(Math.min(Number(e.target.value) || 0, maxBreadth))}
                            className="w-full bg-transparent text-foreground font-mono text-xs font-bold outline-none border-none p-0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-widest text-muted-foreground font-mono mb-1">MAX (B)</label>
                        <div className="flex items-center bg-background border border-border rounded-xl px-2.5 py-1.5 focus-within:border-primary">
                          <input
                            type="number"
                            min={minBreadth}
                            max={200}
                            value={maxBreadth}
                            onChange={(e) => setMaxBreadth(Math.max(Number(e.target.value) || minBreadth, minBreadth))}
                            className="w-full bg-transparent text-foreground font-mono text-xs font-bold outline-none border-none p-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Height (H) Dual Range Bar & Inputs */}
                  <div className="bg-muted/40 border border-border rounded-2xl p-3.5 space-y-4 shadow-inner">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-primary font-bold font-mono text-[11px] uppercase tracking-wider">Height (H) Range</span>
                      <span className="text-[10px] text-muted-foreground font-mono">Min & Max</span>
                    </div>

                    <div className="relative w-full h-6 flex items-center">
                      <div className="absolute w-full h-2 bg-muted rounded-full" />
                      <div
                        className="absolute h-2 bg-primary rounded-full transition-all"
                        style={{
                          left: `${Math.min(100, (minHeight / 150) * 100)}%`,
                          right: `${Math.max(0, 100 - (maxHeight / 150) * 100)}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={150}
                        value={minHeight}
                        onChange={(e) => setMinHeight(Math.min(Number(e.target.value), maxHeight - 1))}
                        className="absolute w-full pointer-events-none appearance-none bg-transparent h-2 z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:cursor-pointer shadow"
                      />
                      <input
                        type="range"
                        min={0}
                        max={150}
                        value={maxHeight}
                        onChange={(e) => setMaxHeight(Math.max(Number(e.target.value), minHeight + 1))}
                        className="absolute w-full pointer-events-none appearance-none bg-transparent h-2 z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:cursor-pointer shadow"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-widest text-muted-foreground font-mono mb-1">MIN (H)</label>
                        <div className="flex items-center bg-background border border-border rounded-xl px-2.5 py-1.5 focus-within:border-primary">
                          <input
                            type="number"
                            min={0}
                            max={maxHeight}
                            value={minHeight}
                            onChange={(e) => setMinHeight(Math.min(Number(e.target.value) || 0, maxHeight))}
                            className="w-full bg-transparent text-foreground font-mono text-xs font-bold outline-none border-none p-0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-widest text-muted-foreground font-mono mb-1">MAX (H)</label>
                        <div className="flex items-center bg-background border border-border rounded-xl px-2.5 py-1.5 focus-within:border-primary">
                          <input
                            type="number"
                            min={minHeight}
                            max={300}
                            value={maxHeight}
                            onChange={(e) => setMaxHeight(Math.max(Number(e.target.value) || minHeight, minHeight))}
                            className="w-full bg-transparent text-foreground font-mono text-xs font-bold outline-none border-none p-0"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* 7. COLLECTIONS ACCORDION */}
            <details className="group border-b border-border pb-5" open>
              <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                <span className="text-sm font-display font-medium text-primary tracking-wider uppercase flex items-center gap-2">
                  <span>7. Collections</span>
                  {!selectedCollections.includes('all') && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180 text-lg">expand_more</span>
              </summary>
              <div className="mt-4 space-y-1.5 font-sans">
                {renderAllButton('All Collections', selectedCollections.includes('all'), () => toggleMultiParam('collectionSlug', selectedCollections, 'all'))}
                {masterCollections
                  .filter((c) => !filterSearch || c.name.toLowerCase().includes(filterSearch.toLowerCase()))
                  .map((c) => renderCheckboxOption('collectionSlug', selectedCollections, c))}
              </div>
            </details>

            {/* 8. AVAILABILITY ACCORDION */}
            <details className="group border-b border-border pb-5" open>
              <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                <span className="text-sm font-display font-medium text-primary tracking-wider uppercase flex items-center gap-2">
                  <span>8. Availability</span>
                  {!selectedAvailability.includes('all') && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180 text-lg">expand_more</span>
              </summary>
              <div className="mt-4 space-y-1.5 font-sans">
                {renderAllButton('All Availability', selectedAvailability.includes('all'), () => toggleMultiParam('availability', selectedAvailability, 'all'))}
                {masterAvailability
                  .filter((av) => !filterSearch || av.name.toLowerCase().includes(filterSearch.toLowerCase()))
                  .map((av) => renderCheckboxOption('availability', selectedAvailability, av))}
              </div>
            </details>

            {/* 9. PRICE RANGE ACCORDION */}
            <details className="group pb-2" open>
              <summary className="flex justify-between items-center cursor-pointer list-none select-none">
                <span className="text-sm font-display font-medium text-primary tracking-wider uppercase flex items-center gap-2">
                  <span>9. Price Range</span>
                  {(minPrice > 0 || maxPrice < 100000) && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-180 text-lg">expand_more</span>
              </summary>

              <div className="mt-5 space-y-6 font-sans px-1">
                {renderAllButton('All Price Ranges', minPrice === 0 && maxPrice === 100000, () => {
                  setMinPrice(0);
                  setMaxPrice(100000);
                })}

                <div className="space-y-4 pt-2">
                  <div className="relative w-full h-8 flex items-center">
                    <div className="absolute w-full h-2 bg-muted rounded-full" />
                    <div
                      className="absolute h-2 bg-primary rounded-full"
                      style={{
                        left: `${Math.min(100, (minPrice / 100000) * 100)}%`,
                        right: `${Math.max(0, 100 - (maxPrice / 100000) * 100)}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100000}
                      step={1000}
                      value={minPrice}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), maxPrice - 1000);
                        setMinPrice(val);
                      }}
                      className="absolute w-full pointer-events-none appearance-none bg-transparent h-2 z-10 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100000}
                      step={1000}
                      value={maxPrice}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), minPrice + 1000);
                        setMaxPrice(val);
                      }}
                      className="absolute w-full pointer-events-none appearance-none bg-transparent h-2 z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-widest text-muted-foreground font-mono mb-1.5">MIN</label>
                      <div className="flex items-center bg-background border border-border rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors shadow-inner">
                        <span className="text-primary font-mono text-xs font-bold mr-1.5">₹</span>
                        <input
                          type="number"
                          min={0}
                          max={maxPrice}
                          step={1000}
                          value={minPrice}
                          onChange={(e) => setMinPrice(Math.min(Number(e.target.value) || 0, maxPrice))}
                          className="w-full bg-transparent text-foreground font-mono text-xs font-bold outline-none border-none p-0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-widest text-muted-foreground font-mono mb-1.5">MAX</label>
                      <div className="flex items-center bg-background border border-border rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors shadow-inner">
                        <span className="text-primary font-mono text-xs font-bold mr-1.5">₹</span>
                        <input
                          type="number"
                          min={minPrice}
                          max={500000}
                          step={1000}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Math.max(Number(e.target.value) || minPrice, minPrice))}
                          className="w-full bg-transparent text-foreground font-mono text-xs font-bold outline-none border-none p-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {mobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full bg-[#f2ca50] hover:bg-[#d4af37] text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-widest mt-4 shadow-[0_0_20px_rgba(242,202,80,0.3)] transition-all"
              >
                Apply Checkbox Selection & Close ({combinedProducts.length} items)
              </button>
            )}
          </aside>

          {/* PRODUCT SHOWROOM GRID */}
          <main className="lg:col-span-3 xl:col-span-4 w-full">
            
            {groupedShowroom && groupedShowroom.length > 0 ? (
              <div className="space-y-16">
                {groupedShowroom.map((sec, secIdx) => (
                  <section key={secIdx} className="w-full bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-8" data-purpose="product-section">
                    
                    {/* Outer Section Heading */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border pb-4 gap-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-2.5 sm:w-3 h-9 sm:h-12 bg-primary rounded-full" />
                        <div>
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-light text-foreground tracking-tight">
                            {sec.sectionTitle}
                          </h2>
                          {sec.sectionSubtitle && (
                            <p className="text-muted-foreground font-sans text-xs sm:text-sm mt-1 leading-relaxed">
                              {sec.sectionSubtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <span className="text-[11px] font-mono text-primary bg-primary/10 border border-primary/40 px-4 py-1.5 rounded-full uppercase tracking-wider font-bold self-start sm:self-auto shadow-sm">
                        {sec.isScenario1
                          ? `${sec.itemsDirect?.length || 0} Total Designs`
                          : `${sec.innerCategorySections?.reduce((acc, c) => acc + c.subsections.reduce((sAcc, sub) => sAcc + sub.items.length, 0), 0)} Total Designs`}
                      </span>
                    </div>

                    {/* SCENARIO 1: Direct Horizontal Product Row (NO Subcategories!) */}
                    {sec.isScenario1 && sec.itemsDirect && (
                      <div className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-muted scroll-smooth">
                        {sec.itemsDirect.map((prod) => renderProductCard(prod))}
                      </div>
                    )}

                    {/* SCENARIOS 2, 3, 4: Inner Category Boxes & Subcategory Subsections */}
                    {!sec.isScenario1 && sec.innerCategorySections && (
                      <div className="space-y-10">
                        {sec.innerCategorySections.map((cSec, cIdx) => (
                          <div key={cIdx} className="bg-muted/30 border border-border rounded-2xl p-5 sm:p-7 space-y-8 shadow-inner">
                            
                            {/* Inner Category Box Title */}
                            <div className="flex items-center space-x-3 text-primary border-l-4 border-primary pl-3 py-1">
                              <span className="material-symbols-outlined text-lg">workspace_premium</span>
                              <h3 className="text-lg sm:text-xl font-serif font-extrabold uppercase tracking-wider text-foreground">
                                {cSec.categoryTitle}
                              </h3>
                            </div>

                            {/* Subcategory Subsections */}
                            <div className="space-y-8 pl-2">
                              {cSec.subsections.map((sub, subIdx) => (
                                <div key={subIdx} className="space-y-4">
                                  
                                  {/* Clean Subcategory Header */}
                                  <div className="flex items-center space-x-2 border-l-2 border-primary pl-3 py-0.5">
                                    <h4 className="text-sm sm:text-base font-serif font-extrabold uppercase tracking-wider text-foreground">
                                      {sub.subTitle}
                                    </h4>
                                    <span className="text-xs font-mono text-muted-foreground font-normal">
                                      ({sub.items.length} {sub.items.length === 1 ? 'item' : 'items'})
                                    </span>
                                  </div>

                                  {/* Horizontal Scrollable Product Card Row */}
                                  <div className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-muted scroll-smooth">
                                    {sub.items.map((prod) => renderProductCard(prod))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-12 border-t border-border">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => {
                        const p = new URLSearchParams(searchParams?.toString() || '');
                        p.set('page', (pagination.page - 1).toString());
                        router.push(`${pathname}?${p.toString()}`, { scroll: false });
                      }}
                      className="bg-card border border-border px-6 py-3 rounded-xl text-xs font-semibold text-muted-foreground disabled:opacity-30 disabled:pointer-events-none hover:text-primary hover:border-primary transition-all flex items-center gap-2 uppercase tracking-wider"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <span className="text-xs uppercase tracking-widest font-mono text-primary bg-primary/10 px-5 py-2.5 rounded-xl border border-primary/20">
                      Showcase Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => {
                        const p = new URLSearchParams(searchParams?.toString() || '');
                        p.set('page', (pagination.page + 1).toString());
                        router.push(`${pathname}?${p.toString()}`, { scroll: false });
                      }}
                      className="bg-card border border-border px-6 py-3 rounded-xl text-xs font-semibold text-muted-foreground disabled:opacity-30 disabled:pointer-events-none hover:text-primary hover:border-primary transition-all flex items-center gap-2 uppercase tracking-wider"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl p-12 sm:p-20 text-center space-y-6 max-w-xl mx-auto my-12 bg-card border border-border shadow-md">
                <span className="material-symbols-outlined text-7xl text-primary mx-auto block animate-pulse">emoji_events</span>
                <h3 className="text-2xl sm:text-3xl font-display font-light text-foreground">No Matching Monuments</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-sans">
                  We could not locate any trophies matching your exact checkbox filter combinations or measurement ranges. Try clicking an &quot;All&quot; option button or clearing selected refinements.
                </p>
                <button
                  onClick={handleReset}
                  className="btn-primary text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all inline-block"
                >
                  Clear All Checkboxes & Ranges
                </button>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
