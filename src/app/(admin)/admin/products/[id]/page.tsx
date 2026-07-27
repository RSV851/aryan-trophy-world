'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Trophy } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/v1/products/${id}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const d = json.data;
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
            sizeUnit: d.sizeUnit || 'cm',
            isFeatured: d.isFeatured || false,
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

  if (!initialData) {
    return (
      <div className="text-center py-16 bg-[#111827] border border-gray-800 rounded-2xl max-w-4xl mx-auto text-rose-400 font-bold">
        Trophy Showroom item not found or has been removed.
      </div>
    );
  }

  return <ProductForm initialData={initialData} isEditing={true} />;
}
