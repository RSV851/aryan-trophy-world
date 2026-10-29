'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useInquiryStore } from '@/stores/inquiry-store';
import {
  Trophy,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  Search,
  Plus,
  X,
  ArrowLeft,
  Ruler,
  Share2,
  ChevronDown,
  ChevronRight,
  Trash2,
  Check,
  Loader2,
  Layers,
} from 'lucide-react';
import { SmartImage } from '@/components/ui/smart-image';
import { toast } from 'sonner';
import { InstagramIcon, FacebookIcon, LinkedinIcon, WhatsappIcon } from '@/components/shared/social-icons';

interface ContactClientProps {
  brandName: string;
  phone: string;
  email: string;
  address: string;
  settings: Record<string, any>;
  profile: Record<string, any>;
  products: any[];
}

export function ContactClient({
  brandName,
  phone,
  email,
  address,
  settings,
  profile,
  products = [],
}: ContactClientProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const itemsRaw = useInquiryStore((s) => s.items);
  const items = mounted ? itemsRaw : [];
  const addItem = useInquiryStore((s) => s.addItem);
  const removeItem = useInquiryStore((s) => s.removeItem);
  const clearInquiry = useInquiryStore((s) => s.clearInquiry);
  const isInInquiryRaw = useInquiryStore((s) => s.isInInquiry);
  const isInInquiry = (id: string) => (mounted ? isInInquiryRaw(id) : false);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  // Primary Main Branch (Head Office) from CMS Main Settings
  const mainBranchObj = {
    id: 'main-head-office',
    name: 'Main Branch / Head Office',
    street_address: settings?.contact_street_address || 'Shop 12, Trophy Market, MG Road',
    city: settings?.contact_city || 'Mumbai',
    state: settings?.contact_state || 'Maharashtra',
    postal_code: settings?.contact_postal_code || '400001',
    phone: profile?.phone || settings?.contact_phone || phone || '+91 98765 43210',
    email: profile?.email || settings?.contact_email || email || 'concierge@aryantrophyworld.com',
    map_pin_url: settings?.map_pin_url || 'https://maps.app.goo.gl/XEeSqtBQRqy8ksLz5?g_st=aw',
  };

  const monFriHours = settings?.operating_hours_mon_fri || '10:00 - 20:00 IST';
  const saturdayHours = settings?.operating_hours_saturday || '10:00 - 18:00 IST';
  const sundayHours = settings?.operating_hours_sunday || 'By Appointment Only';
  const operatingNote = settings?.operating_hours_note || '* Urgent tournament dispatch support and emergency wholesale manufacturing available 24/7 for verified client accounts.';

  let extraBranches: any[] = [];
  try {
    const rawStores = settings?.store_locations;
    const parsed = typeof rawStores === 'string' ? JSON.parse(rawStores) : (Array.isArray(rawStores) ? rawStores : []);
    if (Array.isArray(parsed)) {
      extraBranches = parsed.filter((s: any) => s && s.name && s.id !== 'main-head-office');
    }
  } catch {
    extraBranches = [];
  }

  // All Branches List always has Main Branch Head Office as Option #1
  const storeLocationsList = [mainBranchObj, ...extraBranches];

  const [activeStoreIdx, setActiveStoreIdx] = useState(0);
  const [inquiryBranchIdx, setInquiryBranchIdx] = useState(0);

  const activeStore = storeLocationsList[activeStoreIdx] || storeLocationsList[0];
  const activeStoreFullAddress = `${activeStore.street_address}, ${activeStore.city}, ${activeStore.state} - ${activeStore.postal_code}`;

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubcategory, setFilterSubcategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMaterial, setFilterMaterial] = useState<string>('all');

  const [activeDropdown, setActiveDropdown] = useState<'category' | 'type' | 'material' | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Mobile filter bottom sheet state
  const [mobileFilterSheet, setMobileFilterSheet] = useState<'category' | 'type' | 'material' | null>(null);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  const [selectedDetailProduct, setSelectedDetailProduct] = useState<any | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mergedCatalog = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p) => ({
        id: p.id,
        slug: p.slug || p.id,
        name: p.name,
        sku: p.sku || 'AT-GEN-001',
        categorySlug: p.categoryName || p.category?.name || 'Sports Trophies',
        subcategoryName: p.subcategoryName || p.subcategory?.name || 'Cricket Series',
        typeName: p.typeName || p.type?.name || 'Trophy',
        materialName: p.materials?.join(', ') || 'Optical Crystal, Solid Brass',
        materials: p.materials || ['Optical Crystal', 'Solid Brass'],
        shapeName: p.shapeName || 'Obelisk',
        themeName: p.themeName || 'Championship',
        priceRange: p.priceRange || (p.pricingMatrix?.[0]?.pricePerPiece ? `₹${p.pricingMatrix[0].pricePerPiece}` : '₹14,500'),
        dimL: p.pricingMatrix?.[0]?.dimL || 18,
        dimB: p.pricingMatrix?.[0]?.dimB || 12,
        dimH: p.pricingMatrix?.[0]?.dimH || 24,
        sizeUnit: p.sizeUnit || 'cm',
        weight: p.pricingMatrix?.[0]?.weight || '1.2 kg',
        imageUrl: p.imageUrl || '/images/trophies/gold-cup.jpg',
        description: p.shortDescription || p.detailedDescription || 'A masterpiece of optical crystal and brushed metal.',
      }));
    }

    return [
      {
        id: 'sample-1',
        slug: 'imperial-gold-cup',
        name: 'Imperial Gold Champion Trophy',
        sku: 'TR-GOLD-001',
        categorySlug: 'Sports Trophies',
        subcategoryName: 'Cricket Series',
        typeName: 'Trophy',
        materialName: 'Cast Brass, Obsidian Base',
        materials: ['Cast Brass', 'Obsidian Base'],
        shapeName: 'Cup',
        themeName: 'Championship',
        priceRange: '₹18,500',
        dimL: 20,
        dimB: 15,
        dimH: 35,
        sizeUnit: 'cm',
        weight: '2.4 kg',
        imageUrl: '/images/trophies/gold-cup.jpg',
        description: 'Heavyweight brass tournament trophy finished in 24K electroplated gold.',
      },
      {
        id: 'sample-2',
        slug: 'optical-crystal-obelisk',
        name: 'Optical Crystal Enterprise Monument',
        sku: 'CRY-EXE-902',
        categorySlug: 'Corporate Awards',
        subcategoryName: 'Executive Crystal',
        typeName: 'Plaque',
        materialName: 'K9 Optical Crystal',
        materials: ['K9 Optical Crystal'],
        shapeName: 'Obelisk',
        themeName: 'Leadership',
        priceRange: '₹14,200',
        dimL: 12,
        dimB: 8,
        dimH: 26,
        sizeUnit: 'cm',
        weight: '1.8 kg',
        imageUrl: '/images/trophies/crystal-obelisk.jpg',
        description: 'Ultra-clear K9 crystal block featuring diamond laser sub-surface 3D etching.',
      },
      {
        id: 'sample-3',
        slug: 'victory-shield-wood',
        name: 'Presidential Mahogany Recognition Plaque',
        sku: 'PLK-WOOD-303',
        categorySlug: 'Academic Honors',
        subcategoryName: 'Scholastic Medals',
        typeName: 'Plaque',
        materialName: 'Kilned Rosewood, Solid Metal Plate',
        materials: ['Rosewood', 'Solid Metal'],
        shapeName: 'Shield',
        themeName: 'Excellence',
        priceRange: '₹8,900',
        dimL: 22,
        dimB: 4,
        dimH: 30,
        sizeUnit: 'cm',
        weight: '1.4 kg',
        imageUrl: '/images/trophies/wood-plaque.jpg',
        description: 'Hand-rubbed solid mahogany wood base mounted with relief metal shield emblem.',
      },
    ];
  }, [products]);

  const categoryStructure = useMemo(() => {
    const catsMap = new Map<string, Set<string>>();
    mergedCatalog.forEach((p) => {
      const c = p.categorySlug || 'Other';
      if (!catsMap.has(c)) catsMap.set(c, new Set());
      if (p.subcategoryName) catsMap.get(c)!.add(p.subcategoryName);
    });

    return Array.from(catsMap.entries()).map(([catName, subs]) => ({
      name: catName,
      slug: catName.toLowerCase().replace(/\s+/g, '-'),
      subcategories: Array.from(subs),
    }));
  }, [mergedCatalog]);

  const filteredModalProducts = useMemo(() => {
    return mergedCatalog.filter((p) => {
      if (filterCategory !== 'all' && !p.categorySlug.toLowerCase().includes(filterCategory)) return false;
      if (filterSubcategory !== 'all' && !p.subcategoryName.toLowerCase().includes(filterSubcategory)) return false;
      if (filterType !== 'all' && !p.typeName.toLowerCase().includes(filterType)) return false;
      if (filterMaterial !== 'all' && !p.materialName.toLowerCase().includes(filterMaterial)) return false;

      if (modalSearch.trim()) {
        const q = modalSearch.toLowerCase().trim();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        const matchSub = p.subcategoryName?.toLowerCase().includes(q);
        const matchCat = p.categorySlug?.toLowerCase().includes(q) || p.typeName?.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchSub && !matchCat) return false;
      }
      return true;
    });
  }, [mergedCatalog, filterCategory, filterSubcategory, filterType, filterMaterial, modalSearch]);

  const handleResetFilters = () => {
    setFilterCategory('all');
    setFilterSubcategory('all');
    setFilterType('all');
    setFilterMaterial('all');
    setModalSearch('');
    setActiveDropdown(null);
  };

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryCompany, setInquiryCompany] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const availableSubjects = useMemo(() => {
    const defaultList = ["Bespoke Trophy Commission", "Wholesale Catalog Order", "Laser Engraving & UV Printing", "General Workshop Inquiry"];
    if (!settings?.inquiry_subjects) return defaultList;
    try {
      const parsed = typeof settings.inquiry_subjects === 'string' ? JSON.parse(settings.inquiry_subjects) : settings.inquiry_subjects;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
    return defaultList;
  }, [settings?.inquiry_subjects]);

  useEffect(() => {
    if (availableSubjects.length > 0 && (!inquirySubject || !availableSubjects.includes(inquirySubject))) {
      setInquirySubject(availableSubjects[0]);
    }
  }, [availableSubjects]);

  const [cooldownSec, setCooldownSec] = useState<number>(0);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = setInterval(() => {
      setCooldownSec((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSec]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSec > 0) {
      toast.warning(`Please wait ${cooldownSec}s before submitting another quote inquiry.`);
      return;
    }

    if (!firstName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) {
      toast.error('Please fill in your Name, Email, and Message.');
      return;
    }

    try {
      setIsSubmitting(true);

      const productPayload = items.length > 0 ? items.map((i) => ({
        productId: i.productId,
        quantity: 1,
        name: i.name,
        sku: i.sku,
      })) : [
        {
          productId: 'general-contact-inquiry',
          quantity: 1,
          name: `Contact Subject: ${inquirySubject.toUpperCase()}`,
          sku: 'GEN-INQ-001',
        }
      ];

      const fullName = `${firstName} ${lastName}`.trim();
      const selectedTargetBranch = storeLocationsList[inquiryBranchIdx] || storeLocationsList[0];
      const finalMessage = `[Target Store Branch: ${selectedTargetBranch.name} (${selectedTargetBranch.city})]\n[Subject: ${inquirySubject.toUpperCase()}]\n\n${inquiryMessage}`;

      const res = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          company: inquiryCompany || null,
          email: inquiryEmail,
          phone: inquiryPhone || '+91-0000000000',
          city: null,
          message: finalMessage,
          products: productPayload,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success !== false) {
        toast.success('Your inquiry has been submitted successfully!');
        setSubmittedSuccess(true);
        clearInquiry();
        setCooldownSec(60);
      } else {
        toast.error(result.message || 'Submission failed. Please check inputs.');
      }
    } catch (err) {
      console.error('Submission Error:', err);
      toast.error('A network error occurred while submitting your inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How long does custom production and diamond laser engraving take?',
      a: 'Standard wholesale trophy and medal batches complete within 3 to 7 working days. For bespoke custom crystal monuments or specialized metal shield commissions, manufacturing requires approximately 10 to 14 days following digital vector artwork sign-off. We prioritize uncompromising excellence over hasty production.'
    },
    {
      q: 'Do you support multi-product wholesale bulk orders for tournaments?',
      a: 'Yes, our atelier facility specializes in supplying national sports tournaments, corporate summits, and academic convocations. Our pricing matrix automatically scales for wholesale tier quantities (5, 10, 25, 50, and 100+ units).'
    },
    {
      q: 'Can we embed our custom corporate logo and recipient nameplates?',
      a: 'Absolutely. We utilize high-precision UV printing, diamond-tip etching, and deep laser engraving to cleanly embed organization insignias, tournament badges, and individual recipient titles directly onto optical crystal, cast metal, and solid rosewood bases.'
    },
    {
      q: 'How does the quotation and sample evaluation process operate?',
      a: 'Once you attach your selected SKUs in the inquiry form below and submit your request, our executive production specialists will review your chosen sizing brackets and contact you via telephone or email within 24 working hours with a formal pro-forma quotation and complimentary digital artwork mockup.'
    },
  ];

  if (submittedSuccess) {
    return (
      <div className="min-h-[75vh] w-full bg-background text-foreground flex items-center justify-center py-24 px-4 transition-colors duration-300">
        <div className="max-w-2xl mx-auto text-center space-y-8 bg-card border border-border rounded-3xl p-10 sm:p-14 shadow-xl backdrop-blur-2xl">
          <div className="w-24 h-24 bg-primary text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary font-mono">Dossier Transmitted</span>
            <h1 className="text-3xl sm:text-4xl font-display text-foreground tracking-tight font-light">
              Inquiry Submitted Successfully
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto font-sans">
              Your inquiry and attached product SKUs have been received. Our executive consultants will connect with you shortly.
            </p>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setSubmittedSuccess(false)}
              className="w-full sm:w-auto px-8 py-4 bg-card border border-border hover:border-primary text-foreground hover:text-primary rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              Submit Another Inquiry
            </button>
            <Link href="/catalog" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 btn-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:scale-105 transition-transform">
                Return to Showroom Catalog
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground font-sans antialiased overflow-x-hidden pt-28 pb-32 transition-colors duration-300">
      
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 md:px-20">
        
        {/* Header Section */}
        <header className="text-center mb-20 space-y-5">
          <div className="inline-flex items-center space-x-2 bg-card px-4 py-1.5 rounded-full border border-border shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] sm:text-xs uppercase font-mono tracking-[0.25em] text-primary font-bold">
              Atelier & Workshop Coordinates
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display text-foreground tracking-tight font-normal">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            We welcome inquiries regarding bespoke commissions, wholesale catalog batches, and custom brand laser engraving. Our team of artisans and specialists is at your disposal.
          </p>
        </header>

        {/* Contact Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-24 items-start">
          
          {/* Inquiry Form & SKU Selector (7 Cols) */}
          <div className="lg:col-span-7 bg-card backdrop-blur-2xl border border-border rounded-2xl p-8 lg:p-12 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display text-primary font-light tracking-wide">
                  Send an Inquiry
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect directly with our manufacturing studio for custom bulk sizing pricing matrix quotations.
                </p>
              </div>
            </div>

            {/* SKU Attachment Selector Box */}
            <div className="bg-muted/30 border-2 border-dashed border-primary/40 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-primary">
                      Attached Trophies & SKUs for Quotation ({items.length})
                    </h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Attach exact items from our collection to receive wholesale sizing tier discounts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedDetailProduct(null); setShowCatalogModal(true); }}
                  className="btn-primary text-white font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 transition-all duration-300 flex-shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Select SKUs From Catalog</span>
                </button>
              </div>

              {/* REQUIREMENT #4: CLEAN ATTACHED SKUS LIST WITHOUT QUANTITY MODIFIER ICONS */}
              {items.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 divide-y divide-border">
                  {items.map((item) => {
                    let itemTouchStartX = 0;

                    const handleItemTouchStart = (e: React.TouchEvent) => {
                      itemTouchStartX = e.touches[0].clientX;
                    };

                    const handleItemTouchEnd = (e: React.TouchEvent) => {
                      const itemTouchEndX = e.changedTouches[0].clientX;
                      const diff = itemTouchEndX - itemTouchStartX;
                      if (Math.abs(diff) > 60) {
                        removeItem(item.productId);
                        toast.info(`Removed "${item.name}" from quotation checklist`);
                      }
                    };

                    return (
                      <div
                        key={item.productId}
                        onTouchStart={handleItemTouchStart}
                        onTouchEnd={handleItemTouchEnd}
                        className="flex items-center justify-between py-2.5 text-xs gap-3 touch-pan-y group hover:bg-muted/20 px-2 rounded-xl transition-all"
                      >
                        <div className="flex items-center space-x-3.5 truncate">
                          <SmartImage
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-11 h-11 rounded-lg bg-card border border-border flex-shrink-0"
                            imgClassName="w-full h-full object-cover"
                            fallbackIcon={<Trophy className="w-5 h-5 text-primary/50 stroke-[1.5]" />}
                          />
                          <div className="truncate">
                            <p className="font-bold text-foreground truncate text-xs sm:text-sm">{item.name}</p>
                            <span className="font-mono text-[9px] sm:text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                              SKU: {item.sku}
                            </span>
                          </div>
                        </div>

                        {/* Small X Icon Button to Cancel / Remove Each Quotation Message Item */}
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(item.productId);
                            toast.info(`Removed "${item.name}" from quotation checklist`);
                          }}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg border border-transparent hover:border-destructive/30 transition-all flex-shrink-0"
                          title="Cancel / Remove item from quotation"
                        >
                          <X className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-7 bg-muted/20 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground font-mono">
                    No SKUs selected yet. Click "+ Select SKUs From Catalog" above to explore and attach trophies.
                  </p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest h-5 flex items-center leading-none">First Name *</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Executive Name"
                    required
                    className="bg-background border border-border focus:border-primary rounded-xl px-4 py-3 text-foreground text-sm outline-none transition-all duration-300"
                    type="text"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest h-5 flex items-center leading-none">Last Name / Surname</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Surname"
                    className="bg-background border border-border focus:border-primary rounded-xl px-4 py-3 text-foreground text-sm outline-none transition-all duration-300"
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest h-5 flex items-center leading-none">Email Address *</label>
                  <input
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="concierge@company.com"
                    required
                    className="bg-background border border-border focus:border-primary rounded-xl px-4 py-3 text-foreground text-sm outline-none transition-all duration-300"
                    type="email"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest h-5 flex items-center leading-none">Telephone / WhatsApp *</label>
                  <input
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="bg-background border border-border focus:border-primary rounded-xl px-4 py-3 text-foreground text-sm outline-none transition-all duration-300 font-mono"
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest h-5 flex items-center leading-none">Organization / Club</label>
                  <input
                    value={inquiryCompany}
                    onChange={(e) => setInquiryCompany(e.target.value)}
                    placeholder="Championship Committee"
                    className="bg-background border border-border focus:border-primary rounded-xl px-4 py-3 text-foreground text-sm outline-none transition-all duration-300"
                    type="text"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest h-5 flex items-center leading-none">Target Store Branch *</label>
                  <select
                    value={inquiryBranchIdx}
                    onChange={(e) => setInquiryBranchIdx(Number(e.target.value))}
                    className="bg-background border border-border focus:border-primary rounded-xl px-4 py-3 text-foreground text-sm outline-none transition-all duration-300 appearance-none cursor-pointer font-bold"
                  >
                    {storeLocationsList.map((store, sIdx) => (
                      <option key={store.id || sIdx} value={sIdx}>
                        📍 {store.name} ({store.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest h-5 flex items-center leading-none">Inquiry Subject *</label>
                <select
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value)}
                  className="bg-background border border-border focus:border-primary rounded-xl px-4 py-3 text-foreground text-sm outline-none transition-all duration-300 appearance-none cursor-pointer font-medium"
                >
                  {availableSubjects.map((subject: string) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest h-5 flex items-center leading-none">Message & Specification Requirements *</label>
                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Detail your desired trophy heights, marble base preferences, target delivery deadline, or custom engraving instructions..."
                  required
                  rows={5}
                  className="bg-background border border-border focus:border-primary rounded-xl p-4 text-foreground text-sm outline-none transition-all duration-300 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || cooldownSec > 0}
                className="w-full btn-primary text-white font-black text-xs sm:text-sm uppercase tracking-[0.2em] py-4 rounded-xl hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Submitting...</span>
                  </>
                ) : cooldownSec > 0 ? (
                  <>
                    <MessageSquare className="w-5 h-5 stroke-[2.5] opacity-60" />
                    <span>Please Wait ({cooldownSec}s)</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5 stroke-[2.5]" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Direct Methods & Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-8 flex flex-col">
            
            {/* Multiple Store Branches Dropdown Switcher */}
            {storeLocationsList.length > 0 && (
              <div className="bg-card backdrop-blur-2xl rounded-2xl p-6 border border-border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-primary uppercase tracking-widest">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Select Atelier Store Branch / Location</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground">({storeLocationsList.length} Available)</span>
                </div>
                <div className="relative">
                  <select
                    value={activeStoreIdx}
                    onChange={(e) => {
                      const newIdx = Number(e.target.value);
                      setActiveStoreIdx(newIdx);
                      setInquiryBranchIdx(newIdx);
                    }}
                    className="w-full bg-background border border-border focus:border-primary rounded-xl px-4 py-3.5 text-foreground text-sm font-bold outline-none transition-all duration-300 appearance-none cursor-pointer shadow-xs pr-10"
                  >
                    {storeLocationsList.map((store, sIdx) => (
                      <option key={store.id || sIdx} value={sIdx}>
                        📍 {store.name} — {store.city}, {store.state}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Contact Cards */}
            <div className="space-y-4">
              {/* Telephone */}
              <a
                href={`tel:${activeStore.phone || phone}`}
                className="bg-card backdrop-blur-2xl rounded-2xl p-6 flex items-center space-x-6 hover:bg-muted transition-all duration-300 group border border-border hover:border-primary shadow-sm min-w-0"
              >
                <div className="w-14 h-14 rounded-2xl border border-primary/40 bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                  <Phone className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-1 font-bold">Direct Telephone</h3>
                  <p className="font-sans font-bold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors leading-snug">{activeStore.phone || phone}</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${activeStore.email || email}`}
                className="bg-card backdrop-blur-2xl rounded-2xl p-6 flex items-center space-x-6 hover:bg-muted transition-all duration-300 group border border-border hover:border-primary shadow-sm min-w-0"
              >
                <div className="w-14 h-14 rounded-2xl border border-primary/40 bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                  <Mail className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-1 font-bold">Electronic Quotation</h3>
                  <p className="font-sans font-bold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors break-all whitespace-normal leading-snug">{activeStore.email || email}</p>
                </div>
              </a>

              {/* Physical Broken Down Address Card */}
              <div className="bg-card backdrop-blur-2xl rounded-2xl p-6 flex items-start space-x-6 border border-border shadow-sm min-w-0">
                <div className="w-14 h-14 rounded-2xl border border-primary/40 bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <MapPin className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest font-bold">{activeStore.name}</h3>
                  <p className="font-sans font-bold text-foreground text-sm sm:text-base leading-snug">{activeStore.street_address}</p>
                  <p className="font-sans text-xs text-muted-foreground font-semibold">
                    {activeStore.city}, {activeStore.state} — {activeStore.postal_code}
                  </p>
                </div>
              </div>

              {/* WhatsApp */}
              <div
                onClick={() => window.open(`https://wa.me/${(activeStore.phone || phone).replace(/[^0-9]/g, '')}`, '_blank')}
                className="bg-card backdrop-blur-2xl rounded-2xl p-6 flex items-center space-x-6 hover:bg-muted transition-all duration-300 group cursor-pointer border border-border hover:border-primary shadow-sm min-w-0"
              >
                <div className="w-14 h-14 rounded-2xl border border-primary/40 bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                  <WhatsappIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest mb-1 font-bold">WhatsApp Concierge</h3>
                  <p className="font-sans font-bold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors leading-snug">Instant Chat Support</p>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-card backdrop-blur-2xl rounded-2xl p-4 mobile-mid:p-6 sm:p-8 border border-border shadow-sm flex-grow space-y-4 sm:space-y-6 min-w-0">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
                <h3 className="text-xl sm:text-2xl font-display text-primary font-light">Working Hours</h3>
              </div>
              <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm font-medium">
                <li className="flex flex-col mobile-mid:flex-row mobile-mid:items-center justify-between border-b border-border pb-3 gap-1 mobile-mid:gap-3">
                  <span className="text-muted-foreground shrink-0">Monday - Friday</span>
                  <span className="text-foreground font-mono font-bold whitespace-nowrap">{monFriHours}</span>
                </li>
                <li className="flex flex-col mobile-mid:flex-row mobile-mid:items-center justify-between border-b border-border pb-3 gap-1 mobile-mid:gap-3">
                  <span className="text-muted-foreground shrink-0">Saturday</span>
                  <span className="text-foreground font-mono font-bold whitespace-nowrap">{saturdayHours}</span>
                </li>
                <li className="flex flex-col mobile-mid:flex-row mobile-mid:items-center justify-between pt-1 gap-1.5 mobile-mid:gap-3">
                  <span className="text-muted-foreground shrink-0">Sunday</span>
                  <span className="text-primary font-mono font-extrabold uppercase text-[10px] sm:text-xs tracking-wider bg-primary/10 px-2.5 sm:px-3 py-1 rounded-full border border-primary/30 w-fit">
                    {sundayHours}
                  </span>
                </li>
              </ul>
              <div className="pt-2 border-t border-border text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                {operatingNote}
              </div>
            </div>

            {/* Social Media Connections */}
            <div className="bg-card backdrop-blur-2xl rounded-2xl p-4 mobile-mid:p-6 sm:p-8 border border-border shadow-sm space-y-4 sm:space-y-6 min-w-0">
              <div className="flex items-center space-x-3 border-b border-border pb-3.5 sm:pb-4">
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
                <h3 className="text-lg sm:text-2xl font-display text-primary font-light">
                  Social Media & Brand Profile Connections
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-light">
                Follow our official atelier feeds for custom trophy design unveils, tournament honors, and behind-the-scenes metalwork.
              </p>
              <div className="grid grid-cols-4 mobile-mid:grid-cols-2 gap-2 mobile-mid:gap-3 text-xs font-semibold">
                <a
                  href={settings?.social_instagram || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center mobile-mid:justify-start space-x-0 mobile-mid:space-x-2.5 p-2.5 mobile-mid:p-3.5 rounded-xl bg-card border border-border hover:border-primary text-foreground hover:text-primary transition-all group"
                  title="Instagram"
                >
                  <InstagramIcon className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate hidden mobile-mid:inline">Instagram</span>
                </a>
                <a
                  href={settings?.social_facebook || "https://facebook.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center mobile-mid:justify-start space-x-0 mobile-mid:space-x-2.5 p-2.5 mobile-mid:p-3.5 rounded-xl bg-card border border-border hover:border-primary text-foreground hover:text-primary transition-all group"
                  title="Facebook"
                >
                  <FacebookIcon className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate hidden mobile-mid:inline">Facebook</span>
                </a>
                <a
                  href={settings?.social_linkedin || "https://linkedin.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center mobile-mid:justify-start space-x-0 mobile-mid:space-x-2.5 p-2.5 mobile-mid:p-3.5 rounded-xl bg-card border border-border hover:border-primary text-foreground hover:text-primary transition-all group"
                  title="LinkedIn"
                >
                  <LinkedinIcon className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate hidden mobile-mid:inline">LinkedIn</span>
                </a>
                <a
                  href={settings?.social_whatsapp || `https://wa.me/${(activeStore.phone || phone).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center mobile-mid:justify-start space-x-0 mobile-mid:space-x-2.5 p-2.5 mobile-mid:p-3.5 rounded-xl bg-card border border-border hover:border-primary text-foreground hover:text-primary transition-all group"
                  title="WhatsApp"
                >
                  <WhatsappIcon className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate hidden mobile-mid:inline">WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Live Interactive Google Maps Section */}
        <div className="mb-16 sm:mb-24 rounded-3xl overflow-hidden bg-card border border-border shadow-md h-[340px] mobile-mid:h-[400px] sm:h-[460px] md:h-[500px] relative group">
          <iframe
            title={`Google Maps Pin for ${activeStore.name}`}
            src={`https://maps.google.com/maps?q=${encodeURIComponent(`${activeStore.name}, ${activeStore.street_address}, ${activeStore.city}`)}&t=&z=16&ie=UTF8&iwloc=B&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'contrast(105%) opacity(92%)' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full object-cover pointer-events-auto"
          />
          
          <div className="absolute top-2.5 left-2.5 right-2.5 phablet:top-6 phablet:left-6 sm:right-auto z-20 pointer-events-none">
            <div className="p-3 mobile-mid:p-4 sm:p-6 bg-card/95 backdrop-blur-2xl border border-primary/50 rounded-2xl shadow-2xl max-w-full sm:max-w-sm pointer-events-auto space-y-2 mobile-mid:space-y-3">
              <div className="flex items-start justify-between gap-2 text-primary">
                <div className="flex items-start space-x-1.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-5 sm:h-5 flex-shrink-0 animate-bounce text-red-500 fill-red-500 mt-0.5" />
                  <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider text-primary leading-snug break-words">
                    {activeStore.name || brandName}
                  </span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-600 font-mono text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/30 shrink-0 whitespace-nowrap mt-0.5">
                  Live Location
                </span>
              </div>
              
              <p className="text-[10px] sm:text-xs text-foreground font-medium leading-normal line-clamp-2">{activeStoreFullAddress}</p>
              
              <div className="pt-2 border-t border-border">
                <a
                  href={activeStore.map_pin_url || settings?.map_pin_url || "https://maps.google.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 sm:py-3 px-3 sm:px-4 btn-primary text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 block text-center"
                >
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
                  <span>Open Pin in Google Maps ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive FAQ Section */}
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-primary font-mono">Clarity & Expectations</span>
            <h2 className="text-3xl sm:text-5xl font-display text-foreground tracking-tight font-light">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4 pt-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen ? 'bg-card border-primary/60 shadow-md' : 'bg-card border-border hover:border-primary/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none gap-4"
                  >
                    <span className="text-base sm:text-lg font-bold text-foreground tracking-wide">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-64 border-t border-border' : 'max-h-0'}`}>
                    <p className="px-6 pb-6 pt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-light">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MINI WINDOW */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 lg:p-6 bg-background/80 backdrop-blur-lg animate-in fade-in duration-200">
          <div className="bg-card border-0 sm:border-2 sm:border-primary/60 rounded-none sm:rounded-3xl w-full max-w-6xl h-[100dvh] sm:h-[92vh] flex flex-col overflow-hidden shadow-2xl relative" ref={dropdownRef}>
            
            {/* Conditional Rendering: Either Vertical List View OR In-Modal Detail View */}
            {selectedDetailProduct ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Top Navigation Bar */}
                <div className="p-3 sm:p-6 bg-card border-b border-border flex items-center justify-between flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailProduct(null)}
                    className="inline-flex items-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-sm font-bold text-primary hover:text-foreground transition-colors bg-muted/50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border shadow-sm uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                    <span>Back</span>
                  </button>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="font-mono text-[10px] sm:text-xs text-primary uppercase tracking-wider bg-primary/10 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-primary/30 font-bold hidden mobile-mid:inline-flex">
                      SKU: {selectedDetailProduct.sku || 'TR-CRY-GOLD'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setSelectedDetailProduct(null); setShowCatalogModal(false); }}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors"
                      title="Close Window"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Detailed Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 bg-background">
                  <div className="max-w-5xl mx-auto space-y-10">
                    
                    {/* Header Showcase Hero */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      <div className="lg:col-span-5">
                        <div className="w-full aspect-square rounded-3xl overflow-hidden bg-muted/40 border border-border relative shadow-md">
                          <Image
                            src={selectedDetailProduct.imageUrl}
                            alt={selectedDetailProduct.name}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute top-4 left-4 bg-card/90 text-primary font-mono text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-widest border border-primary/40 shadow-lg">
                            {selectedDetailProduct.typeName || 'Trophy'}
                          </span>
                        </div>
                      </div>

                      <div className="lg:col-span-7 space-y-5">
                        <div>
                          <span className="text-xs font-mono font-extrabold text-primary uppercase tracking-[0.2em] block mb-1.5">
                            {selectedDetailProduct.categoryName || 'Corporate Awards'} • {selectedDetailProduct.subcategoryName || 'Crystal Division'}
                          </span>
                          <h2 className="text-3xl sm:text-4xl font-display text-foreground font-normal leading-tight">
                            {selectedDetailProduct.name || 'Golden Victory Shield'}
                          </h2>
                          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed font-light">
                            {selectedDetailProduct.description || 'A masterpiece of optical crystal and brushed aerospace-grade aluminum, designed to honor unparalleled achievement with enduring prestige.'}
                          </p>
                        </div>

                        <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground font-bold block">Starting From</span>
                            <span className="text-2xl font-bold font-mono text-primary">{selectedDetailProduct.priceRange || '₹14,500'}</span>
                          </div>
                          <span className="bg-primary/10 text-primary text-xs font-mono px-3 py-1 rounded-full border border-primary/30 font-bold">
                            SKU: {selectedDetailProduct.sku || 'TR-CRY-GOLD'}
                          </span>
                        </div>

                        {/* Add to List Action */}
                        <button
                          type="button"
                          onClick={() => {
                            const added = isInInquiry(selectedDetailProduct.id);
                            if (added) {
                              removeItem(selectedDetailProduct.id);
                              toast.info(`Removed ${selectedDetailProduct.sku} from list.`);
                            } else {
                              addItem({
                                productId: selectedDetailProduct.id,
                                slug: selectedDetailProduct.slug,
                                name: selectedDetailProduct.name,
                                sku: selectedDetailProduct.sku,
                                imageUrl: selectedDetailProduct.imageUrl,
                                priceRange: selectedDetailProduct.priceRange,
                                categoryName: selectedDetailProduct.categorySlug,
                                quantity: 1,
                              });
                              toast.success(`${selectedDetailProduct.sku} added to List!`);
                            }
                          }}
                          className={`w-full py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-[0.15em] transition-all duration-300 shadow-md flex items-center justify-center space-x-2 ${
                            isInInquiry(selectedDetailProduct.id)
                              ? 'bg-emerald-600 text-white border-2 border-emerald-400 hover:bg-emerald-700'
                              : 'btn-primary text-white hover:scale-[1.01]'
                          }`}
                        >
                          <Plus className="w-5 h-5 stroke-[3]" />
                          <span>{isInInquiry(selectedDetailProduct.id) ? '✓ IN LIST (REMOVE)' : '+ ADD TO LIST'}</span>
                        </button>
                      </div>
                    </div>

                    {/* COMPLETE TECHNICAL SPECIFICATIONS GRID */}
                    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6">
                      <div className="flex items-center space-x-3 border-b border-border pb-4">
                        <Ruler className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-display text-foreground font-normal">Complete Technical Specifications</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                        <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                          <span className="text-muted-foreground font-mono text-[10px] uppercase font-bold">Category</span>
                          <p className="text-foreground font-bold text-sm">{selectedDetailProduct.categoryName || 'Corporate Awards'}</p>
                        </div>
                        <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                          <span className="text-muted-foreground font-mono text-[10px] uppercase font-bold">Subcategory</span>
                          <p className="text-foreground font-bold text-sm">{selectedDetailProduct.subcategoryName || 'Crystal Division'}</p>
                        </div>
                        <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                          <span className="text-muted-foreground font-mono text-[10px] uppercase font-bold">Type</span>
                          <p className="text-foreground font-bold text-sm">{selectedDetailProduct.typeName || 'Trophy'}</p>
                        </div>
                        <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                          <span className="text-muted-foreground font-mono text-[10px] uppercase font-bold">Material</span>
                          <p className="text-foreground font-bold text-sm">{selectedDetailProduct.materialName || 'Optical Crystal, Brushed Aluminum'}</p>
                        </div>
                        <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                          <span className="text-muted-foreground font-mono text-[10px] uppercase font-bold">Shape</span>
                          <p className="text-foreground font-bold text-sm">{selectedDetailProduct.shapeName || 'Obelisk'}</p>
                        </div>
                        <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                          <span className="text-muted-foreground font-mono text-[10px] uppercase font-bold">Theme</span>
                          <p className="text-foreground font-bold text-sm">{selectedDetailProduct.themeName || 'Achievement'}</p>
                        </div>
                        <div className="bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                          <span className="text-muted-foreground font-mono text-[10px] uppercase font-bold">Base Weight</span>
                          <p className="text-foreground font-bold text-sm">{selectedDetailProduct.weight || '0.9 kg'}</p>
                        </div>
                        <div className="sm:col-span-2 bg-muted/40 p-4 rounded-xl border border-border space-y-1">
                          <span className="text-muted-foreground font-mono text-[10px] uppercase font-bold">Available Colors & Finishes</span>
                          <p className="text-foreground font-bold text-sm">Crystal, Polished Gold, Sterling Silver, Matte Obsidian</p>
                        </div>
                      </div>

                      {/* AVAILABLE SIZES (L x B x H & Unit) */}
                      <div className="pt-4 border-t border-border space-y-3">
                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">Available Sizes (L × B × H & Unit)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                          <div className="bg-muted/40 p-3 rounded-xl border border-border flex items-center justify-between">
                            <span className="text-muted-foreground">7" Tier</span>
                            <span className="text-foreground font-bold">14 × 10 × 18 cm</span>
                          </div>
                          <div className="bg-muted/40 p-3 rounded-xl border border-border flex items-center justify-between">
                            <span className="text-muted-foreground">8" Tier</span>
                            <span className="text-foreground font-bold">16 × 11 × 20 cm</span>
                          </div>
                          <div className="bg-muted/40 p-3 rounded-xl border border-border flex items-center justify-between">
                            <span className="text-muted-foreground">9" Tier</span>
                            <span className="text-foreground font-bold">18 × 12 × 23 cm</span>
                          </div>
                          <div className="bg-muted/40 p-3 rounded-xl border border-border flex items-center justify-between">
                            <span className="text-muted-foreground">10" Tier</span>
                            <span className="text-foreground font-bold">20 × 14 × 26 cm</span>
                          </div>
                        </div>
                      </div>

                      {/* COMPLIMENTARY CUSTOMIZATION */}
                      <div className="pt-4 border-t border-border space-y-3">
                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider block">Complimentary Customization</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>Logo Laser Engraving</span>
                          </div>
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>Recipient Name Inscription</span>
                          </div>
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>Tournament / Event Text</span>
                          </div>
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>Velvet Presentation Box</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CORPORATE VOLUME PRICING MATRIX TABLE */}
                    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-5">
                      <div className="flex items-center space-x-3 border-b border-border pb-4">
                        <Layers className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-display text-foreground font-normal">Corporate Volume Pricing Matrix</h3>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-muted/40 text-primary">
                              <th className="p-3 font-bold uppercase">Size Tier</th>
                              <th className="p-3 font-bold uppercase">Dimensions</th>
                              <th className="p-3 font-bold uppercase">1-10 PCs</th>
                              <th className="p-3 font-bold uppercase">11-25 PCs</th>
                              <th className="p-3 font-bold uppercase">26-50 PCs</th>
                              <th className="p-3 font-bold uppercase text-right">51+ PCs (Wholesale)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-foreground">
                            <tr>
                              <td className="p-3 font-bold">7" Tier</td>
                              <td className="p-3 text-muted-foreground">14 × 10 × 18 cm</td>
                              <td className="p-3">₹14,500</td>
                              <td className="p-3">₹13,200</td>
                              <td className="p-3">₹12,100</td>
                              <td className="p-3 text-right font-bold text-primary">₹10,999</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-bold">8" Tier</td>
                              <td className="p-3 text-muted-foreground">16 × 11 × 20 cm</td>
                              <td className="p-3">₹16,500</td>
                              <td className="p-3">₹15,000</td>
                              <td className="p-3">₹13,800</td>
                              <td className="p-3 text-right font-bold text-primary">₹12,499</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-bold">9" Tier</td>
                              <td className="p-3 text-muted-foreground">18 × 12 × 23 cm</td>
                              <td className="p-3">₹18,900</td>
                              <td className="p-3">₹17,200</td>
                              <td className="p-3">₹15,800</td>
                              <td className="p-3 text-right font-bold text-primary">₹14,299</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-bold">10" Tier</td>
                              <td className="p-3 text-muted-foreground">20 × 14 × 26 cm</td>
                              <td className="p-3">₹21,500</td>
                              <td className="p-3">₹19,800</td>
                              <td className="p-3">₹18,200</td>
                              <td className="p-3 text-right font-bold text-primary">₹16,499</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Detail View Footer */}
                <div className="p-5 bg-card border-t border-border flex items-center justify-between flex-shrink-0">
                  <div className="text-xs text-foreground font-medium">
                    <strong className="text-primary font-mono text-sm">{items.length}</strong> total items selected in your list.
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailProduct(null)}
                    className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    ← Back
                  </button>
                </div>

              </div>
            ) : (
              /* CATALOG VERTICAL LIST & SIDEWISE DROPDOWN FILTERS VIEW */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* MOBILE HEADER (< 640px) — Ultra-compact 3-row layout       */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="sm:hidden p-2.5 bg-card border-b border-border flex-shrink-0 space-y-2">
                  {/* Row 1: Title + Close */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-display text-foreground tracking-wide flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-primary shrink-0" />
                      <span>Catalog & SKU Selector</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCatalogModal(false)}
                      className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors flex-shrink-0"
                      title="Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Row 2: Search + Reset */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Search className="w-3 h-3 text-primary absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={modalSearch}
                        onChange={(e) => setModalSearch(e.target.value)}
                        placeholder="Search name, SKU..."
                        className="w-full bg-background border border-border rounded-lg pl-7 pr-6 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary transition-colors font-medium placeholder:text-muted-foreground h-8"
                      />
                      {modalSearch && (
                        <button onClick={() => setModalSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold">
                          ×
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className={`h-8 px-2.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all shrink-0 ${
                        filterCategory === 'all' && filterSubcategory === 'all' && filterType === 'all' && filterMaterial === 'all' && modalSearch === ''
                          ? 'btn-primary text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ALL
                    </button>
                  </div>

                  {/* Row 3: 3 Filter Pill Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Category Pill */}
                    <button
                      type="button"
                      onClick={() => setMobileFilterSheet(mobileFilterSheet === 'category' ? null : 'category')}
                      className={`flex-1 flex items-center justify-center gap-1 h-7 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                        filterCategory !== 'all' || filterSubcategory !== 'all'
                          ? 'bg-primary/15 text-primary border-primary'
                          : 'bg-card text-foreground border-border'
                      }`}
                    >
                      <span className="truncate">{filterCategory !== 'all' ? filterCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Category'}</span>
                      {(filterCategory !== 'all' || filterSubcategory !== 'all') && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${mobileFilterSheet === 'category' ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Type Pill */}
                    <button
                      type="button"
                      onClick={() => setMobileFilterSheet(mobileFilterSheet === 'type' ? null : 'type')}
                      className={`flex-1 flex items-center justify-center gap-1 h-7 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                        filterType !== 'all'
                          ? 'bg-primary/15 text-primary border-primary'
                          : 'bg-card text-foreground border-border'
                      }`}
                    >
                      <span className="truncate">{filterType !== 'all' ? filterType.charAt(0).toUpperCase() + filterType.slice(1) : 'Type'}</span>
                      {filterType !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${mobileFilterSheet === 'type' ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Material Pill */}
                    <button
                      type="button"
                      onClick={() => setMobileFilterSheet(mobileFilterSheet === 'material' ? null : 'material')}
                      className={`flex-1 flex items-center justify-center gap-1 h-7 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${
                        filterMaterial !== 'all'
                          ? 'bg-primary/15 text-primary border-primary'
                          : 'bg-card text-foreground border-border'
                      }`}
                    >
                      <span className="truncate">{filterMaterial !== 'all' ? filterMaterial.charAt(0).toUpperCase() + filterMaterial.slice(1) : 'Material'}</span>
                      {filterMaterial !== 'all' && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${mobileFilterSheet === 'material' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* MOBILE FILTER BOTTOM SHEETS (inline accordion subcats)    */}
                {/* ═══════════════════════════════════════════════════════════ */}
                {mobileFilterSheet && (
                  <div className="sm:hidden bg-muted/50 border-b border-border max-h-[45vh] overflow-y-auto flex-shrink-0">
                    <div className="p-2.5 space-y-1">
                      {mobileFilterSheet === 'category' && (
                        <>
                          <button
                            type="button"
                            onClick={() => { setFilterCategory('all'); setFilterSubcategory('all'); setMobileFilterSheet(null); setExpandedMobileCat(null); }}
                            className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all ${
                              filterCategory === 'all' ? 'btn-primary text-white shadow-sm' : 'bg-card text-foreground hover:bg-muted border border-border'
                            }`}
                          >
                            ✓ All Categories
                          </button>
                          {categoryStructure.map((cat) => {
                            const isExpanded = expandedMobileCat === cat.slug;
                            const isSelected = filterCategory === cat.slug;
                            return (
                              <div key={cat.slug} className="space-y-0.5">
                                <div className="flex items-stretch rounded-xl overflow-hidden border border-border bg-card">
                                  {/* Category name — tapping selects it */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFilterCategory(cat.slug);
                                      setFilterSubcategory('all');
                                      setMobileFilterSheet(null);
                                      setExpandedMobileCat(null);
                                    }}
                                    className={`flex-1 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition-all ${
                                      isSelected ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-muted'
                                    }`}
                                  >
                                    {cat.name}
                                    {cat.subcategories.length > 0 && (
                                      <span className="text-muted-foreground font-normal ml-1">({cat.subcategories.length})</span>
                                    )}
                                  </button>
                                  {/* Expand arrow — tapping shows subcategories */}
                                  {cat.subcategories.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedMobileCat(isExpanded ? null : cat.slug)}
                                      className={`px-3 border-l border-border flex items-center justify-center transition-all ${
                                        isExpanded ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-primary hover:bg-muted'
                                      }`}
                                    >
                                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                  )}
                                </div>
                                {/* Inline Subcategory Accordion */}
                                {isExpanded && cat.subcategories.length > 0 && (
                                  <div className="ml-3 pl-3 border-l-2 border-primary/40 space-y-0.5 py-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFilterCategory(cat.slug);
                                        setFilterSubcategory('all');
                                        setMobileFilterSheet(null);
                                        setExpandedMobileCat(null);
                                      }}
                                      className={`w-full px-3 py-2 rounded-lg text-left text-[11px] font-semibold transition-all ${
                                        filterCategory === cat.slug && filterSubcategory === 'all' ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-muted'
                                      }`}
                                    >
                                      All {cat.name}
                                    </button>
                                    {cat.subcategories.map((sub) => (
                                      <button
                                        key={sub}
                                        type="button"
                                        onClick={() => {
                                          setFilterCategory(cat.slug);
                                          setFilterSubcategory(sub.toLowerCase());
                                          setMobileFilterSheet(null);
                                          setExpandedMobileCat(null);
                                        }}
                                        className={`w-full px-3 py-2 rounded-lg text-left text-[11px] font-medium transition-all ${
                                          filterSubcategory === sub.toLowerCase() ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-muted'
                                        }`}
                                      >
                                        {sub}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      )}

                      {mobileFilterSheet === 'type' && (
                        <>
                          <button
                            type="button"
                            onClick={() => { setFilterType('all'); setMobileFilterSheet(null); }}
                            className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all ${
                              filterType === 'all' ? 'btn-primary text-white shadow-sm' : 'bg-card text-foreground hover:bg-muted border border-border'
                            }`}
                          >
                            ✓ All Types
                          </button>
                          {['Trophy', 'Plaque', 'Medal', 'Pin', 'Badge'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => { setFilterType(t.toLowerCase()); setMobileFilterSheet(null); }}
                              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                                filterType === t.toLowerCase() ? 'bg-primary/10 text-primary font-bold border border-primary/30' : 'bg-card text-foreground hover:bg-muted border border-border'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </>
                      )}

                      {mobileFilterSheet === 'material' && (
                        <>
                          <button
                            type="button"
                            onClick={() => { setFilterMaterial('all'); setMobileFilterSheet(null); }}
                            className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all ${
                              filterMaterial === 'all' ? 'btn-primary text-white shadow-sm' : 'bg-card text-foreground hover:bg-muted border border-border'
                            }`}
                          >
                            ✓ All Materials
                          </button>
                          {['Crystal', 'Metal', 'Wooden', 'Resin', 'Glass', 'Acrylic'].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => { setFilterMaterial(m.toLowerCase()); setMobileFilterSheet(null); }}
                              className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all ${
                                filterMaterial === m.toLowerCase() ? 'bg-primary/10 text-primary font-bold border border-primary/30' : 'bg-card text-foreground hover:bg-muted border border-border'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* DESKTOP/TABLET HEADER (≥ 640px) — Spacious layout         */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="hidden sm:block p-5 lg:p-6 bg-card border-b border-border space-y-4 flex-shrink-0 relative">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xl lg:text-2xl font-display text-foreground tracking-wide flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-primary shrink-0" />
                        <span>Showroom Catalog & SKU Selector</span>
                      </h3>
                      <p className="hidden lg:block text-xs text-muted-foreground mt-1 font-sans">
                        Scroll vertically through all awards. Click any row to view full specifications in this window.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCatalogModal(false)}
                      className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition-colors flex-shrink-0"
                      title="Close Mini Window"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Desktop Filter Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 relative">
                    
                    {/* Keyword Search Input */}
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-primary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={modalSearch}
                        onChange={(e) => setModalSearch(e.target.value)}
                        placeholder="Search Award Name, SKU..."
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-7 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-colors font-medium placeholder:text-muted-foreground h-10"
                      />
                      {modalSearch && (
                        <button onClick={() => setModalSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold">
                          ×
                        </button>
                      )}
                    </div>

                    {/* ALL Button */}
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className={`h-10 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                        filterCategory === 'all' && filterSubcategory === 'all' && filterType === 'all' && filterMaterial === 'all' && modalSearch === ''
                          ? 'btn-primary text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                      }`}
                    >
                      ALL
                    </button>

                    {/* CATEGORY DROPDOWN (Desktop — hover subcategory flyout) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                        className={`flex items-center justify-between gap-1.5 h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all min-w-[150px] ${
                          filterCategory !== 'all' || filterSubcategory !== 'all'
                            ? 'bg-primary/10 text-primary border-primary'
                            : 'bg-card text-foreground border-border hover:border-primary'
                        }`}
                      >
                        <span className="truncate">
                          {filterSubcategory !== 'all' ? `Sub: ${filterSubcategory}` : filterCategory !== 'all' ? `Cat: ${filterCategory}` : 'Categories'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
                      </button>

                      {activeDropdown === 'category' && (
                        <div className="absolute top-full left-0 mt-2 z-50 flex shadow-2xl bg-card border border-border rounded-2xl overflow-visible min-w-[180px] animate-in fade-in-50 duration-150">
                          <div className="py-1.5 flex flex-col w-56 divide-y divide-border max-h-[60vh] overflow-y-auto">
                            <button
                              type="button"
                              onClick={() => { setFilterCategory('all'); setFilterSubcategory('all'); setActiveDropdown(null); }}
                              className="px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wider hover:bg-muted text-foreground flex items-center justify-between"
                            >
                              <span>✓ All Categories</span>
                            </button>

                            {categoryStructure.map((cat) => {
                              const isHovered = hoveredCategory === cat.slug;
                              const isSelected = filterCategory === cat.slug;
                              return (
                                <div 
                                  key={cat.slug} 
                                  className="relative group"
                                  onMouseEnter={() => setHoveredCategory(cat.slug)}
                                  onMouseLeave={() => setHoveredCategory(null)}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFilterCategory(cat.slug);
                                      setFilterSubcategory('all');
                                      setActiveDropdown(null);
                                    }}
                                    className={`w-full px-3.5 py-2.5 text-left text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                                      isSelected || isHovered ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-muted'
                                    }`}
                                  >
                                    <span>{cat.name}</span>
                                    {cat.subcategories.length > 0 && <ChevronRight className="w-4 h-4 text-primary" />}
                                  </button>

                                  {isHovered && cat.subcategories.length > 0 && (
                                    <div 
                                      className="absolute left-full top-0 ml-1.5 w-60 bg-card border-2 border-primary/60 rounded-2xl py-2 shadow-2xl z-50"
                                      onMouseEnter={() => setHoveredCategory(cat.slug)}
                                      onMouseLeave={() => setHoveredCategory(null)}
                                    >
                                      <div className="px-4 py-1.5 text-[10px] font-mono text-primary uppercase tracking-widest border-b border-border font-black">
                                        {cat.name} Subcategories
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFilterCategory(cat.slug);
                                          setFilterSubcategory('all');
                                          setActiveDropdown(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-xs text-foreground hover:text-primary hover:bg-muted font-medium block transition-colors"
                                      >
                                        • All {cat.name}
                                      </button>
                                      {cat.subcategories.map((sub) => (
                                        <button
                                          key={sub}
                                          type="button"
                                          onClick={() => {
                                            setFilterCategory(cat.slug);
                                            setFilterSubcategory(sub.toLowerCase());
                                            setActiveDropdown(null);
                                          }}
                                          className={`w-full px-4 py-2.5 text-left text-xs font-medium block transition-colors ${
                                            filterSubcategory === sub.toLowerCase() ? 'text-primary bg-primary/10 font-bold' : 'text-foreground hover:bg-muted'
                                          }`}
                                        >
                                          • {sub}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* TYPE DROPDOWN (Desktop) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                        className={`flex items-center justify-between gap-1.5 h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all min-w-[130px] ${
                          filterType !== 'all'
                            ? 'bg-primary/10 text-primary border-primary'
                            : 'bg-card text-foreground border-border hover:border-primary'
                        }`}
                      >
                        <span>{filterType !== 'all' ? `Type: ${filterType}` : 'Award Type'}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
                      </button>

                      {activeDropdown === 'type' && (
                        <div className="absolute top-full left-0 mt-2 z-50 w-48 bg-card border border-border rounded-2xl py-2 shadow-2xl">
                          <button
                            onClick={() => { setFilterType('all'); setActiveDropdown(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-wider hover:bg-muted text-foreground"
                          >
                            ✓ All Types
                          </button>
                          {['Trophy', 'Plaque', 'Medal', 'Pin', 'Badge'].map((t) => (
                            <button
                              key={t}
                              onClick={() => { setFilterType(t.toLowerCase()); setActiveDropdown(null); }}
                              className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-muted block ${
                                filterType === t.toLowerCase() ? 'text-primary bg-primary/10 font-bold' : 'text-foreground'
                              }`}
                            >
                              • {t}s
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* MATERIAL DROPDOWN (Desktop) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === 'material' ? null : 'material')}
                        className={`flex items-center justify-between gap-1.5 h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all min-w-[130px] ${
                          filterMaterial !== 'all'
                            ? 'bg-primary/10 text-primary border-primary'
                            : 'bg-card text-foreground border-border hover:border-primary'
                        }`}
                      >
                        <span>{filterMaterial !== 'all' ? `Mat: ${filterMaterial}` : 'Material'}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'material' ? 'rotate-180' : ''}`} />
                      </button>

                      {activeDropdown === 'material' && (
                        <div className="absolute top-full right-0 mt-2 z-50 w-48 bg-card border border-border rounded-2xl py-2 shadow-2xl">
                          <button
                            onClick={() => { setFilterMaterial('all'); setActiveDropdown(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-wider hover:bg-muted text-foreground"
                          >
                            ✓ All Materials
                          </button>
                          {['Crystal', 'Metal', 'Wooden', 'Resin', 'Glass', 'Acrylic'].map((m) => (
                            <button
                              key={m}
                              onClick={() => { setFilterMaterial(m.toLowerCase()); setActiveDropdown(null); }}
                              className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-muted block ${
                                filterMaterial === m.toLowerCase() ? 'text-primary bg-primary/10 font-bold' : 'text-foreground'
                              }`}
                            >
                              • {m}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* VERTICAL FULL-LENGTH PRODUCT CARDS */}
                <div className="flex-1 overflow-y-auto p-1.5 sm:p-4 lg:p-8 bg-background space-y-2 sm:space-y-4">
                  {filteredModalProducts.length > 0 ? (
                    filteredModalProducts.map((prod) => {
                      const added = isInInquiry(prod.id);
                      return (
                        <div
                          key={prod.id}
                          className="group w-full bg-card border border-border hover:border-primary rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-row items-stretch"
                        >
                          {/* Image Showcase Column */}
                          <div 
                            onClick={() => setSelectedDetailProduct(prod)}
                            className="w-20 mobile-mid:w-24 sm:w-44 lg:w-60 xl:w-64 relative aspect-square lg:aspect-auto bg-muted/40 flex-shrink-0 cursor-pointer overflow-hidden group-hover:brightness-105 transition-all"
                            title="Click to inspect full specifications"
                          >
                            <SmartImage
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-full h-full"
                              imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              fallbackIcon={<Trophy className="w-6 h-6 sm:w-12 sm:h-12 text-primary/50 stroke-[1.5]" />}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/40 hidden lg:block pointer-events-none" />
                            
                            <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 bg-primary text-white font-mono font-black text-[7px] sm:text-[10px] px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest shadow-md">
                              {prod.typeName}
                            </span>
                          </div>

                          {/* Content & Action Column */}
                          <div className="flex-1 p-2 sm:p-4 lg:p-6 flex flex-col justify-between min-w-0">
                            <div 
                              onClick={() => setSelectedDetailProduct(prod)}
                              className="space-y-0.5 sm:space-y-2 cursor-pointer text-left"
                            >
                              <div className="flex items-center text-[8px] sm:text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex-wrap gap-0.5 sm:gap-1">
                                <span className="text-primary truncate max-w-[100px] sm:max-w-none">{prod.categorySlug}</span>
                                <span className="hidden mobile-mid:inline text-muted-foreground">•</span>
                                <span className="hidden mobile-mid:inline truncate">{prod.subcategoryName}</span>
                                <span className="bg-muted text-foreground px-1 sm:px-2 py-0.5 rounded border border-border text-[8px] sm:text-[10px]">SKU: {prod.sku}</span>
                              </div>

                              <h4 className="font-display text-[11px] mobile-mid:text-xs sm:text-xl lg:text-2xl font-normal text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-1 sm:line-clamp-2">
                                {prod.name}
                              </h4>

                              <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground font-light leading-relaxed line-clamp-1 lg:line-clamp-2">
                                {prod.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1 sm:pt-2 border-t border-border">
                                <span className="bg-card text-primary font-mono font-bold text-[8px] sm:text-[10px] px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-border flex items-center space-x-0.5 sm:space-x-1">
                                  <Ruler className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                                  <span>{prod.dimL}×{prod.dimB}×{prod.dimH} {prod.sizeUnit}</span>
                                </span>
                                {(prod.materials || []).slice(0, 2).map((mat: string, idx: number) => (
                                  <span key={idx} className="hidden mobile-mid:inline bg-muted text-foreground font-mono text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-border font-semibold">
                                    {mat}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Price & Add Button Row */}
                            <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 border-t border-border mt-1.5 sm:mt-2">
                              <div>
                                <span className="text-[7px] sm:text-[10px] uppercase font-bold tracking-widest text-muted-foreground block font-sans">Lowest Price</span>
                                <span className="text-[11px] sm:text-lg lg:text-2xl font-black text-primary font-mono tracking-tight block">
                                  {prod.priceRange}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (added) {
                                    removeItem(prod.id);
                                    toast.info(`Removed ${prod.sku} from list.`);
                                  } else {
                                    addItem({
                                      productId: prod.id,
                                      slug: prod.slug,
                                      name: prod.name,
                                      sku: prod.sku,
                                      imageUrl: prod.imageUrl,
                                      priceRange: prod.priceRange,
                                      categoryName: prod.categorySlug,
                                      quantity: 1,
                                    });
                                    toast.success(`${prod.sku} added to List!`);
                                  }
                                }}
                                className={`py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center space-x-1 sm:space-x-2 shrink-0 ${
                                  added
                                    ? 'bg-emerald-600 text-white border border-emerald-400 hover:bg-emerald-700'
                                    : 'btn-primary text-white hover:scale-[1.02]'
                                }`}
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" />
                                <span>{added ? '✓ IN LIST' : '+ ADD'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 sm:py-28 text-center text-muted-foreground space-y-3 sm:space-y-4">
                      <Trophy className="w-10 h-10 sm:w-16 sm:h-16 mx-auto opacity-30 text-primary" />
                      <p className="text-xs sm:text-xl font-medium text-foreground">No awards found for this filter.</p>
                      <button 
                        onClick={handleResetFilters} 
                        className="text-[9px] sm:text-xs text-white uppercase font-mono font-black tracking-widest btn-primary px-3 sm:px-6 py-2 sm:py-3 rounded-xl hover:scale-105 transition-all shadow-md"
                      >
                        Reset to ALL Awards
                      </button>
                    </div>
                  )}
                </div>

                {/* Modal Footer — Slim 1-line bar */}
                <div className="px-2.5 py-2 sm:p-4 lg:p-5 bg-card border-t border-border flex flex-row items-center justify-between gap-2 flex-shrink-0">
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-[9px] sm:text-xs text-foreground truncate min-w-0">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="truncate"><strong className="text-primary font-mono font-bold">{items.length}</strong> SKUs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCatalogModal(false)}
                    className="py-1.5 sm:py-3 px-3 sm:px-8 btn-primary text-white font-black text-[9px] sm:text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:scale-[1.02] shrink-0"
                  >
                    ✓ Done ({items.length})
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
