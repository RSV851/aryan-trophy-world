'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInquiryStore } from '@/stores/inquiry-store';
import { ProductCard } from '@/components/public/product-card';
import { Button } from '@/components/ui/button';
import { Trophy, ShieldCheck, Sparkles, Check, Plus, Minus, ShoppingBag, ArrowLeft, Ruler, Weight, Tag, Layers, FileText } from 'lucide-react';

interface ProductDetailClientProps {
  product: any;
  relatedProducts: Array<any>;
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const addItem = useInquiryStore((s) => s.addItem);
  const isInInquiry = useInquiryStore((s) => s.isInInquiry(product.id));

  // Images gallery state
  const defaultImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80';
  const gallery = product.images && product.images.length > 0 ? product.images : [{ id: '1', imageUrl: defaultImg, caption: product.name }];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Pricing matrix calculation & quantity selection state
  const matrix = product.pricingMatrix || [];
  const minQtyInMatrix = matrix.length > 0 ? Math.min(...matrix.map((m: any) => Number(m.quantity) || 1)) : 25;
  const [quantity, setQuantity] = useState(minQtyInMatrix);
  const [selectedSizeLabel, setSelectedSizeLabel] = useState<string>(matrix[0]?.sizeLabel || 'Standard Executive Tier');

  // Determine active price bracket based on quantity
  const getCurrentPrice = () => {
    if (!matrix || matrix.length === 0) return null;
    // Sort ascending by quantity threshold
    const sorted = [...matrix].sort((a: any, b: any) => Number(a.quantity) - Number(b.quantity));
    let price = Number(sorted[0].pricePerPiece);
    for (const row of sorted) {
      if (quantity >= Number(row.quantity)) {
        price = Number(row.pricePerPiece);
      }
    }
    return price;
  };

  const currentPrice = getCurrentPrice();

