'use client';

import React from 'react';
import Link from 'next/link';
import { useInquiryBasketStore } from '@/stores/inquiry-basket-store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, Plus, Check, Eye, Tag } from 'lucide-react';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    sku: string;
    slug: string;
    shortDescription?: string | null;
    sizeUnit?: string | null;
    primaryImage?: string | null;
    categoryName?: string | null;
    typeName?: string | null;
    priceRange?: string | null;
    materials?: string[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useInquiryBasketStore((state) => state.addItem);
  const items = useInquiryBasketStore((state) => state.items);
  const isAlreadyInBasket = items.some((i) => i.productId === product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      primaryImage: product.primaryImage,
      typeName: product.typeName,
      categoryName: product.categoryName,
      sizeUnit: product.sizeUnit,
      priceRange: product.priceRange,
    });
    toast.success(`"${product.name}" added to your Wholesale Inquiry Basket!`);
  };

  return (
    <div className="group bg-white border border-gray-200/90 hover:border-[#C5A55A] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative">
      {/* Image & Badges Container */}
      <div>
        <div className="relative h-60 bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-4">
          {product.primaryImage ? (
            <img
              src={product.primaryImage}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-300 space-y-2">
              <Trophy className="w-16 h-16 stroke-[1.5]" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Showroom Trophy</span>
            </div>
          )}

          {/* Type Badge Top-Left */}
          {product.typeName && (
            <div className="absolute top-3 left-3 bg-[#1A1F36] text-[#DFCA85] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-xs">
              {product.typeName}
            </div>
          )}

          {/* Price Range Badge Bottom-Right */}
          {product.priceRange && (
            <div className="absolute bottom-3 right-3 bg-[#C5A55A] text-[#0F1322] font-mono text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
              {product.priceRange}
            </div>
          )}
        </div>

        {/* Product Meta Details */}
        <div className="p-5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-500">
            <span className="font-bold text-[#C5A55A]">SKU: {product.sku}</span>
            {product.categoryName && (
              <span className="uppercase text-gray-400 font-semibold">{product.categoryName}</span>
            )}
          </div>

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-sm font-extrabold font-serif text-[#1A1F36] group-hover:text-[#C5A55A] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {product.shortDescription && (
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Material Tag Chips */}
          {product.materials && product.materials.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.materials.slice(0, 2).map((m, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center space-x-1"
                >
                  <Tag className="w-2.5 h-2.5 text-gray-400" />
                  <span>{m}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-5 pt-0 flex items-center gap-2">
        <Link href={`/products/${product.slug}`} className="flex-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:text-[#1A1F36] hover:bg-gray-50 text-[11px] font-bold uppercase tracking-wider h-10 rounded-xl"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            <span>Details</span>
          </Button>
        </Link>

        <Button
          size="sm"
          onClick={handleAdd}
          className={`flex-1 text-[11px] font-black uppercase tracking-wider h-10 rounded-xl flex items-center justify-center space-x-1 transition-all ${
            isAlreadyInBasket
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-[#1A1F36] hover:bg-[#0F1322] text-[#DFCA85]'
          }`}
        >
          {isAlreadyInBasket ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Inquire</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
