'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Mail,
  Ruler,
  Barcode,
  Folder,
  Layers,
  Award,
  Gem,
  Hexagon,
  Star,
  Weight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { SmartImage } from '@/components/ui/smart-image';
import { ProductCard } from '@/components/public/product-card';
import { useInquiryStore } from '@/stores/inquiry-store';
import { toast } from 'sonner';

interface ProductDetailClientProps {
  product: any;
  matrixRows?: any[];
  minStartingPrice?: string;
  unit?: string;
  baseL?: string | number;
  baseB?: string | number;
  baseH?: string | number;
  categoryLabel?: string;
  subcategoryLabel?: string;
  typeLabel?: string;
  materialLabel?: string;
  shapeLabel?: string;
  themeLabel?: string;
  relatedProducts?: any[];
}

export function ProductDetailClient({
  product,
  matrixRows = product?.pricingMatrix || [],
  minStartingPrice = product?.priceRange || '₹14,500',
  unit = product?.sizeUnit || 'cm',
  baseL = product?.pricingMatrix?.[0]?.dimL || 18,
  baseB = product?.pricingMatrix?.[0]?.dimB || 12,
  baseH = product?.pricingMatrix?.[0]?.dimH || 24,
  categoryLabel = product?.categoryName || product?.category?.name || 'Sports Trophies',
  subcategoryLabel = product?.subcategoryName || product?.subcategory?.name || 'Cricket Series',
  typeLabel = product?.typeName || product?.type?.name || 'Trophy',
  materialLabel = product?.materials?.join(', ') || product?.materialName || 'Optical Crystal',
  shapeLabel = product?.shapeName || 'Obelisk',
  themeLabel = product?.themeName || 'Championship',
  relatedProducts = [],
}: ProductDetailClientProps) {
  const router = useRouter();
  const addItem = useInquiryStore((s) => s.addItem);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const gallery =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [{ id: 'primary', imageUrl: product.imageUrl, caption: product.name }]
      : [{ id: 'fallback', imageUrl: '/images/trophies/gold-cup.jpg', caption: product.name }];

  const displayMatrixRows = useMemo(() => {
    if (Array.isArray(matrixRows) && matrixRows.length > 0) {
      return matrixRows.map((row: any) => {
        const basePrice = Number(row.pricePerPiece || row.price || row.qty1 || 14500);
        const safeBasePrice = isNaN(basePrice) ? 14500 : basePrice;

        const sizeLabel = row.sizeLabel || (row.dimL && row.dimB && row.dimH ? `${row.dimL}×${row.dimB}×${row.dimH} ${unit}` : 'Standard Tier');
        const dimString = row.dimString || (row.dimL && row.dimB && row.dimH ? `${row.dimL} × ${row.dimB} × ${row.dimH} ${unit}` : `${baseL} × ${baseB} × ${baseH} ${unit}`);
        const weightStr = row.weight ? (typeof row.weight === 'number' ? `${row.weight} kg` : String(row.weight)) : '1.2 kg';

        const q1 = row.qty1 !== undefined ? Number(row.qty1) : safeBasePrice;
        const q5 = row.qty5 !== undefined ? Number(row.qty5) : Math.round(safeBasePrice * 0.95);
        const q10 = row.qty10 !== undefined ? Number(row.qty10) : Math.round(safeBasePrice * 0.90);
        const q25 = row.qty25 !== undefined ? Number(row.qty25) : Math.round(safeBasePrice * 0.85);
        const q50 = row.qty50 !== undefined ? Number(row.qty50) : Math.round(safeBasePrice * 0.80);
        const q100 = row.qty100 !== undefined ? Number(row.qty100) : Math.round(safeBasePrice * 0.75);

        const fmt = (n: number) => isNaN(n) ? '—' : `₹${n.toLocaleString('en-IN')}`;

        return {
          sizeLabel,
          dimString,
          weight: weightStr,
          qty1Fmt: fmt(q1),
          qty5Fmt: fmt(q5),
          qty10Fmt: fmt(q10),
          qty25Fmt: fmt(q25),
          qty50Fmt: fmt(q50),
          qty100Fmt: fmt(q100),
        };
      });
    }

    const baseP = Number(minStartingPrice?.replace(/[^0-9]/g, '')) || 14500;
    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

    return [
      {
        sizeLabel: '7" Tier',
        dimString: `14 × 10 × 18 ${unit}`,
        weight: '0.9 kg',
        qty1Fmt: fmt(baseP),
        qty5Fmt: fmt(Math.round(baseP * 0.95)),
        qty10Fmt: fmt(Math.round(baseP * 0.90)),
        qty25Fmt: fmt(Math.round(baseP * 0.85)),
        qty50Fmt: fmt(Math.round(baseP * 0.80)),
        qty100Fmt: fmt(Math.round(baseP * 0.75)),
      },
      {
        sizeLabel: '8" Tier',
        dimString: `16 × 11 × 20 ${unit}`,
        weight: '1.2 kg',
        qty1Fmt: fmt(Math.round(baseP * 1.15)),
        qty5Fmt: fmt(Math.round(baseP * 1.15 * 0.95)),
        qty10Fmt: fmt(Math.round(baseP * 1.15 * 0.90)),
        qty25Fmt: fmt(Math.round(baseP * 1.15 * 0.85)),
        qty50Fmt: fmt(Math.round(baseP * 1.15 * 0.80)),
        qty100Fmt: fmt(Math.round(baseP * 1.15 * 0.75)),
      },
      {
        sizeLabel: '9" Tier',
        dimString: `18 × 12 × 23 ${unit}`,
        weight: '1.5 kg',
        qty1Fmt: fmt(Math.round(baseP * 1.3)),
        qty5Fmt: fmt(Math.round(baseP * 1.3 * 0.95)),
        qty10Fmt: fmt(Math.round(baseP * 1.3 * 0.90)),
        qty25Fmt: fmt(Math.round(baseP * 1.3 * 0.85)),
        qty50Fmt: fmt(Math.round(baseP * 1.3 * 0.80)),
        qty100Fmt: fmt(Math.round(baseP * 1.3 * 0.75)),
      },
    ];
  }, [matrixRows, minStartingPrice, unit, baseL, baseB, baseH]);

  const handleSendInquiry = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      sku: product.sku,
      imageUrl: product.imageUrl,
      priceRange: minStartingPrice,
      categoryName: categoryLabel,
      quantity: 25,
    });

    toast.success(`Added ${product.name} (SKU: ${product.sku}) to your wholesale inquiry form.`);
    router.push('/contact');
  };

  const handleCallWorkshop = () => {
    window.location.href = 'tel:+919876543210';
  };

  return (
    <main className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-10 sm:py-16 text-foreground selection:bg-primary selection:text-white transition-colors duration-300">
      
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 font-sans text-xs sm:text-sm text-muted-foreground mb-8 sm:mb-12 font-semibold tracking-wider uppercase">
        <Link href="/catalog" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5 mr-1 text-primary" />
          <span>Catalog</span>
        </Link>
        <ChevronRight className="w-4 h-4 text-primary/70" />
        <Link href={`/catalog?categorySlug=${product.category?.slug || 'all'}`} className="hover:text-primary transition-colors">
          {categoryLabel}
        </Link>
        <ChevronRight className="w-4 h-4 text-primary/70" />
        <span className="text-primary font-extrabold">{product.name}</span>
      </div>

      {/* PRODUCT HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20 items-start">
        
        {/* Gallery Column (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="w-full aspect-[4/5] bg-card border border-border rounded-2xl overflow-hidden relative group cursor-zoom-in shadow-md">
            <SmartImage
              src={gallery[activeImageIndex]?.imageUrl}
              alt={gallery[activeImageIndex]?.caption || product.name}
              className="w-full h-full"
              imgClassName="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              fallbackIcon={<Trophy className="w-24 h-24 text-primary/50 stroke-[1.5]" />}
            />
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md text-primary border border-primary/40 font-mono text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg">
              {typeLabel}
            </div>
            {product.isFeatured && (
              <div className="absolute top-4 left-4 bg-card text-primary text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-primary/60 shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Atelier Prestige</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-md text-foreground font-mono text-[11px] px-3.5 py-1.5 rounded-lg border border-border uppercase tracking-wider">
              {gallery[activeImageIndex]?.caption || `Elevation ${activeImageIndex + 1}`}
            </div>
          </div>

          {/* 4 Thumbnails Grid */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4">
            {gallery.slice(0, 4).map((img: any, idx: number) => {
              const isSelected = idx === activeImageIndex;
              return (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden relative border-2 transition-all duration-300 bg-card ${
                    isSelected
                      ? 'border-primary shadow-md scale-[1.02]'
                      : 'border-border opacity-60 hover:opacity-100'
                  }`}
                >
                  <SmartImage
                    src={img.imageUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full"
                    imgClassName="w-full h-full object-cover"
                    fallbackIcon={<Trophy className="w-8 h-8 text-primary/40 stroke-[1.5]" />}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Details Column (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-0 justify-between h-full">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight font-light mb-3">
              {product.name}
            </h1>
            <p className="font-sans text-sm sm:text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
              {product.detailedDescription || product.shortDescription || 'A masterpiece of optical crystal and brushed aerospace-grade metal, engineered to honor unparalleled excellence and championship legacy.'}
            </p>
            <div className="text-2xl sm:text-3xl font-sans font-bold text-primary mb-8 tracking-tight">
              Starting From {minStartingPrice}
            </div>

            {/* Specs Icon Grid (2 Columns with dashed border) */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-6 py-6 border-y border-dashed border-border mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-primary" />
                  <span>SKU</span>
                </span>
                <span className="text-sm font-semibold text-foreground font-mono">{product.sku || 'TR-CRY-001'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-primary" />
                  <span>Category</span>
                </span>
                <span className="text-sm font-semibold text-foreground">{categoryLabel}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>Subcategory</span>
                </span>
                <span className="text-sm font-semibold text-foreground">{subcategoryLabel}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-primary" />
                  <span>Type</span>
                </span>
                <span className="text-sm font-semibold text-foreground">{typeLabel}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Gem className="w-3.5 h-3.5 text-primary" />
                  <span>Material</span>
                </span>
                <span className="text-sm font-semibold text-foreground truncate" title={materialLabel}>{materialLabel}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Hexagon className="w-3.5 h-3.5 text-primary" />
                  <span>Shape</span>
                </span>
                <span className="text-sm font-semibold text-foreground">{shapeLabel}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-primary" />
                  <span>Theme</span>
                </span>
                <span className="text-sm font-semibold text-foreground">{themeLabel}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5 text-primary" />
                  <span>Base Weight</span>
                </span>
                <span className="text-sm font-semibold text-foreground font-mono">{matrixRows[0]?.weight || '1.2 kg'}</span>
              </div>
            </div>

            {/* REQUIREMENT #1: Available Colors & Available Sizes with L×B×H & Units */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground mb-2">Available Colors & Finishes</h4>
                <p className="text-sm text-foreground font-medium">Crystal, Polished Gold, Sterling Silver, Matte Obsidian</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Available Sizes (L × B × H & Unit)</span>
                </h4>
                <div className="space-y-1">
                  {matrixRows.map((r: any, i: number) => (
                    <div key={i} className="text-xs font-mono text-foreground bg-muted border border-border px-2.5 py-1 rounded">
                      <strong className="text-foreground mr-1.5">{r.sizeLabel}:</strong>
                      <span>{r.dimString}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customization Checkboxes Grid */}
            <div className="mb-8">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground mb-3">Complimentary Customization</h4>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Logo Laser Engraving</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Recipient Name Inscription</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Tournament / Event Text</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Velvet Presentation Box</span>
                </div>
              </div>
            </div>

            {/* Delivery Information Panel */}
            <div className="p-5 bg-card border border-border rounded-2xl mb-8 shadow-sm">
              <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest text-muted-foreground mb-2">Delivery & Fulfillment Information</h4>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">Bespoke Made-To-Order</span>
                <span className="font-bold font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-0.5 rounded-full">
                  7–10 Working Days
                </span>
              </div>
            </div>
          </div>

          {/* REQUIREMENT #2: Action Buttons (SEND INQUIRY & CALL) */}
          <div className="flex flex-col gap-3.5 mt-auto pt-4">
            <button
              type="button"
              onClick={handleSendInquiry}
              className="w-full py-4 btn-primary text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] flex items-center justify-center gap-2.5"
            >
              <Mail className="w-5 h-5 stroke-[2.5]" />
              <span>SEND INQUIRY</span>
            </button>

            <button
              type="button"
              onClick={handleCallWorkshop}
              className="w-full py-4 bg-transparent border-2 border-primary text-primary hover:bg-primary/10 font-bold text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm"
            >
              <PhoneCall className="w-5 h-5" />
              <span>CALL (+91 98765 43210)</span>
            </button>
          </div>

        </div>

      </div>

      {/* DETAILS & PRICING BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
        
        {/* Left Info Pane */}
        <div className="bg-card border border-border p-8 sm:p-10 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl text-foreground mb-4 font-normal tracking-tight">
              Precision Craftsmanship
            </h3>
            <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
              Each recognition piece undergoes a rigorous 14-step inspection and hand-polishing process to ensure flawless optical clarity and weight balance. The solid base is CNC milled to microscopic tolerances before being finished by seasoned artisans.
            </p>
          </div>
          <Gem className="w-10 h-10 text-primary mt-8 animate-pulse" />
        </div>

        {/* Pricing Matrix Table (2 Cols) with REQUIREMENT #1: L×B×H & Units */}
        <div className="lg:col-span-2 bg-card border border-border p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold text-foreground mb-6 uppercase tracking-[0.2em] border-b border-border pb-4 flex items-center justify-between">
              <span>Corporate Volume Pricing Matrix</span>
              <span className="text-primary text-[10px] font-mono font-normal">Factory Direct Wholesale Tiers</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="text-muted-foreground font-mono border-b border-border text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-3 font-bold">Size Label & L×B×H (in {unit})</th>
                    <th className="py-3.5 px-3 font-bold">Weight</th>
                    <th className="py-3.5 px-2 font-bold">Qty 1</th>
                    <th className="py-3.5 px-2 font-bold">Qty 5</th>
                    <th className="py-3.5 px-2 font-bold">Qty 10</th>
                    <th className="py-3.5 px-2 font-bold">Qty 25</th>
                    <th className="py-3.5 px-2 font-bold">Qty 50</th>
                    <th className="py-3.5 px-2 font-bold">Qty 100+</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {displayMatrixRows.map((row: any, idx: number) => {
                    return (
                      <tr
                        key={idx}
                        className="text-foreground transition-colors group hover:bg-muted"
                      >
                        <td className="py-4 px-3 font-mono">
                          <div className="font-bold text-foreground">{row.sizeLabel}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{row.dimString}</div>
                        </td>
                        <td className="py-4 px-3 font-mono text-muted-foreground">{row.weight}</td>
                        <td className="py-4 px-2 font-mono">{row.qty1Fmt}</td>
                        <td className="py-4 px-2 font-mono">{row.qty5Fmt}</td>
                        <td className="py-4 px-2 font-mono">{row.qty10Fmt}</td>
                        <td className="py-4 px-2 font-mono">{row.qty25Fmt}</td>
                        <td className="py-4 px-2 font-mono">{row.qty50Fmt}</td>
                        <td className="py-4 px-2 font-mono font-bold">{row.qty100Fmt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground italic mt-6 font-sans">
            * All wholesale rates above include complimentary custom laser plate engraving and presentation box packaging.
          </p>
        </div>

        {/* Product Specifications Bento Panel (3 Cols Span Below Table) with REQUIREMENT #1: L×B×H & Units */}
        <div className="lg:col-span-3 bg-card border border-border p-8 sm:p-10 rounded-2xl shadow-sm mt-2">
          <h3 className="text-xs font-mono font-bold text-foreground mb-6 uppercase tracking-[0.2em] border-b border-border pb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Complete Technical Specifications</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 sm:gap-x-16 font-sans text-sm">
            <div className="flex flex-col">
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Product Code (SKU)</span>
                <span className="font-mono text-foreground font-bold">{product.sku || 'TR-CRY-001'}</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Category Classification</span>
                <span className="text-foreground font-semibold">{categoryLabel}</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Subcategory Division</span>
                <span className="text-foreground font-semibold">{subcategoryLabel}</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Award Type</span>
                <span className="text-foreground font-semibold">{typeLabel}</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Primary Craft Material</span>
                <span className="text-foreground font-semibold">{materialLabel}</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Geometric Shape</span>
                <span className="text-foreground font-semibold">{shapeLabel}</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Surface Finish</span>
                <span className="text-foreground font-semibold">Mirror Polished & Brushed Lacquer</span>
              </div>
            </div>

            <div className="flex flex-col">
              {/* REQUIREMENT #1: Specification Dimensions in L×B×H format WITH units */}
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Physical Dimensions (L × B × H)</span>
                <span className="font-mono text-foreground font-semibold">
                  {baseL} × {baseB} × {baseH} {unit}
                </span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Base Plate Material</span>
                <span className="text-foreground font-semibold">Weighted Rosewood & Obsidian Marble</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Unit Weight Threshold</span>
                <span className="font-mono text-foreground font-semibold">{matrixRows[0]?.weight} – {matrixRows[matrixRows.length - 1]?.weight}</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Customization Technique</span>
                <span className="text-foreground font-semibold">Computerized UV & Laser Engraving</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Protective Packaging</span>
                <span className="text-foreground font-semibold">Individual Satin-Lined Gift Box</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Factory Production Time</span>
                <span className="text-foreground font-semibold">7–10 Working Days</span>
              </div>
              <div className="flex justify-between py-3.5 border-b border-border">
                <span className="text-muted-foreground font-medium">Country of Origin</span>
                <span className="text-foreground font-semibold">Made with Pride in India 🇮🇳</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RELATED SHOWROOM AWARDS */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-8 pt-12 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
                Same Division
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-light text-foreground mt-3">
                Related {categoryLabel} Awards
              </h2>
            </div>
            <Link href={`/catalog?categorySlug=${product.category?.slug || 'all'}`}>
              <button className="text-xs font-bold font-mono uppercase bg-transparent border border-border hover:border-primary text-foreground hover:text-primary px-5 py-2.5 rounded-xl transition-all">
                View All {categoryLabel}
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id} product={rel} showAddButton={false} />
            ))}
          </div>
        </div>
      )}

    </main>
  );
}