  const handleAddToInquiry = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      imageUrl: gallery[activeImageIndex]?.imageUrl || defaultImg,
      priceRange: currentPrice ? `₹${currentPrice.toLocaleString()} / pc` : product.priceRange,
      categoryName: product.category?.name || 'Award',
      quantity,
      sizeUnit: product.sizeUnit,
      selectedSizeLabel,
    });
  };

  const customizationOptions = Array.isArray(product.customizationOptions) && product.customizationOptions.length > 0
    ? product.customizationOptions
    : ['High-Precision Laser Engraving', 'UV Metallic Logo Embedding', 'Customized Teakwood & Marble Base Plate', 'Individual Velvet Corporate Presentation Box'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-16">
      
      {/* Navigation Breadcrumbs & Back Link */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <Link href="/catalog" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#C5A55A] transition-colors">
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Return to Catalog Showroom</span>
        </Link>
        <span className="text-xs font-mono text-gray-400 font-semibold">SKU: {product.sku}</span>
      </div>

      {/* 1. PRODUCT STUDIO WORKSPACE (Gallery + Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image Gallery with Interactive Thumbnails */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border-2 border-[#C5A55A]/30 bg-gray-900 shadow-2xl group">
            <Image
              src={gallery[activeImageIndex]?.imageUrl || defaultImg}
              alt={gallery[activeImageIndex]?.caption || product.name}
              fill
              priority
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {product.isFeatured && (
              <div className="absolute top-4 left-4 bg-[#1A1F36] text-[#C5A55A] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-[#C5A55A]/40 shadow-lg flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A55A]" />
                <span>Featured Atelier Piece</span>
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-semibold px-3 py-1 rounded-md border border-white/20">
              {activeImageIndex + 1} / {gallery.length} View
            </div>
          </div>

          {/* Thumbnail switcher bar */}
          {gallery.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {gallery.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    idx === activeImageIndex
                      ? 'border-[#C5A55A] shadow-[0_0_12px_rgba(197,165,90,0.5)] scale-105'
                      : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img.imageUrl} alt="Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Specifications Callout Box */}
          <div className="bg-[#1A1F36] text-white rounded-2xl p-6 border border-[#C5A55A]/30 shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-[#C5A55A] text-xs font-bold uppercase tracking-wider font-serif">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Atelier Specifications</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Measurement Unit</p>
                <p className="font-mono font-black text-white text-sm mt-0.5">{product.sizeUnit || 'Inches / Centimeters'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Minimum Order Threshold</p>
                <p className="font-mono font-black text-[#C5A55A] text-sm mt-0.5">{minQtyInMatrix} Pieces</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Category Classification</p>
                <p className="font-bold text-white mt-0.5">{product.category?.name || 'Championship'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px]">Subcategory Tier</p>
                <p className="font-bold text-white mt-0.5">{product.subcategory?.name || 'General Series'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Specifications & Quote Configuration */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* Header & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#C5A55A] text-[#090909] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full font-serif shadow-sm">
                {product.type?.name || 'Trophy'}
              </span>
              {product.collections?.map((c: any) => (
                <span key={c.id} className="bg-gray-100 text-[#1A1F36] text-xs font-extrabold px-2.5 py-1 rounded-full border border-gray-300">
                  ★ {c.name}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black uppercase font-serif text-[#1A1F36] tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="text-sm text-gray-600 leading-relaxed font-sans pt-1">
              {product.detailedDescription || product.shortDescription || 'Designed for corporate excellence and prestige events. Precision crafted with weight-balanced structure and customizable engraving plate.'}
            </p>
          </div>

          {/* Material, Theme & Shape Tag Chips */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-xs font-black uppercase text-gray-500 tracking-wider">
              <Tag className="w-4 h-4 text-[#C5A55A]" />
              <span>Structural Components</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.materials?.map((m: any) => (
                <span key={m.id} className="bg-amber-50 text-[#1A1F36] border border-amber-200 text-xs font-bold px-3 py-1 rounded-lg">
                  Material: {m.name}
                </span>
              ))}
              {product.themes?.map((t: any) => (
                <span key={t.id} className="bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold px-3 py-1 rounded-lg">
                  Theme: {t.name}
                </span>
              ))}
              {product.shapes?.map((s: any) => (
                <span key={s.id} className="bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold px-3 py-1 rounded-lg">
                  Shape: {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* 2D PRICING MATRIX TABLE (Size vs Weight vs Qty Brackets) */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black font-serif uppercase text-[#1A1F36] tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#C5A55A]" />
                <span>2D Wholesale Pricing Matrix</span>
              </h3>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-black uppercase px-2 py-0.5 rounded">
                Transparent Direct-from-Factory
              </span>
            </div>

            {matrix.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#1A1F36] text-white font-serif uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 border-r border-white/10">Size Label & Dimensions (in {product.sizeUnit || 'cm'})</th>
                      <th className="py-3 px-4 border-r border-white/10">Weight</th>
                      <th className="py-3 px-4 border-r border-white/10">Qty Bracket</th>
                      <th className="py-3 px-4 text-right text-[#C5A55A]">Wholesale Price / Piece</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white font-medium">
                    {matrix.map((row: any, idx: number) => {
                      const isSelected = selectedSizeLabel === row.sizeLabel;
                      return (
                        <tr
                          key={row.id || idx}
                          onClick={() => setSelectedSizeLabel(row.sizeLabel || `Tier ${idx + 1}`)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-50/80 font-bold' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-4 border-r border-gray-100">
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#C5A55A]' : 'bg-gray-300'}`} />
                              <span className="text-[#1A1F36] font-bold">{row.sizeLabel || 'Standard Variant'}</span>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5 font-mono">
                              L: {row.length || 'N/A'} × B: {row.breadth || 'N/A'} × H: {row.height || 'N/A'} {product.sizeUnit}
                            </div>
                          </td>
                          <td className="py-3 px-4 border-r border-gray-100 font-mono text-gray-600">
                            {row.weight ? `${row.weight} grams` : 'Standard'}
                          </td>
                          <td className="py-3 px-4 border-r border-gray-100 font-mono font-extrabold text-[#1A1F36]">
                            ≥ {row.quantity} Pieces
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-sm text-[#C5A55A]">
                            ₹{Number(row.pricePerPiece).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 flex items-center justify-between">
                <span>Custom dimension & wholesale pricing tiers available upon quotation submission.</span>
                <span className="font-bold text-[#1A1F36]">{product.priceRange}</span>
              </div>
            )}

            <p className="text-[11px] text-gray-500 italic">
              * Click a table row above to select your preferred dimension tier for the inquiry basket.
            </p>
          </div>

          {/* Included Customization Options */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1F36] font-serif">
              Complimentary Customization Perks
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {customizationOptions.map((opt: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200/80 font-semibold text-gray-800">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[3]" />
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* INQUIRY BASKET CONFIGURATION BOX */}
          <div className="bg-[#1A1F36] text-white rounded-3xl p-7 border-2 border-[#C5A55A] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#C5A55A]">Selected Quotation Tier</span>
                <h3 className="text-lg font-bold font-serif text-white">{selectedSizeLabel}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Estimated Rate</span>
                <p className="text-2xl font-mono font-black text-[#C5A55A]">
                  {currentPrice ? `₹${currentPrice.toLocaleString()} / pc` : product.priceRange}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-white/10">
              <div className="w-full sm:w-auto flex items-center justify-between bg-white/10 border border-white/20 rounded-2xl p-1">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 5))}
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 hover:bg-white/10 text-white font-bold"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="px-5 text-center font-mono font-black text-white">
                  <span className="text-xs block text-gray-400 font-sans font-semibold uppercase">Qty</span>
                  <span className="text-base">{quantity}</span>
                </div>
                <Button
                  onClick={() => setQuantity(quantity + 5)}
                  size="icon"
                  variant="ghost"
                  className="w-10 h-10 hover:bg-white/10 text-white font-bold"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={handleAddToInquiry}
                className={`flex-1 w-full h-14 rounded-2xl font-black uppercase tracking-wider text-xs sm:text-sm shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2.5 ${
                  isInInquiry
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-[#C5A55A] text-[#090909] hover:bg-[#d5b568] shadow-[0_0_25px_rgba(197,165,90,0.5)]'
                }`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                <span>{isInInquiry ? 'Update Quantity in Inquiry Basket' : 'Add to Wholesale Inquiry Basket'}</span>
              </Button>
            </div>
          </div>

        </div>

      </div>

      {/* 2. RELATED SHOWROOM AWARDS */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8 pt-12 border-t-2 border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#C5A55A] bg-[#1A1F36] px-3 py-1 rounded-full">
                Same Classification
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#1A1F36] mt-2 uppercase">
                Related {product.category?.name || 'Championship'} Awards
              </h2>
            </div>
            <Link href={`/catalog?categorySlug=${product.category?.slug || 'all'}`}>
              <Button variant="outline" className="text-xs font-extrabold uppercase border-[#1A1F36] text-[#1A1F36] h-10 px-4 rounded-xl">
                View All in Category
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
