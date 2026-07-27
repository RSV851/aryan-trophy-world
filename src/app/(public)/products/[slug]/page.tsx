'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInquiryBasketStore } from '@/stores/inquiry-basket-store';
import { ProductCard } from '@/components/public/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Trophy,
  ShoppingBag,
  Check,
  ChevronRight,
  ShieldCheck,
  Tag,
  Ruler,
  Sparkles,
  ArrowLeft,
  Package,
  Layers,
  Award,
  Plus
} from 'lucide-react';

interface MatrixRow {
  id: string;
  sizeLabel: string;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  weightKg?: number | null;
  quantity: number;
  pricePerPiece: number;
}

interface ProductDetail {
  id: string;
  name: string;
  sku: string;
  slug: string;
  shortDescription?: string | null;
  detailedDescription?: string | null;
  sizeUnit: string;
  isFeatured: boolean;
  category?: { id: string; name: string; slug: string } | null;
  subcategory?: { id: string; name: string; slug: string } | null;
  type?: { id: string; name: string; slug: string } | null;
  images: { id: string; imageUrl: string; isPrimary: boolean; altText?: string | null }[];
  materials: { id: string; name: string }[];
  themes: { id: string; name: string }[];
  shapes: { id: string; name: string }[];
  collections: { id: string; name: string }[];
  pricingMatrix: MatrixRow[];
  customizationOptions: string[];
  specifications: Record<string, any>;
  priceRange?: string | null;
}

