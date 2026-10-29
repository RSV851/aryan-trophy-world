'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { toast } from 'sonner';
import {
  Trophy,
  Edit2,
  ArrowLeft,
  Tag,
  Layers,
  Package,
  Sparkles,
  DollarSign,
  Ruler,
  Weight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function ProductWorkshopPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [rawProduct, setRawProduct] = useState<any>(null);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingState, setIsEditingState] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/v1/products/${id}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
          setRawProduct(d);

          // Map backend structure into form schema expectations
          const formatted = {
            id: d.id,
            name: d.name,
            slug: d.slug || '',
            sku: d.sku || '',
            shortDescription: d.shortDescription || '',
            detailedDescription: d.detailedDescription || '',
            categoryId: d.categoryId || '',
            subcategoryId: d.subcategoryId || null,
            typeId: d.typeId || '',
            category: d.category,
            subcategory: d.subcategory,
            type: d.type,
            materials: d.materials || [],
            themes: d.themes || [],
            shapes: d.shapes || [],
            collections: d.collections || [],
            sizeUnit: d.sizeUnit || 'cm',
            isFeatured: d.isFeatured || false,
            isBestseller: d.isBestseller || false,
            isActive: d.isActive || true,
            seoTitle: d.seoTitle || '',
            seoDescription: d.seoDescription || '',
            seoKeywords: d.seoKeywords || '',
            customizationOptions: d.customizationOptions || [],
            specifications: d.specifications || {},
            materialIds: (d.materials || []).map((m: any) => m.id || m),
            themeIds: (d.themes || []).map((t: any) => t.id || t),
            shapeIds: (d.shapes || []).map((s: any) => s.id || s),
            collectionIds: (d.collections || []).map((c: any) => c.id || c),
            pricingMatrix: (d.pricingMatrix || []).length > 0 ? d.pricingMatrix : [
              { sizeLabel: 'Standard Size', length: 12, width: 12, height: 32, weightKg: 1.2, quantity: 25, pricePerPiece: 1200 }
            ],
            images: d.images || [],
          };
          setInitialData(formatted);
        } else {
          toast.error('Failed to locate trophy details in database.');
        }
      })
      .catch(() => toast.error('Diagnostic error while reading product specification.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-[#C5A55A] animate-pulse" />
            <Skeleton className="h-8 w-64 bg-gray-800" />
          </div>
          <Skeleton className="h-4 w-96 bg-gray-800" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl bg-[#111827] border border-gray-800" />
      </div>
    );
  }

  if (!initialData || !rawProduct) {
    return (
      <div className="text-center py-16 bg-[#111827] border border-gray-800 rounded-2xl max-w-4xl mx-auto text-rose-400 font-bold">
        Trophy Showroom item not found or has been removed.
      </div>
    );
  }

  // Active Editing Mode
  if (isEditingState) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between bg-[#111827] border border-gray-800 p-4 rounded-xl">
          <button
            onClick={() => setIsEditingState(false)}
            className="text-xs font-bold text-[#C5A55A] hover:text-white flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Read-Only Workshop Preview</span>
          </button>
          <span className="text-xs text-gray-400 font-mono">Editing SKU: {rawProduct.sku}</span>
        </div>
        <ProductForm initialData={initialData} isEditing={true} />
      </div>
    );
  }

  // Default Read-Only Workshop Showroom View
  const primaryImage = rawProduct.images?.find((img: any) => img.isPrimary)?.imageUrl || rawProduct.images?.[0]?.imageUrl;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <Link
            href="/admin/products"
            className="text-xs font-bold text-[#C5A55A] hover:text-[#d5b568] flex items-center space-x-1.5 transition-colors mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products Showroom</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-white font-serif">{rawProduct.name}</h1>
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                rawProduct.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {rawProduct.isActive ? 'Active Showroom' : 'Draft Mode'}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono">
            SKU: <strong className="text-[#C5A55A]">{rawProduct.sku}</strong> • /{rawProduct.slug}
          </p>
        </div>

        <Button
          onClick={() => setIsEditingState(true)}
          className="bg-[#C5A55A] hover:bg-[#b0924c] text-gray-950 font-bold text-xs flex items-center space-x-2 h-10 px-5 shadow-lg shrink-0 uppercase tracking-wider"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Trophy Details</span>
        </Button>
      </div>

      {/* Main Workshop Grid (Image Showcase & Specifications) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Image Showcase */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-4 aspect-square flex items-center justify-center relative overflow-hidden shadow-xl">
            <SmartImage
              src={primaryImage}
              alt={rawProduct.name}
              className="w-full h-full"
              imgClassName="w-full h-full object-cover rounded-xl"
              fallbackIcon={<Trophy className="w-20 h-20 text-[#C5A55A]/40 stroke-[1.5]" />}
            />
          </div>

          {/* Gallery Thumbnails */}
          {rawProduct.images && rawProduct.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {rawProduct.images.map((img: any, i: number) => (
                <div key={i} className="aspect-square bg-[#111827] border border-gray-800 rounded-xl overflow-hidden p-1">
                  <SmartImage
                    src={img.imageUrl}
                    alt={`${rawProduct.name} ${i + 1}`}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover rounded-lg"
                    fallbackIcon={<Trophy className="w-6 h-6 text-[#C5A55A]/50" />}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Specifications & Tags */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-[#C5A55A]" />
              <span>Master Classification Tags</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-mono">Category</span>
                <span className="font-bold text-white">{rawProduct.category?.name || 'General'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-mono">Subcategory</span>
                <span className="font-bold text-[#C5A55A]">{rawProduct.subcategory?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-mono">Product Type</span>
                <span className="font-bold text-white">{rawProduct.type?.name || 'Trophy'}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-mono">Size Unit</span>
                <span className="font-bold text-white uppercase">{rawProduct.sizeUnit || 'cm'}</span>
              </div>
            </div>

            {/* Junction Tags */}
            <div className="pt-3 border-t border-gray-800 space-y-3">
              {rawProduct.materials && rawProduct.materials.length > 0 && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-mono block mb-1">Materials:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rawProduct.materials.map((m: any) => (
                      <span key={m.id} className="px-2 py-0.5 rounded text-[11px] bg-gray-800 text-gray-300 border border-gray-700 font-medium">
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rawProduct.themes && rawProduct.themes.length > 0 && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-mono block mb-1">Themes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rawProduct.themes.map((t: any) => (
                      <span key={t.id} className="px-2 py-0.5 rounded text-[11px] bg-sky-950/40 text-sky-400 border border-sky-800/60 font-medium">
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rawProduct.shapes && rawProduct.shapes.length > 0 && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-mono block mb-1">Shapes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rawProduct.shapes.map((s: any) => (
                      <span key={s.id} className="px-2 py-0.5 rounded text-[11px] bg-amber-950/40 text-amber-400 border border-amber-800/60 font-medium">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rawProduct.collections && rawProduct.collections.length > 0 && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-mono block mb-1">Collections:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {rawProduct.collections.map((c: any) => (
                      <span key={c.id} className="px-2 py-0.5 rounded text-[11px] bg-[#C5A55A]/10 text-[#C5A55A] border border-[#C5A55A]/30 font-medium">
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-2 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {rawProduct.detailedDescription || rawProduct.shortDescription || 'No description added yet.'}
            </p>
          </div>

        </div>

      </div>

      {/* 2D Pricing Matrix Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white font-serif flex items-center space-x-2">
          <Package className="w-4 h-4 text-[#C5A55A]" />
          <span>2D Wholesale Pricing & Sizing Matrix Grid</span>
        </h3>

        {rawProduct.pricingMatrix && rawProduct.pricingMatrix.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090909] text-gray-400 uppercase tracking-wider border-b border-gray-800">
                <tr>
                  <th className="p-3">Size Tier</th>
                  <th className="p-3">Dimensions (L x W x H)</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">Min Qty</th>
                  <th className="p-3 text-right">Price per Piece</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {rawProduct.pricingMatrix.map((pm: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-800/40">
                    <td className="p-3 font-bold text-white">{pm.sizeLabel}</td>
                    <td className="p-3 text-gray-300">
                      {pm.length || 0} x {pm.width || 0} x {pm.height || 0} {rawProduct.sizeUnit || 'cm'}
                    </td>
                    <td className="p-3 text-gray-400">{pm.weightKg} kg</td>
                    <td className="p-3 text-gray-400">{pm.quantity} pcs+</td>
                    <td className="p-3 text-right font-mono font-bold text-[#C5A55A]">
                      ₹{Number(pm.pricePerPiece || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">No pricing matrix configured.</p>
        )}
      </div>

    </div>
  );
}
