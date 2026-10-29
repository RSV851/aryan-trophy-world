'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useInquiryStore } from '@/stores/inquiry-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Plus, ArrowUpRight, Sparkles } from 'lucide-react';
import { SmartImage } from '@/components/ui/smart-image';

export interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    sku: string;
    categoryName: string;
    typeName: string;
    imageUrl?: string;
    priceRange: string;
    isFeatured?: boolean;
    materials?: string[];
    availability?: string;
    dimL?: number | string;
    dimB?: number | string;
    dimH?: number | string;
    sizeUnit?: string;
    dimensions?: string;
  };
  layoutStyle?: 'grid' | 'featured';
  showAddButton?: boolean;
}

export function ProductCard({ product, layoutStyle = 'grid', showAddButton = true }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const addItem = useInquiryStore((s) => s.addItem);
  const isInInquiryRaw = useInquiryStore((s) => s.isInInquiry(product.id));
  const isInInquiry = mounted ? isInInquiryRaw : false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      imageUrl: product.imageUrl,
      priceRange: product.priceRange,
      categoryName: product.categoryName,
      quantity: 25, // Default wholesale starting quantity
    });
  };

  const rawAvailability = (product.availability || 'in_stock').toLowerCase();
  const availabilityText =
    rawAvailability === 'in_stock'
      ? 'IN STOCK'
      : rawAvailability === 'pre_order'
      ? 'PRE-ORDER'
      : rawAvailability === 'bespoke'
      ? 'BESPOKE'
      : 'IN STOCK';

  const dimensionsText = product.dimensions
    ? product.dimensions
    : product.dimL && product.dimB && product.dimH
    ? `${product.dimL} × ${product.dimB} × ${product.dimH} ${product.sizeUnit || 'cm'}`
    : '18 × 12 × 24 cm';

  return (
    <div className="group bg-card rounded-2xl border border-border hover:border-primary shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden relative h-full">
      
      {/* Top Image Showcase Container */}
      <Link href={`/products/${product.slug || product.id}`} className="relative block aspect-square w-full bg-muted/40 overflow-hidden">
        <SmartImage
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          fallbackIcon={<Trophy className="w-16 h-16 text-primary/50 stroke-[1.5]" />}
        />

        {/* Ambient overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top-Left Horizontal Product Type Pill Badge */}
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-primary/40 shadow-md flex items-center space-x-1 z-10 font-serif">
          {product.isFeatured && <Sparkles className="w-3 h-3 text-primary" />}
          <span>{product.typeName || 'AWARD'}</span>
        </div>

        {/* Top-Right Vertical Ribbon Bookmark Availability Badge (Direct DB Status) */}
        <div className="absolute top-0 right-3 z-10 flex flex-col items-center">
          <div className="bg-primary text-white text-[9px] font-black uppercase tracking-tighter px-1.5 pt-2 pb-1 shadow-lg text-center leading-none rounded-b-sm border-x border-b border-black/20">
            <span className="block font-mono font-extrabold">{availabilityText}</span>
          </div>
          {/* Triangular ribbon notch cut at bottom */}
          <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[6px] border-t-primary" />
        </div>

        {/* Bottom-Right Size/Dimensions Badge */}
        <span className="absolute bottom-3 right-3 z-10 bg-card/90 backdrop-blur-md text-foreground border border-border text-[9px] font-mono px-2.5 py-1 rounded-md uppercase tracking-wider font-semibold shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
          {dimensionsText}
        </span>

        {/* Hover Quick View indicator */}
        <div className="absolute bottom-3 left-3 text-foreground text-xs font-bold flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <span>View Specs</span>
          <ArrowUpRight className="w-4 h-4 text-primary" />
        </div>
      </Link>

      {/* Product Information Area */}
      <div className="p-3.5 mobile-mid:p-4 mobile-lg:p-5 flex-1 flex flex-col justify-between space-y-3 mobile-mid:space-y-4">
        <div className="space-y-1.5 mobile-mid:space-y-2">
          {/* Category & SKU row */}
          <div className="flex items-center justify-between text-[10px] mobile-mid:text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
            <span className="text-foreground font-extrabold truncate max-w-[110px] mobile-mid:max-w-none">{product.categoryName}</span>
            <span className="font-mono bg-muted px-1.5 mobile-mid:px-2 py-0.5 rounded text-[9px] mobile-mid:text-[10px] text-muted-foreground shrink-0">SKU: {product.sku}</span>
          </div>

          {/* Product Name Title */}
          <Link href={`/products/${product.slug || product.id}`}>
            <h3 className="font-serif text-base mobile-mid:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Material Tag Chips */}
          {product.materials && product.materials.length > 0 && (
            <div className="flex flex-wrap gap-1 mobile-mid:gap-1.5 pt-1">
              {product.materials.slice(0, 3).map((mat) => (
                <span
                  key={mat}
                  className="bg-muted text-muted-foreground text-[9px] mobile-mid:text-[10px] font-medium px-1.5 mobile-mid:px-2 py-0.5 rounded-md border border-border"
                >
                  {mat}
                </span>
              ))}
              {product.materials.length > 3 && (
                <span className="text-[9px] mobile-mid:text-[10px] text-muted-foreground font-semibold self-center">+{product.materials.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Call to Action Footer Row */}
        <div className="pt-2.5 mobile-mid:pt-3 border-t border-border flex items-center justify-between gap-1.5 mobile-mid:gap-2">
          <div className="flex flex-col shrink-0">
            <span className="text-[9px] mobile-mid:text-[10px] text-muted-foreground font-bold uppercase tracking-wider">As low as</span>
            <span className="text-xs mobile-mid:text-sm font-black text-foreground font-mono tracking-tight">
              {product.priceRange.includes('-') ? product.priceRange.split('-')[0].trim() : product.priceRange}
            </span>
          </div>

          {showAddButton && (
            <div className="flex items-center gap-1.5 mobile-mid:gap-2">
              <Button
                onClick={handleQuickAdd}
                size="sm"
                className={`h-8 mobile-mid:h-9 px-2.5 mobile-mid:px-3.5 rounded-xl font-bold text-[10px] mobile-mid:text-xs uppercase tracking-wide transition-all shadow-sm ${
                  isInInquiry
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-primary hover:bg-primary/90 text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5 mobile-mid:w-4 mobile-mid:h-4 mr-0.5 mobile-mid:mr-1 stroke-[3]" />
                <span>{isInInquiry ? '✓ In Form' : '+ Add SKU'}</span>
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