export default function PublicProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'custom'>('desc');

  const addItem = useInquiryBasketStore((state) => state.addItem);
  const items = useInquiryBasketStore((state) => state.items);
  const isAlreadyInBasket = product ? items.some((i) => i.productId === product.id) : false;

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/v1/products/${slug}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProduct(json.data);
          // Fetch related products
          fetch(`/api/v1/products/related/${json.data.id}`)
            .then((r) => r.json())
            .then((relJson) => {
              if (relJson.success && relJson.data) setRelated(relJson.data);
            })
            .catch(() => {});
        } else {
          toast.error('Product item not found in showroom catalog.');
        }
      })
      .catch(() => toast.error('Network disconnection while querying product detail.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToBasket = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      primaryImage: product.images?.[selectedImageIndex]?.imageUrl || product.images?.[0]?.imageUrl,
      typeName: product.type?.name,
      categoryName: product.category?.name,
      sizeUnit: product.sizeUnit,
      priceRange: product.priceRange,
    });
    toast.success(`"${product.name}" added to your Wholesale Inquiry Basket!`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Skeleton className="h-6 w-64 bg-gray-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="h-[450px] w-full rounded-2xl bg-gray-200" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4 bg-gray-200" />
            <Skeleton className="h-6 w-1/2 bg-gray-200" />
            <Skeleton className="h-32 w-full bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-4">
        <Trophy className="w-16 h-16 text-gray-300 mx-auto" />
        <h2 className="text-xl font-bold text-[#1A1F36] uppercase font-serif">Trophy Item Not Found</h2>
        <p className="text-xs text-gray-500">The requested award slug does not exist in our active showroom database.</p>
        <Link href="/catalog">
          <Button className="bg-[#1A1F36] text-[#DFCA85] font-extrabold uppercase text-xs">
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const primaryImg = product.images?.[selectedImageIndex]?.imageUrl || product.images?.[0]?.imageUrl;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-gray-500 font-mono">
        <Link href="/" className="hover:text-[#1A1F36]">Home</Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <Link href="/catalog" className="hover:text-[#1A1F36]">Catalog</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-[#1A1F36]">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-bold text-[#1A1F36] truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left Column: Gallery Viewer */}
        <div className="space-y-4">
          <div className="h-[420px] sm:h-[500px] bg-[#F8FAFC] border border-gray-200 rounded-3xl overflow-hidden p-6 flex items-center justify-center relative shadow-sm">
            {primaryImg ? (
              <img src={primaryImg} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <Trophy className="w-24 h-24 text-gray-300" />
            )}

            {product.type?.name && (
              <span className="absolute top-4 left-4 bg-[#1A1F36] text-[#DFCA85] text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
                {product.type.name}
              </span>
            )}
          </div>

          {/* Thumbnail Selector Bar */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl bg-[#F8FAFC] border-2 overflow-hidden shrink-0 transition-all p-1 ${
                    selectedImageIndex === idx ? 'border-[#C5A55A] shadow-md scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.imageUrl} alt="Thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Title, Specs & 2D Matrix */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-gray-200 pb-5">
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="font-bold text-[#C5A55A]">SKU: {product.sku}</span>
              <span className="text-gray-400">•</span>
              <span className="uppercase text-gray-500 font-semibold">{product.category?.name || 'Trophy'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A1F36] uppercase tracking-tight leading-tight">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Tag Chips */}
          <div className="flex flex-wrap gap-2">
            {product.materials.map((m) => (
              <span key={m.id} className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-lg flex items-center space-x-1">
                <Tag className="w-3 h-3 text-[#C5A55A]" />
                <span>Material: {m.name}</span>
              </span>
            ))}
            {product.themes.map((t) => (
              <span key={t.id} className="bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1 rounded-lg">
                Theme: {t.name}
              </span>
            ))}
            {product.shapes.map((s) => (
              <span key={s.id} className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-lg">
                Shape: {s.name}
              </span>
            ))}
          </div>

          {/* 2D Pricing Matrix Table */}
          {product.pricingMatrix && product.pricingMatrix.length > 0 && (
            <div className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-[#1A1F36] tracking-wider font-serif flex items-center space-x-1.5">
                  <Ruler className="w-4 h-4 text-[#C5A55A]" />
                  <span>Size & Tiered Wholesale Pricing Matrix</span>
                </h3>
                <span className="text-[11px] font-mono text-gray-500 uppercase">Unit: {product.sizeUnit}</span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#1A1F36] text-[#DFCA85] text-[10px] font-extrabold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Variation / Dimensions</th>
                      <th className="p-3 text-center">Weight</th>
                      <th className="p-3 text-center">Min Order Qty</th>
                      <th className="p-3 text-right">Est. Price / Piece</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono text-gray-700">
                    {product.pricingMatrix.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-gray-50">
                        <td className="p-3 font-semibold text-[#1A1F36]">
                          {row.sizeLabel}
                          {row.length ? <span className="text-[11px] text-gray-500 block font-normal">{row.length} × {row.width} × {row.height} {product.sizeUnit}</span> : null}
                        </td>
                        <td className="p-3 text-center text-gray-500">{row.weightKg ? `${row.weightKg} kg` : '—'}</td>
                        <td className="p-3 text-center font-bold text-gray-800">{row.quantity || 1} pcs</td>
                        <td className="p-3 text-right font-black text-emerald-600">₹{row.pricePerPiece.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="pt-2">
            <Button
              size="lg"
              onClick={handleAddToBasket}
              className={`w-full h-14 font-black uppercase tracking-wider text-xs rounded-2xl shadow-xl flex items-center justify-center space-x-3 transition-all ${
                isAlreadyInBasket
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#1A1F36] hover:bg-[#0F1322] text-[#DFCA85] shadow-[0_0_20px_rgba(26,31,54,0.3)]'
              }`}
            >
              {isAlreadyInBasket ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Item Added to Wholesale Inquiry Basket</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 text-[#C5A55A]" />
                  <span>Add To Wholesale Inquiry Basket</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section: Detailed Description, Specs, Customization */}
      <div className="bg-[#F8FAFC] border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex border-b border-gray-200 space-x-6">
          {[
            { id: 'desc', label: 'Craftsmanship Story' },
            { id: 'specs', label: 'Customization Amenities' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-colors ${
                activeTab === t.id ? 'border-[#C5A55A] text-[#1A1F36]' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'desc' ? (
          <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed font-sans">
            <p>{product.detailedDescription || product.shortDescription || 'Handcrafted trophy award constructed for corporate events, annual sports galas, and honor ceremonies.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-[#1A1F36]">Supported Customization Branding Options:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-gray-700">
              {product.customizationOptions?.map((opt, i) => (
                <li key={i} className="flex items-center space-x-2 bg-white border border-gray-200 p-2.5 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A55A]" />
                  <span>{opt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Related Products Recommender */}
      {related.length > 0 && (
        <div className="space-y-6 border-t border-gray-200 pt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold font-serif text-[#1A1F36] uppercase tracking-tight">
              Related Showroom Creations
            </h3>
            <Link href="/catalog" className="text-xs font-bold text-[#C5A55A] uppercase hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
