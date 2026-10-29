'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Image from 'next/image';
import { useSettingsStore } from '@/stores/settings-store';
import { SmartImage } from '@/components/ui/smart-image';
import {
  Settings,
  Save,
  Globe,
  Share2,
  Building,
  Image as ImageIcon,
  Loader2,
  Edit2,
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  LayoutTemplate,
  Info,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  Tag,
  Clock,
} from 'lucide-react';

const fullSettingsSchema = z.object({
  // Brand Identity
  site_name: z.string().min(1, 'Site name is required').trim(),
  site_logo: z.string().optional().nullable(),

  // Homepage Hero Section
  hero_banner_image: z.string().optional().nullable(),
  hero_headline: z.string().optional().nullable(),
  hero_subtitle: z.string().optional().nullable(),

  // Homepage Curated Ranges (Fixed 6 Cards)
  curated_card_1_title: z.string().optional().nullable(),
  curated_card_1_image: z.string().optional().nullable(),
  curated_card_2_title: z.string().optional().nullable(),
  curated_card_2_image: z.string().optional().nullable(),
  curated_card_3_title: z.string().optional().nullable(),
  curated_card_3_image: z.string().optional().nullable(),
  curated_card_4_title: z.string().optional().nullable(),
  curated_card_4_image: z.string().optional().nullable(),
  curated_card_5_title: z.string().optional().nullable(),
  curated_card_5_image: z.string().optional().nullable(),
  curated_card_6_title: z.string().optional().nullable(),
  curated_card_6_image: z.string().optional().nullable(),

  // About Page Story & Philosophy
  about_story_headline: z.string().optional().nullable(),
  about_story_text: z.string().optional().nullable(),
  about_story_image: z.string().optional().nullable(),
  about_years_badge: z.string().optional().nullable(),
  about_years_subtext: z.string().optional().nullable(),

  // Contact & Location
  contact_phone: z.string().optional().nullable(),
  contact_email: z.string().optional().nullable(),
  contact_address: z.string().optional().nullable(),
  contact_street_address: z.string().optional().nullable(),
  contact_city: z.string().optional().nullable(),
  contact_state: z.string().optional().nullable(),
  contact_postal_code: z.string().optional().nullable(),
  map_pin_url: z.string().optional().nullable(),
  store_locations: z.any().optional().nullable(),

  // Operating / Working Hours
  operating_hours_mon_fri: z.string().optional().nullable(),
  operating_hours_saturday: z.string().optional().nullable(),
  operating_hours_sunday: z.string().optional().nullable(),
  operating_hours_note: z.string().optional().nullable(),

  // Social Connections
  social_facebook: z.string().optional().nullable(),
  social_instagram: z.string().optional().nullable(),
  social_linkedin: z.string().optional().nullable(),
  social_whatsapp: z.string().optional().nullable(),

  // SEO Metadata
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
  seo_keywords: z.string().optional().nullable(),

  // Inquiry Form Subjects (JSON String Array or Array Object)
  inquiry_subjects: z.any().optional().nullable(),

  // Footer Collections Links (JSON Array of { label, url })
  footer_collections: z.any().optional().nullable(),
});

