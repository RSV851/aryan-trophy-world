'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useInquiryStore } from '@/stores/inquiry-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Plus, ArrowUpRight, Sparkles } from 'lucide-react';

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
  };
  layoutStyle?: 'grid' | 'featured';
}

export function ProductCard({ product, layoutStyle = 'grid' }: ProductCardProps) {
  const addItem = useInquiryStore((s) => s.addItem);
  const isInInquiry = useInquiryStore((s) => s.isInInquiry(product.id));

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

  const defaultImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
  const imgUrl = product.imageUrl || defaultImage;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-[#C5A55A] shadow-sm hover:shadow-[0_10px_30px_rgba(26,31,54,0.12)] transition-all duration-300 flex flex-col overflow-hidden relative h-full">
      
      {/* Top Image Showcase Container */}
      <Link href={`/products/${product.slug || product.id}`} className="relative block aspect-square w-full bg-gray-50 overflow-hidden">
        <Image
          src={imgUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Ambient overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F36]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Featured Ribbon Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 bg-[#1A1F36] text-[#C5A55A] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#C5A55A]/40 shadow-md flex items-center space-x-1 z-10">
            <Sparkles className="w-3 h-3 text-[#C5A55A]" />
            <span>Featured</span>
          </div>
        )}

        {/* Product Type Pill Badge */}
        <div className="absolute top-3 right-3 bg-[#C5A55A]/95 text-[#090909] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md z-10 font-serif">
          {product.typeName}
        </div>

        {/* Hover Quick View indicator */}
        <div className="absolute bottom-3 left-3 text-white text-xs font-bold flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <span>View Specifications & 2D Matrix</span>
          <ArrowUpRight className="w-4 h-4 text-[#C5A55A]" />
        </div>
      </Link>

      {/* Product Information Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category & SKU row */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 uppercase font-bold tracking-wider">
            <span className="text-[#1A1F36] font-extrabold">{product.categoryName}</span>
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-600">SKU: {product.sku}</span>
          </div>

          {/* Product Name Title */}
          <Link href={`/products/${product.slug || product.id}`}>
            <h3 className="font-serif text-lg font-bold text-[#1A1F36] group-hover:text-[#C5A55A] transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Material Tag Chips */}
          {product.materials && product.materials.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.materials.slice(0, 3).map((mat) => (
                <span
                  key={mat}
                  className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-gray-200/60"
                >
                  {mat}
                </span>
              ))}
              {product.materials.length > 3 && (
                <span className="text-[10px] text-gray-400 font-semibold self-center">+{product.materials.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Call to Action Footer Row */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Wholesale Range</span>
            <span className="text-sm font-black text-[#1A1F36] font-mono tracking-tight">
              {product.priceRange}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleQuickAdd}
              size="sm"
              className={`h-9 px-3.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm ${
                isInInquiry
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-[#1A1F36] hover:bg-[#C5A55A] text-white hover:text-[#090909]'
              }`}
            >
              <Plus className="w-4 h-4 mr-1 stroke-[3]" />
              <span>{isInInquiry ? 'Added' : 'Inquire'}</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
