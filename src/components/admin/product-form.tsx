'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createProductSchema } from '@/lib/validations/products';
import { PricingMatrixEditor, MatrixItem } from '@/components/admin/pricing-matrix-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Trophy,
  Tag,
  Layers,
  Sparkles,
  Image as ImageIcon,
  DollarSign,
  Search as SearchIcon,
  Check,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Settings2,
  Star,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface MasterOption {
  id: string;
  name: string;
  categoryId?: string;
}

interface ImageItem {
  imageUrl: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

interface ProductFormValues {
  name: string;
  sku: string;
  shortDescription?: string | null;
  detailedDescription?: string | null;
  categoryId: string;
  subcategoryId?: string | null;
  typeId: string;
  sizeUnit: 'cm' | 'inch' | 'mm' | 'feet';
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  customizationOptions: string[];
  specifications: Record<string, any>;
  materialIds: string[];
  themeIds: string[];
  shapeIds: string[];
  collectionIds: string[];
  pricingMatrix: MatrixItem[];
  images: ImageItem[];
}

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Master Options State
  const [categories, setCategories] = useState<MasterOption[]>([]);
  const [subcategories, setSubcategories] = useState<MasterOption[]>([]);
  const [types, setTypes] = useState<MasterOption[]>([]);
  const [materials, setMaterials] = useState<MasterOption[]>([]);
  const [themes, setThemes] = useState<MasterOption[]>([]);
  const [shapes, setShapes] = useState<MasterOption[]>([]);
  const [collections, setCollections] = useState<MasterOption[]>([]);
  const [customOptionInput, setCustomOptionInput] = useState('');
  const [imageInputUrl, setImageInputUrl] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema as any),
    defaultValues: initialData || {
      name: '',
      sku: '',
      shortDescription: '',
      detailedDescription: '',
      categoryId: '',
      subcategoryId: null,
      typeId: '',
      sizeUnit: 'cm',
      isFeatured: false,
      isActive: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      customizationOptions: ['Precision Laser Engraving', 'Custom UV Printed Foil Plate'],
      specifications: {},
      materialIds: [],
      themeIds: [],
      shapeIds: [],
      collectionIds: [],
      pricingMatrix: [
        {
          sizeLabel: 'Standard Award Size',
          length: 12,
          width: 12,
          height: 32,
          weightKg: 1.2,
          quantity: 25,
          pricePerPiece: 1200,
        },
      ],
      images: [],
    },
  });

  const selectedCategoryId = watch('categoryId');
  const selectedSizeUnit = watch('sizeUnit') || 'cm';
  const selectedMaterialIds = watch('materialIds') || [];
  const selectedThemeIds = watch('themeIds') || [];
  const selectedShapeIds = watch('shapeIds') || [];
  const selectedCollectionIds = watch('collectionIds') || [];
  const customizationOptions: string[] = watch('customizationOptions') || [];
  const currentPricingMatrix: MatrixItem[] = watch('pricingMatrix') || [];
  const currentImages: ImageItem[] = watch('images') || [];
  const isFeaturedVal = watch('isFeatured');
  const isActiveVal = watch('isActive');

  useEffect(() => {
    async function loadMasters() {
      try {
        const [catRes, typeRes, matRes, themeRes, shapeRes, colRes] = await Promise.all([
          fetch('/api/v1/categories?limit=100').then((r) => r.json()),
          fetch('/api/v1/product-types?limit=100').then((r) => r.json()),
          fetch('/api/v1/materials?limit=100').then((r) => r.json()),
          fetch('/api/v1/themes?limit=100').then((r) => r.json()),
          fetch('/api/v1/shapes?limit=100').then((r) => r.json()),
          fetch('/api/v1/collections?limit=100').then((r) => r.json()),
        ]);

        if (catRes.data) setCategories(catRes.data.items || catRes.data || []);
        if (typeRes.data) setTypes(typeRes.data.items || typeRes.data || []);
        if (matRes.data) setMaterials(matRes.data.items || matRes.data || []);
        if (themeRes.data) setThemes(themeRes.data.items || themeRes.data || []);
        if (shapeRes.data) setShapes(shapeRes.data.items || shapeRes.data || []);
        if (colRes.data) setCollections(colRes.data.items || colRes.data || []);
      } catch {
        toast.error('Diagnostic error while syncing showroom Master Classifications.');
      }
    }
    loadMasters();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetch(`/api/v1/subcategories?categoryId=${selectedCategoryId}&limit=100`)
        .then((r) => r.json())
        .then((res) => {
          const items = res.data?.items || res.data || [];
          setSubcategories(Array.isArray(items) ? items : []);
        })
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);

  const toggleId = (field: 'materialIds' | 'themeIds' | 'shapeIds' | 'collectionIds', id: string, current: string[]) => {
    const next = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
    setValue(field, next, { shouldValidate: true });
  };

  const addCustomOption = () => {
    if (!customOptionInput.trim()) return;
    setValue('customizationOptions', [...customizationOptions, customOptionInput.trim()]);
    setCustomOptionInput('');
  };

  const removeCustomOption = (index: number) => {
    setValue(
      'customizationOptions',
      customizationOptions.filter((_: string, i: number) => i !== index)
    );
  };

  const addImageUrl = () => {
    if (!imageInputUrl.trim()) return;
    const nextOrder = currentImages.length;
    const isFirst = currentImages.length === 0;
    const newImage: ImageItem = {
      imageUrl: imageInputUrl.trim(),
      thumbnailUrl: imageInputUrl.trim(),
      displayOrder: nextOrder,
      isPrimary: isFirst,
    };
    setValue('images', [...currentImages, newImage], { shouldValidate: true });
    setImageInputUrl('');
  };

  const setPrimaryImage = (index: number) => {
    const updated = currentImages.map((img: ImageItem, i: number) => ({
      ...img,
      isPrimary: i === index,
    }));
    setValue('images', updated, { shouldValidate: true });
  };

  const removeImage = (index: number) => {
    const updated = currentImages.filter((_: ImageItem, i: number) => i !== index);
    if (updated.length > 0 && !updated.some((i: ImageItem) => i.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setValue('images', updated, { shouldValidate: true });
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditing && initialData?.id ? `/api/v1/products/${initialData.id}` : `/api/v1/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(`Trophy Showroom Item successfully ${isEditing ? 'updated' : 'launched'}!`);
        router.push('/admin/products');
      } else {
        toast.error(json.error || json.message || 'Validation rejected by catalog server.');
      }
    } catch {
      toast.error('Network failure during database transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrMsg = (err: any) => err && typeof err === 'object' && 'message' in err ? String(err.message) : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Navigation Bar */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/products"
            className="text-xs text-[#C5A55A] hover:underline flex items-center space-x-1 font-semibold uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Product Showroom Catalog</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase font-serif tracking-tight flex items-center space-x-2.5">
            <Trophy className="w-7 h-7 text-[#C5A55A]" />
            <span>{isEditing ? 'Edit Award Workspace' : 'Launch New Trophy Item'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/admin/products" className="flex-1 sm:flex-initial">
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs uppercase h-11 px-5 font-semibold"
            >
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-extrabold uppercase tracking-wider text-xs h-11 px-6 rounded-lg shadow-[0_0_20px_rgba(197,165,90,0.3)] flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Committing...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>{isEditing ? 'Save Modifications' : 'Launch Into Showroom'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Section 1: Core Identification & Classifications */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-[#C5A55A]" />
          <span>1. Core Product Identification & Categorization</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Trophy Title / Showroom Name <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Sovereign Diamond Crystal Cup Championship Trophy"
              className="bg-[#090909] border-gray-700 text-white text-sm h-11 focus:border-[#C5A55A]"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-rose-400">{getErrMsg(errors.name)}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sku" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Unique SKU Code <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="sku"
              placeholder="e.g. ARY-GLD-2026-001"
              className="bg-[#090909] border-gray-700 text-white font-mono text-sm h-11 uppercase focus:border-[#C5A55A]"
              {...register('sku')}
            />
            {errors.sku && <p className="text-xs text-rose-400">{getErrMsg(errors.sku)}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoryId" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Primary Category <span className="text-rose-400">*</span>
            </Label>
            <select
              id="categoryId"
              {...register('categoryId')}
              className="w-full bg-[#090909] border border-gray-700 text-gray-200 text-xs rounded-lg px-3.5 py-3 focus:border-[#C5A55A] focus:outline-none h-11"
            >
              <option value="">-- Choose Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-rose-400">{getErrMsg(errors.categoryId)}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subcategoryId" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Subcategory Classification
            </Label>
            <select
              id="subcategoryId"
              {...register('subcategoryId')}
              disabled={!selectedCategoryId || subcategories.length === 0}
              className="w-full bg-[#090909] border border-gray-700 text-gray-200 text-xs rounded-lg px-3.5 py-3 focus:border-[#C5A55A] focus:outline-none h-11 disabled:opacity-40"
            >
              <option value="">-- No Specific Subcategory --</option>
              {subcategories.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="typeId" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Product Format / Type <span className="text-rose-400">*</span>
            </Label>
            <select
              id="typeId"
              {...register('typeId')}
              className="w-full bg-[#090909] border border-gray-700 text-gray-200 text-xs rounded-lg px-3.5 py-3 focus:border-[#C5A55A] focus:outline-none h-11"
            >
              <option value="">-- Choose Type (Trophy/Medal/Pin) --</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.typeId && <p className="text-xs text-rose-400">{getErrMsg(errors.typeId)}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sizeUnit" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Dimensional Unit
            </Label>
            <select
              id="sizeUnit"
              {...register('sizeUnit')}
              className="w-full bg-[#090909] border border-gray-700 text-[#C5A55A] font-bold text-xs rounded-lg px-3.5 py-3 focus:border-[#C5A55A] focus:outline-none h-11 uppercase font-mono"
            >
              <option value="cm">CM (Centimeters)</option>
              <option value="inch">INCH (Inches)</option>
              <option value="mm">MM (Millimeters)</option>
              <option value="feet">FEET (Ft.)</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center gap-8 bg-[#090909] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Switch
                id="isFeatured"
                checked={isFeaturedVal}
                onCheckedChange={(val) => setValue('isFeatured', val)}
              />
              <div>
                <Label htmlFor="isFeatured" className="text-xs font-bold uppercase text-white cursor-pointer flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-[#C5A55A]" />
                  <span>Featured Showroom Star</span>
                </Label>
                <p className="text-[11px] text-gray-400">Promoted on homepage showcase</p>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-800" />

            <div className="flex items-center space-x-3">
              <Switch
                id="isActive"
                checked={isActiveVal}
                onCheckedChange={(val) => setValue('isActive', val)}
              />
              <div>
                <Label htmlFor="isActive" className="text-xs font-bold uppercase text-white cursor-pointer">
                  Active Status
                </Label>
                <p className="text-[11px] text-gray-400">Visible to customer inquiries</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Showroom Descriptions */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3">
          2. Showroom Narratives & Description
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="shortDescription" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Short Summary Headline (Catalog Cards)
            </Label>
            <Input
              id="shortDescription"
              placeholder="Exquisite multi-tier polished gold metallic cup on high-density Italian marble pedestal."
              className="bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
              {...register('shortDescription')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="detailedDescription" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Detailed Architectural Specs & Craftsmanship Narrative
            </Label>
            <Textarea
              id="detailedDescription"
              placeholder="Describe plating finish, custom laser emblem attachment options, durability, and luxury packaging amenities..."
              className="bg-[#090909] border-gray-700 text-white text-xs min-h-[140px] leading-relaxed focus:border-[#C5A55A]"
              {...register('detailedDescription')}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Multi-Select Master Data Tags */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
          <Tag className="w-5 h-5 text-[#C5A55A]" />
          <span>3. Multi-Select Showroom Tags (Junction Filters)</span>
        </h2>
        <p className="text-xs text-gray-400">
          Click chips below to tag this trophy. These enable instant faceted filtering on the public catalog showroom.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2 bg-[#090909] border border-gray-800 p-4 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-[#C5A55A] font-serif">Craftsmanship Materials</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {materials.map((m) => {
                const active = selectedMaterialIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleId('materialIds', m.id, selectedMaterialIds)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 border ${
                      active
                        ? 'bg-[#C5A55A]/20 text-[#C5A55A] border-[#C5A55A] shadow-[0_0_10px_rgba(197,165,90,0.2)]'
                        : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-[#C5A55A]" />}
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 bg-[#090909] border border-gray-800 p-4 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-[#C5A55A] font-serif">Ceremonial Themes</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {themes.map((t) => {
                const active = selectedThemeIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleId('themeIds', t.id, selectedThemeIds)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 border ${
                      active
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                        : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 bg-[#090909] border border-gray-800 p-4 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-[#C5A55A] font-serif">Geometric Shapes & Silhouettes</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {shapes.map((s) => {
                const active = selectedShapeIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleId('shapeIds', s.id, selectedShapeIds)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 border ${
                      active
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{s.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 bg-[#090909] border border-gray-800 p-4 rounded-xl">
            <h4 className="text-xs font-bold uppercase text-[#C5A55A] font-serif">Showroom Collections</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {collections.map((col) => {
                const active = selectedCollectionIds.includes(col.id);
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => toggleId('collectionIds', col.id, selectedCollectionIds)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 border ${
                      active
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/60 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-gray-800/60 text-gray-300 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: 2D Pricing Matrix */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
        <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-[#C5A55A]" />
          <span>4. Showroom Pricing & Size Variations Matrix</span>
        </h2>
        
        <PricingMatrixEditor
          value={currentPricingMatrix}
          sizeUnit={selectedSizeUnit}
          onChange={(items: MatrixItem[]) => setValue('pricingMatrix', items, { shouldValidate: true })}
        />
        {errors.pricingMatrix && <p className="text-xs text-rose-400 font-bold">{getErrMsg(errors.pricingMatrix)}</p>}
      </div>

      {/* Section 5: Gallery Media Uploader */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-[#C5A55A]" />
          <span>5. Trophy Visual Gallery & Primary Thumbnail</span>
        </h2>

        <div className="flex items-center space-x-3 max-w-xl">
          <Input
            placeholder="Paste WebP image URL from Media Library or external link..."
            value={imageInputUrl}
            onChange={(e) => setImageInputUrl(e.target.value)}
            className="bg-[#090909] border-gray-700 text-white text-xs h-10 focus:border-[#C5A55A]"
          />
          <Button
            type="button"
            onClick={addImageUrl}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-[#C5A55A] font-bold text-xs h-10 px-4 shrink-0"
          >
            + Add to Gallery
          </Button>
        </div>

        {currentImages.length === 0 ? (
          <div className="border border-dashed border-gray-800 rounded-xl p-8 text-center bg-[#090909]">
            <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-bold text-gray-400 uppercase">No Product Images Attached</p>
            <p className="text-[11px] text-gray-600 mt-1">Paste image URLs above to assemble the customer-facing showcase.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentImages.map((img: ImageItem, i: number) => (
              <div
                key={i}
                className={`relative group bg-[#090909] border rounded-xl overflow-hidden shadow-md ${
                  img.isPrimary ? 'border-2 border-[#C5A55A] shadow-[0_0_15px_rgba(197,165,90,0.25)]' : 'border-gray-800'
                }`}
              >
                <img src={img.imageUrl} alt="Trophy Thumbnail" className="w-full h-32 object-cover" />
                <div className="p-2.5 bg-[#111827] flex items-center justify-between">
                  {img.isPrimary ? (
                    <span className="text-[10px] font-extrabold text-[#C5A55A] uppercase tracking-wider flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Primary Cover</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(i)}
                      className="text-[10px] text-gray-400 hover:text-white font-medium underline"
                    >
                      Make Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="text-rose-400 hover:text-rose-300 p-1 rounded"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 6: Customization Amenities & SEO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#C5A55A]" />
            <span>6. Customization Amenities</span>
          </h2>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="e.g. Diamond-tip CNC Metal Etching..."
              value={customOptionInput}
              onChange={(e) => setCustomOptionInput(e.target.value)}
              className="bg-[#090909] border-gray-700 text-white text-xs h-10 focus:border-[#C5A55A]"
            />
            <Button
              type="button"
              onClick={addCustomOption}
              className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-bold text-xs h-10 px-4 uppercase shrink-0"
            >
              Add Amenity
            </Button>
          </div>

          <ul className="space-y-2 pt-2">
            {customizationOptions.map((opt: string, i: number) => (
              <li key={i} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#090909] border border-gray-800 text-xs text-gray-300">
                <span className="font-medium">• {opt}</span>
                <button
                  type="button"
                  onClick={() => removeCustomOption(i)}
                  className="text-rose-400 hover:text-rose-300 ml-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
            <SearchIcon className="w-5 h-5 text-[#C5A55A]" />
            <span>7. SEO & Search Engine indexing</span>
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="seoTitle" className="text-xs font-semibold uppercase text-gray-300">Meta Title Tag</Label>
              <Input
                id="seoTitle"
                placeholder="Buy Luxury Customized Cricket Trophies | Aryan World"
                className="mt-1 bg-[#090909] border-gray-700 text-white text-xs h-10 focus:border-[#C5A55A]"
                {...register('seoTitle')}
              />
            </div>
            <div>
              <Label htmlFor="seoKeywords" className="text-xs font-semibold uppercase text-gray-300">Target Keywords (Comma-separated)</Label>
              <Input
                id="seoKeywords"
                placeholder="gold trophy, corporate shield, mumbai award maker, wholesale awards"
                className="mt-1 bg-[#090909] border-gray-700 text-white text-xs h-10 focus:border-[#C5A55A]"
                {...register('seoKeywords')}
              />
            </div>
            <div>
              <Label htmlFor="seoDescription" className="text-xs font-semibold uppercase text-gray-300">Meta Description</Label>
              <Textarea
                id="seoDescription"
                placeholder="High quality custom crystal trophies with laser etching..."
                className="mt-1 bg-[#090909] border-gray-700 text-white text-xs min-h-[70px] focus:border-[#C5A55A]"
                {...register('seoDescription')}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