type SettingsFormInput = z.infer<typeof fullSettingsSchema>;

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'curated' | 'about' | 'contact' | 'working_hours' | 'social' | 'seo' | 'inquiries' | 'footer_collections'>('branding');
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [newFooterLabel, setNewFooterLabel] = useState('');
  const [newFooterUrl, setNewFooterUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormInput>({
    resolver: zodResolver(fullSettingsSchema),
    defaultValues: {
      site_name: "Aryan's Trophy World",
      site_logo: '',
      hero_banner_image: '',
      hero_headline: 'Every trophy tells a story worth engraving.',
      hero_subtitle: 'Complimentary custom engraving on every award. Handcrafted for tournaments, corporate honors, and champions.',
      curated_card_1_title: 'Sports Awards', curated_card_1_image: '',
      curated_card_2_title: 'Corporate Awards', curated_card_2_image: '',
      curated_card_3_title: 'Academic Honors', curated_card_3_image: '',
      curated_card_4_title: 'Crystal Monuments', curated_card_4_image: '',
      curated_card_5_title: 'Victory Medals', curated_card_5_image: '',
      curated_card_6_title: 'Bespoke Plaques', curated_card_6_image: '',
      about_story_headline: 'Our Craftsmanship & Heritage',
      about_story_text: 'Aryan Trophy World stands at the forefront of monumental award engineering. Born out of a passion for celebrating human achievement, our atelier blends traditional metallurgy with state-of-the-art Italian diamond laser technology.',
      about_story_image: '',
      about_years_badge: '15+ Years',
      about_years_subtext: 'Heritage of In-House Precision Manufacturing',
      contact_phone: '+91-9876543210',
      contact_email: 'concierge@aryantrophyworld.com',
      contact_address: 'Shop 12, Trophy Market, MG Road, Mumbai, Maharashtra 400001',
      contact_street_address: 'Shop 12, Trophy Market, MG Road',
      contact_city: 'Mumbai',
      contact_state: 'Maharashtra',
      contact_postal_code: '400001',
      map_pin_url: 'https://maps.app.goo.gl/XEeSqtBQRqy8ksLz5?g_st=aw',
      store_locations: JSON.stringify([
        {
          id: 'store-1',
          name: 'Mumbai Main Atelier & Showroom',
          street_address: 'Shop 12, Trophy Market, MG Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          postal_code: '400001',
          phone: '+91-9876543210',
          email: 'concierge@aryantrophyworld.com',
          map_pin_url: 'https://maps.app.goo.gl/XEeSqtBQRqy8ksLz5?g_st=aw'
        }
      ]),
      operating_hours_mon_fri: '10:00 - 20:00 IST',
      operating_hours_saturday: '10:00 - 18:00 IST',
      operating_hours_sunday: 'By Appointment Only',
      operating_hours_note: '* Urgent tournament dispatch support and emergency wholesale manufacturing available 24/7 for verified client accounts.',
      social_facebook: 'https://facebook.com',
      social_instagram: 'https://instagram.com',
      social_linkedin: 'https://linkedin.com',
      social_whatsapp: 'https://wa.me/919876543210',
      seo_title: 'Aryan Trophy World | Luxury Awards & Corporate Trophies',
      seo_description: 'Discover prestige custom trophies, crystal awards, corporate plaques, and championship cups in Mumbai.',
      seo_keywords: 'trophy maker mumbai, custom crystal trophies, corporate shields, wholesale awards, championship medals',
      inquiry_subjects: JSON.stringify(["Bespoke Trophy Commission", "Wholesale Catalog Order", "Laser Engraving & UV Printing", "General Workshop Inquiry"]),
      footer_collections: JSON.stringify([
        { label: 'Sports Series', url: '/catalog?category=Sports' },
        { label: 'Corporate Glass', url: '/catalog?material=Crystal' },
        { label: 'Academic Gold', url: '/catalog?material=Metal' },
        { label: 'Bespoke Casing', url: '/catalog?material=Wooden' },
        { label: 'Limited Range', url: '/catalog?collection=Premium' },
      ]),
    },
  });

  const watchValues = watch();

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/settings?public=false', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.map) {
          const map = json.data.map;
          reset({
            site_name: map.site_name || "Aryan's Trophy World",
            site_logo: map.site_logo || '',
            hero_banner_image: map.hero_banner_image || '',
            hero_headline: map.hero_headline || 'Every trophy tells a story worth engraving.',
            hero_subtitle: map.hero_subtitle || 'Complimentary custom engraving on every award.',
            curated_card_1_title: map.curated_card_1_title || 'Sports Awards',
            curated_card_1_image: map.curated_card_1_image || '',
            curated_card_2_title: map.curated_card_2_title || 'Corporate Awards',
            curated_card_2_image: map.curated_card_2_image || '',
            curated_card_3_title: map.curated_card_3_title || 'Academic Honors',
            curated_card_3_image: map.curated_card_3_image || '',
            curated_card_4_title: map.curated_card_4_title || 'Crystal Monuments',
            curated_card_4_image: map.curated_card_4_image || '',
            curated_card_5_title: map.curated_card_5_title || 'Victory Medals',
            curated_card_5_image: map.curated_card_5_image || '',
            curated_card_6_title: map.curated_card_6_title || 'Bespoke Plaques',
            curated_card_6_image: map.curated_card_6_image || '',
            about_story_headline: map.about_story_headline || 'Our Craftsmanship & Heritage',
            about_story_text: map.about_story_text || 'Aryan Trophy World stands at the forefront of monumental award engineering.',
            about_story_image: map.about_story_image || '',
            about_years_badge: map.about_years_badge || '15+ Years',
            about_years_subtext: map.about_years_subtext || 'Heritage of In-House Precision Manufacturing',
            contact_phone: map.contact_phone || '+91-9876543210',
            contact_email: map.contact_email || 'concierge@aryantrophyworld.com',
            contact_address: map.contact_address || 'Shop 12, Trophy Market, MG Road, Mumbai, Maharashtra 400001',
            contact_street_address: map.contact_street_address || 'Shop 12, Trophy Market, MG Road',
            contact_city: map.contact_city || 'Mumbai',
            contact_state: map.contact_state || 'Maharashtra',
            contact_postal_code: map.contact_postal_code || '400001',
            map_pin_url: map.map_pin_url || 'https://maps.app.goo.gl/XEeSqtBQRqy8ksLz5?g_st=aw',
            store_locations: map.store_locations || JSON.stringify([
              {
                id: 'store-1',
                name: 'Mumbai Main Atelier & Showroom',
                street_address: 'Shop 12, Trophy Market, MG Road',
                city: 'Mumbai',
                state: 'Maharashtra',
                postal_code: '400001',
                phone: '+91-9876543210',
                email: 'concierge@aryantrophyworld.com',
                map_pin_url: 'https://maps.app.goo.gl/XEeSqtBQRqy8ksLz5?g_st=aw'
              }
            ]),
            operating_hours_mon_fri: map.operating_hours_mon_fri || '10:00 - 20:00 IST',
            operating_hours_saturday: map.operating_hours_saturday || '10:00 - 18:00 IST',
            operating_hours_sunday: map.operating_hours_sunday || 'By Appointment Only',
            operating_hours_note: map.operating_hours_note || '* Urgent tournament dispatch support and emergency wholesale manufacturing available 24/7 for verified client accounts.',
            social_facebook: map.social_facebook || 'https://facebook.com',
            social_instagram: map.social_instagram || 'https://instagram.com',
            social_linkedin: map.social_linkedin || 'https://linkedin.com',
            social_whatsapp: map.social_whatsapp || 'https://wa.me/919876543210',
            seo_title: map.seo_title || 'Aryan Trophy World | Luxury Awards & Corporate Trophies',
            seo_description: map.seo_description || 'Prestige awards catalog in Mumbai.',
            seo_keywords: map.seo_keywords || 'trophies, awards, mumbai',
            inquiry_subjects: map.inquiry_subjects || JSON.stringify(["Bespoke Trophy Commission", "Wholesale Catalog Order", "Laser Engraving & UV Printing", "General Workshop Inquiry"]),
            footer_collections: map.footer_collections || JSON.stringify([
              { label: 'Sports Series', url: '/catalog?category=Sports' },
              { label: 'Corporate Glass', url: '/catalog?material=Crystal' },
              { label: 'Academic Gold', url: '/catalog?material=Metal' },
              { label: 'Bespoke Casing', url: '/catalog?material=Wooden' },
              { label: 'Limited Range', url: '/catalog?collection=Premium' },
            ]),
          });
        }
      })
      .catch(() => toast.error('Error fetching settings from database.'))
      .finally(() => setLoading(false));
  }, [reset]);

  const pendingFilesRef = React.useRef<Record<string, File>>({});

  const handleFileUpload = (fieldKey: keyof SettingsFormInput, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store pending file reference
    pendingFilesRef.current[fieldKey] = file;

    // Create instant local preview via DataURL (no network request yet)
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setValue(fieldKey, evt.target.result as string, { shouldDirty: true, shouldValidate: true });
        toast.success(`Image selected! Click "Update Credentials" to upload & save.`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = (fieldKey: keyof SettingsFormInput) => {
    delete pendingFilesRef.current[fieldKey];
    setValue(fieldKey, '', { shouldDirty: true, shouldValidate: true });
    toast.info(`Image removed. Click "Update Credentials" to persist.`);
  };

  const onSubmit = async (data: SettingsFormInput) => {
    setIsSaving(true);
    try {
      const finalData = { ...data };

      // Upload all pending files to Supabase Storage NOW (on submit trigger)
      const pendingKeys = Object.keys(pendingFilesRef.current);
      if (pendingKeys.length > 0) {
        toast.loading(`Uploading ${pendingKeys.length} image(s) to Supabase Storage...`, { id: 'settings-upload' });

        for (const key of pendingKeys) {
          const file = pendingFilesRef.current[key];
          const fd = new FormData();
          fd.append('file', file);
          fd.append('folder', 'branding');

          const res = await fetch('/api/v1/upload', { method: 'POST', body: fd });
          const json = await res.json();
          if (res.ok && json.url) {
            (finalData as any)[key] = json.url;
          } else {
            toast.error(`Failed to upload image for ${key}: ${json.error || 'Server error'}`);
            setIsSaving(false);
            toast.dismiss('settings-upload');
            return;
          }
        }
        toast.dismiss('settings-upload');
      }

      const payload = Object.entries(finalData).map(([key, val]) => {
        let group = 'general';
        if (key.startsWith('hero_') || key.startsWith('curated_')) group = 'homepage';
        else if (key.startsWith('about_')) group = 'aboutpage';
        else if (key.startsWith('contact_') || key === 'map_pin_url' || key === 'store_locations') group = 'contact';
        else if (key.startsWith('operating_hours_')) group = 'working_hours';
        else if (key.startsWith('social_')) group = 'social';
        else if (key.startsWith('seo_')) group = 'seo';
        else if (key.startsWith('site_')) group = 'branding';

        return { key, value: val, group };
      });

      const res = await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success('Site configurations successfully updated in database!');
        pendingFilesRef.current = {};
        setIsEditing(false);
        reset(finalData);
        useSettingsStore.getState().fetchSettings();
        router.refresh();
      } else {
        toast.error(json.error || json.message || 'Failed to update site settings.');
      }
    } catch {
      toast.error('Network failure while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-6">
        <Skeleton className="h-10 w-64 bg-gray-800" />
        <Skeleton className="h-96 w-full bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6 text-gray-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/40 flex items-center justify-center text-[#C5A55A]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-white tracking-wide">
                Site Settings & Section Customizer
              </h1>
              <p className="text-xs text-gray-400">
                Manage global brand identity, home section banners, about story text, and SEO metadata directly in database.
              </p>
            </div>
          </div>
        </div>

        {/* View / Edit Mode Toggle Button */}
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <Button
                type="button"
                onClick={() => {
                  pendingFilesRef.current = {};
                  reset();
                  setIsEditing(false);
                }}
                className="border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white font-bold text-xs h-10 px-3.5 rounded-lg flex items-center space-x-1.5"
                title="Cancel & Exit Edit Mode"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
                <span>Cancel</span>
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit, (errs) => {
                  const fields = Object.keys(errs).join(', ');
                  toast.error(`Please fix validation error in: ${fields}`);
                })}
                disabled={isSaving}
                className="bg-[#C5A55A] hover:bg-[#b0924c] text-gray-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Update Credentials</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-[#C5A55A] hover:bg-[#b0924c] text-gray-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Settings</span>
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
        {[
          { id: 'branding', label: '1. Brand Identity', icon: Building },
          { id: 'hero', label: '2. Homepage Hero', icon: Sparkles },
          { id: 'curated', label: '3. Curated Cards (6)', icon: LayoutTemplate },
          { id: 'about', label: '4. About Story', icon: Info },
          { id: 'contact', label: '5. Contact & Multi-Stores', icon: MapPin },
          { id: 'working_hours', label: '6. Operating Hours', icon: Clock },
          { id: 'social', label: '7. Social Links', icon: Share2 },
          { id: 'seo', label: '8. SEO Metadata', icon: Globe },
          { id: 'inquiries', label: '9. Inquiry Subjects', icon: MessageSquare },
          { id: 'footer_collections', label: '10. Footer Collections', icon: Tag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#C5A55A] text-gray-950 shadow-md font-bold'
                  : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form
        onSubmit={handleSubmit(onSubmit, (errs) => {
          const fields = Object.keys(errs).join(', ');
          toast.error(`Please fix validation error in: ${fields}`);
        })}
        className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-6"
      >
        <input type="hidden" {...register('site_logo')} />
        <input type="hidden" {...register('hero_banner_image')} />
        <input type="hidden" {...register('curated_card_1_image')} />
        <input type="hidden" {...register('curated_card_2_image')} />
        <input type="hidden" {...register('curated_card_3_image')} />
        <input type="hidden" {...register('curated_card_4_image')} />
        <input type="hidden" {...register('curated_card_5_image')} />
        <input type="hidden" {...register('curated_card_6_image')} />
        <input type="hidden" {...register('about_story_image')} />
        <input type="hidden" {...register('inquiry_subjects')} />
        <input type="hidden" {...register('store_locations')} />
        <input type="hidden" {...register('footer_collections')} />
        
        {/* TAB 1: BRAND IDENTITY */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#C5A55A] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Brand Identity & Single Replaceable Logo</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Site / Business Name</Label>
                <Input
                  disabled={!isEditing}
                  {...register('site_name')}
                  className="bg-gray-900 border-gray-800 text-white text-sm"
                />
                {errors.site_name && <p className="text-xs text-rose-400">{errors.site_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Upload / Replace Logo Image</Label>
                <div className="flex items-center space-x-4">
                  <SmartImage
                    src={watchValues.site_logo}
                    alt="Logo preview"
                    className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-xl"
                    imgClassName="w-full h-full object-contain p-1"
                    fallbackIcon={<Building className="w-6 h-6 text-gray-600" />}
                  />
                  {isEditing ? (
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-xs px-3.5 py-2 rounded-lg border border-gray-700 text-gray-200 font-bold">
                        <Upload className="w-4 h-4 text-[#C5A55A]" />
                        <span>Upload New Logo</span>
                      </Label>
                      <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('site_logo', e)} />
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-gray-400 truncate">{watchValues.site_logo}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOMEPAGE HERO SECTION */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#C5A55A] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Homepage Hero Headline & Background Banner</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Hero Main Headline</Label>
                <Input disabled={!isEditing} {...register('hero_headline')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Hero Subtitle Paragraph</Label>
                <Textarea disabled={!isEditing} rows={3} {...register('hero_subtitle')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Hero Background Banner Image</Label>
                <div className="flex items-center space-x-4">
                  <SmartImage
                    src={watchValues.hero_banner_image}
                    alt="Hero preview"
                    className="w-32 h-20 bg-gray-900 border border-gray-800 rounded-xl"
                    imgClassName="w-full h-full object-cover"
                    fallbackIcon={<ImageIcon className="w-6 h-6 text-gray-600" />}
                  />
                  {isEditing ? (
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="hero-upload" className="cursor-pointer inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-xs px-3.5 py-2 rounded-lg border border-gray-700 text-gray-200 font-bold">
                        <Upload className="w-4 h-4 text-[#C5A55A]" />
                        <span>Upload New Banner</span>
                      </Label>
                      <input id="hero-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('hero_banner_image', e)} />
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-gray-400 truncate">{watchValues.hero_banner_image}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CURATED RANGES CARDS (FIXED 6) */}
        {activeTab === 'curated' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#C5A55A] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <LayoutTemplate className="w-5 h-5" />
              <span>Homepage Curated Ranges (Fixed 6 Cards)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const titleKey = `curated_card_${num}_title` as keyof SettingsFormInput;
                const imgKey = `curated_card_${num}_image` as keyof SettingsFormInput;
                const currentImg = watchValues[imgKey] as string;

                return (
                  <div key={num} className="bg-gray-900/80 p-4 border border-gray-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#C5A55A]">Curated Card {num}</span>
                      <SmartImage
                        src={currentImg}
                        alt={`Card ${num}`}
                        className="w-12 h-10 rounded border border-gray-700 bg-gray-950"
                        imgClassName="w-full h-full object-cover"
                        fallbackIcon={<ImageIcon className="w-4 h-4 text-gray-600" />}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] text-gray-400">Card Title</Label>
                      <Input disabled={!isEditing} {...register(titleKey)} className="bg-gray-950 border-gray-800 text-xs text-white" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[11px] text-gray-400">Card Cover Image</Label>
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`card-upload-${num}`} className="cursor-pointer bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded border border-gray-700 text-gray-200 text-xs font-bold flex items-center space-x-1.5">
                            <Upload className="w-3.5 h-3.5 text-[#C5A55A]" />
                            <span>Upload Image</span>
                          </Label>
                          <input id={`card-upload-${num}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(imgKey, e)} />
                        </div>
                      ) : (
                        <p className="text-[10px] font-mono text-gray-400 truncate">{currentImg}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT PAGE STORY */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#C5A55A] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>About Us Story & Philosophy Section</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Story Headline</Label>
                <Input disabled={!isEditing} {...register('about_story_headline')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Philosophy / Heritage Narrative</Label>
                <Textarea disabled={!isEditing} rows={4} {...register('about_story_text')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-300">Floating Badge Title (e.g., 15+ Years)</Label>
                  <Input disabled={!isEditing} {...register('about_years_badge')} className="bg-gray-900 border-gray-800 text-white text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-300">Floating Badge Subtext Line</Label>
                  <Input disabled={!isEditing} {...register('about_years_subtext')} className="bg-gray-900 border-gray-800 text-white text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Story Banner Image</Label>
                <div className="flex items-center space-x-4">
                  <SmartImage
                    src={watchValues.about_story_image}
                    alt="Story preview"
                    className="w-32 h-20 bg-gray-900 border border-gray-800 rounded-xl"
                    imgClassName="w-full h-full object-cover"
                    fallbackIcon={<ImageIcon className="w-6 h-6 text-gray-600" />}
                  />
                  {isEditing ? (
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="about-upload" className="cursor-pointer inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-xs px-3.5 py-2 rounded-lg border border-gray-700 text-gray-200 font-bold">
                        <Upload className="w-4 h-4 text-[#C5A55A]" />
                        <span>Upload Story Banner</span>
                      </Label>
                      <input id="about-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload('about_story_image', e)} />
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-gray-400 truncate">{watchValues.about_story_image}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT & MULTI-STORES */}
        {activeTab === 'contact' && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold text-[#C5A55A] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Contact Coordinates, Structured Address & Multi-Store Locations</span>
            </h2>

            {/* Primary Contact Info & Broken Down Address */}
            <div className="space-y-4 bg-gray-900/60 p-5 rounded-xl border border-gray-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-gray-800 pb-2">
                <Building className="w-4 h-4 text-[#C5A55A]" />
                <span>1. Main Atelier Contact & Structured Address</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-300">Telephone Number</Label>
                  <Input disabled={!isEditing} {...register('contact_phone')} className="bg-gray-950 border-gray-800 text-white text-sm" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-300">Contact Email Address</Label>
                  <Input disabled={!isEditing} {...register('contact_email')} className="bg-gray-950 border-gray-800 text-white text-sm" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold text-gray-300">Street Address</Label>
                  <Input disabled={!isEditing} {...register('contact_street_address')} placeholder="e.g. Shop 12, Trophy Market, MG Road" className="bg-gray-950 border-gray-800 text-white text-sm" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-300">City</Label>
                  <Input disabled={!isEditing} {...register('contact_city')} placeholder="e.g. Mumbai" className="bg-gray-950 border-gray-800 text-white text-sm" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-300">State</Label>
                  <Input disabled={!isEditing} {...register('contact_state')} placeholder="e.g. Maharashtra" className="bg-gray-950 border-gray-800 text-white text-sm" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-300">Postal Code (Pincode)</Label>
                  <Input disabled={!isEditing} {...register('contact_postal_code')} placeholder="e.g. 400001" className="bg-gray-950 border-gray-800 text-white text-sm" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-300">Combined / Full Address Line</Label>
                  <Input disabled={!isEditing} {...register('contact_address')} placeholder="Full display address" className="bg-gray-950 border-gray-800 text-white text-sm" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold text-gray-300">Google Map Pin URL</Label>
                  <Input disabled={!isEditing} {...register('map_pin_url')} className="bg-gray-950 border-gray-800 text-xs font-mono text-white" />
                </div>
              </div>
            </div>

            {/* Multi-Store Branches CRUD Manager */}
            {(() => {
              let storesList: any[] = [];
              try {
                const raw = watchValues.store_locations || watch('store_locations');
                storesList = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
              } catch {
                storesList = [];
              }

              const updateStores = (newList: any[]) => {
                setValue('store_locations', JSON.stringify(newList));
              };

              const handleAddStore = () => {
                const newStore = {
                  id: `store-${Date.now()}`,
                  name: `Branch Store #${storesList.length + 1}`,
                  street_address: 'Trophy Market, Main Road',
                  city: watchValues.contact_city || 'Mumbai',
                  state: watchValues.contact_state || 'Maharashtra',
                  postal_code: '400001',
                  phone: watchValues.contact_phone || '+91-9876543210',
                  email: watchValues.contact_email || 'concierge@aryantrophyworld.com',
                  map_pin_url: watchValues.map_pin_url || 'https://maps.google.com',
                };
                updateStores([...storesList, newStore]);
                toast.success('Added new store branch location! Fill details and click Update Credentials to save.');
              };

              const handleStoreChange = (idx: number, field: string, val: string) => {
                const updated = storesList.map((s, i) => i === idx ? { ...s, [field]: val } : s);
                updateStores(updated);
              };

              const handleRemoveStore = (idx: number) => {
                const updated = storesList.filter((_, i) => i !== idx);
                updateStores(updated);
                toast.info('Store branch location removed.');
              };

              return (
                <div className="space-y-6 bg-gray-900/60 p-5 rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-[#C5A55A]" />
                        <span>2. Multiple Stores & Branch Locations ({storesList.length})</span>
                      </h3>
                      <p className="text-xs text-gray-400">
                        Add multiple shop / showroom locations if your business operates in multiple cities or branches.
                      </p>
                    </div>

                    {isEditing && (
                      <Button
                        type="button"
                        onClick={handleAddStore}
                        className="bg-[#C5A55A] hover:bg-[#b0924c] text-gray-950 font-bold text-xs flex items-center space-x-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Store Location</span>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {storesList.map((store, idx) => (
                      <div key={store.id || idx} className="bg-gray-950 p-4 border border-gray-800 rounded-xl space-y-4 relative">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                          <span className="text-xs font-bold text-[#C5A55A] uppercase tracking-wider">
                            Store #{idx + 1}: {store.name || 'Branch'}
                          </span>
                          {isEditing && storesList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveStore(idx)}
                              className="text-gray-400 hover:text-rose-400 text-xs flex items-center space-x-1 transition-colors"
                              title="Delete store"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-400">Store / Branch Name</Label>
                            <Input
                              disabled={!isEditing}
                              value={store.name || ''}
                              onChange={(e) => handleStoreChange(idx, 'name', e.target.value)}
                              className="bg-gray-900 border-gray-800 text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-400">Store Phone</Label>
                            <Input
                              disabled={!isEditing}
                              value={store.phone || ''}
                              onChange={(e) => handleStoreChange(idx, 'phone', e.target.value)}
                              className="bg-gray-900 border-gray-800 text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-[11px] text-gray-400">Street Address</Label>
                            <Input
                              disabled={!isEditing}
                              value={store.street_address || ''}
                              onChange={(e) => handleStoreChange(idx, 'street_address', e.target.value)}
                              className="bg-gray-900 border-gray-800 text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-400">City</Label>
                            <Input
                              disabled={!isEditing}
                              value={store.city || ''}
                              onChange={(e) => handleStoreChange(idx, 'city', e.target.value)}
                              className="bg-gray-900 border-gray-800 text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-400">State</Label>
                            <Input
                              disabled={!isEditing}
                              value={store.state || ''}
                              onChange={(e) => handleStoreChange(idx, 'state', e.target.value)}
                              className="bg-gray-900 border-gray-800 text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-400">Postal Code (Pincode)</Label>
                            <Input
                              disabled={!isEditing}
                              value={store.postal_code || ''}
                              onChange={(e) => handleStoreChange(idx, 'postal_code', e.target.value)}
                              className="bg-gray-900 border-gray-800 text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-gray-400">Store Email</Label>
                            <Input
                              disabled={!isEditing}
                              value={store.email || ''}
                              onChange={(e) => handleStoreChange(idx, 'email', e.target.value)}
                              className="bg-gray-900 border-gray-800 text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-[11px] text-gray-400">Store Google Maps Pin URL</Label>
                            <Input
                              disabled={!isEditing}
                              value={store.map_pin_url || ''}
                              onChange={(e) => handleStoreChange(idx, 'map_pin_url', e.target.value)}
                              className="bg-gray-900 border-gray-800 text-xs font-mono text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 6: OPERATING / WORKING HOURS */}
        {activeTab === 'working_hours' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#C5A55A] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Site Operating & Working Hours Configuration</span>
            </h2>

            <p className="text-xs text-gray-400">
              Configure atelier workshop operating hours displayed on the public contact page and footer credentials.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Monday - Friday Hours</Label>
                <Input disabled={!isEditing} {...register('operating_hours_mon_fri')} placeholder="e.g. 10:00 - 20:00 IST" className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Saturday Hours</Label>
                <Input disabled={!isEditing} {...register('operating_hours_saturday')} placeholder="e.g. 10:00 - 18:00 IST" className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Sunday Hours</Label>
                <Input disabled={!isEditing} {...register('operating_hours_sunday')} placeholder="e.g. By Appointment Only" className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label className="text-xs font-semibold text-gray-300">Special Emergency / Wholesale Note</Label>
                <Textarea disabled={!isEditing} rows={2} {...register('operating_hours_note')} placeholder="e.g. * Urgent tournament dispatch support and emergency wholesale manufacturing available 24/7..." className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SOCIAL LINKS */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#C5A55A] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span>Social Media Brand Connections</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Facebook URL</Label>
                <Input disabled={!isEditing} {...register('social_facebook')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Instagram URL</Label>
                <Input disabled={!isEditing} {...register('social_instagram')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">LinkedIn URL</Label>
                <Input disabled={!isEditing} {...register('social_linkedin')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">WhatsApp URL</Label>
                <Input disabled={!isEditing} {...register('social_whatsapp')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SEO METADATA */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#C5A55A] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>SEO Page Titles & Meta Descriptions</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">SEO Page Title</Label>
                <Input disabled={!isEditing} {...register('seo_title')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">Meta Description</Label>
                <Textarea disabled={!isEditing} rows={3} {...register('seo_description')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-300">SEO Keywords (comma separated)</Label>
                <Input disabled={!isEditing} {...register('seo_keywords')} className="bg-gray-900 border-gray-800 text-white text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: INQUIRY FORM SUBJECTS CRUD */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#C5A55A] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Inquiry Form Subjects CRUD Management</span>
            </h2>

            <p className="text-xs text-gray-400">
              Manage the inquiry topics and subject dropdown choices displayed on the public contact & quotation form.
            </p>

            {/* Subject List & Quick Add */}
            {(() => {
              let subjectsList: string[] = [];
              try {
                const raw = watchValues.inquiry_subjects || watch('inquiry_subjects');
                subjectsList = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
              } catch {
                subjectsList = ["Bespoke Trophy Commission", "Wholesale Catalog Order", "Laser Engraving & UV Printing", "General Workshop Inquiry"];
              }

              const handleAddSubject = () => {
                if (!newSubjectInput.trim()) return;
                const updated = [...subjectsList, newSubjectInput.trim()];
                setValue('inquiry_subjects', JSON.stringify(updated));
                setNewSubjectInput('');
                toast.success(`Subject "${newSubjectInput.trim()}" added to list! Click Save to commit.`);
              };

              const handleRemoveSubject = (idx: number) => {
                const updated = subjectsList.filter((_, i) => i !== idx);
                setValue('inquiry_subjects', JSON.stringify(updated));
                toast.info('Subject removed. Click Save to commit changes.');
              };

              return (
                <div className="space-y-6 bg-gray-900/60 p-6 rounded-2xl border border-gray-800">
                  {/* Active Subjects List */}
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Tag className="w-4 h-4 text-[#C5A55A]" />
                      <span>Active Inquiry Subjects ({subjectsList.length})</span>
                    </Label>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {subjectsList.map((subject, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 bg-gray-800 border border-[#C5A55A]/30 text-gray-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs"
                        >
                          <span className="text-white">{subject}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(idx)}
                              className="text-gray-400 hover:text-rose-400 transition-colors p-0.5 rounded"
                              title="Delete subject"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add New Subject Input (When in Edit Mode) */}
                  {isEditing ? (
                    <div className="pt-4 border-t border-gray-800 space-y-3">
                      <Label className="text-xs font-semibold text-gray-300">Add New Inquiry Subject</Label>
                      <div className="flex items-center space-x-3">
                        <Input
                          value={newSubjectInput}
                          onChange={(e) => setNewSubjectInput(e.target.value)}
                          placeholder="e.g. Tournament Sponsorship & Bulk Quote"
                          className="bg-gray-950 border-gray-800 text-xs text-white flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubject();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddSubject}
                          className="bg-[#C5A55A] hover:bg-[#b0924c] text-gray-950 font-bold text-xs flex items-center space-x-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Subject</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-400 font-mono pt-2">
                      💡 Click "Edit Settings" at the top to add, edit, or remove inquiry subjects.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 10: FOOTER COLLECTIONS LINKS CRUD */}
        {activeTab === 'footer_collections' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#C5A55A] border-b border-gray-800 pb-3 flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>Footer Collections Links Management</span>
            </h2>

            <p className="text-xs text-gray-400">
              Control and customize the collection links displayed in the website footer.
            </p>

            {(() => {
              let footerList: Array<{ label: string; url: string }> = [];
              try {
                const raw = watchValues.footer_collections || watch('footer_collections');
                footerList = typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
              } catch {
                footerList = [];
              }

              const handleAddFooterItem = () => {
                if (!newFooterLabel.trim()) return;
                const updated = [...footerList, { label: newFooterLabel.trim(), url: newFooterUrl.trim() || '/catalog' }];
                setValue('footer_collections', JSON.stringify(updated));
                setNewFooterLabel('');
                setNewFooterUrl('');
                toast.success(`Footer link "${newFooterLabel.trim()}" added! Click Save to commit.`);
              };

              const handleRemoveFooterItem = (idx: number) => {
                const updated = footerList.filter((_, i) => i !== idx);
                setValue('footer_collections', JSON.stringify(updated));
                toast.info('Footer link removed. Click Save to commit changes.');
              };

              return (
                <div className="space-y-6 bg-gray-900/60 p-6 rounded-2xl border border-gray-800">
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Tag className="w-4 h-4 text-[#C5A55A]" />
                      <span>Active Footer Collections ({footerList.length})</span>
                    </Label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {footerList.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-800 border border-gray-700/60 p-3 rounded-xl text-xs font-semibold"
                        >
                          <div>
                            <p className="text-white font-bold">{item.label}</p>
                            <p className="text-[10px] font-mono text-[#C5A55A]">{item.url}</p>
                          </div>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFooterItem(idx)}
                              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="pt-4 border-t border-gray-800 space-y-4">
                      <Label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Add New Footer Collection Link</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          value={newFooterLabel}
                          onChange={(e) => setNewFooterLabel(e.target.value)}
                          placeholder="Link Label (e.g. Corporate Shields)"
                          className="bg-gray-950 border-gray-800 text-white text-xs"
                        />
                        <Input
                          value={newFooterUrl}
                          onChange={(e) => setNewFooterUrl(e.target.value)}
                          placeholder="URL Path (e.g. /catalog?category=Shields)"
                          className="bg-gray-950 border-gray-800 text-white text-xs font-mono"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddFooterItem}
                        className="bg-[#C5A55A] hover:bg-[#b0924c] text-gray-950 font-bold text-xs flex items-center space-x-1.5"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Footer Link
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-400 font-mono pt-2">
                      💡 Click "Edit Settings" at the top to add, edit, or remove footer collection links.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

      </form>
    </div>
  );
}
