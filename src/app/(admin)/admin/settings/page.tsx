'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Settings,
  Save,
  Globe,
  Share2,
  Search,
  Building,
  Image as ImageIcon,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const fullSettingsSchema = z.object({
  // Branding & Info
  site_name: z.string().min(2, 'Site name must be at least 2 characters').trim(),
  tagline: z.string().optional(),
  logo_url: z.string().optional(),
  contact_email: z.string().email('Valid contact email is required').trim(),
  contact_phone: z.string().min(5, 'Valid telephone number is required').trim(),
  address: z.string().optional(),
  
  // SEO Metadata
  seo_title: z.string().min(3, 'SEO page title is required').trim(),
  seo_description: z.string().min(10, 'SEO description should be descriptive').trim(),
  seo_keywords: z.string().optional(),
  
  // Social Links
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

type SettingsFormInput = z.infer<typeof fullSettingsSchema>;

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormInput>({
    resolver: zodResolver(fullSettingsSchema),
    defaultValues: {
      site_name: 'Aryan Trophy World',
      tagline: 'Award Excellence With Premium Trophy Showroom Creations',
      logo_url: '/logo.webp',
      contact_email: 'sales@aryantrophyworld.com',
      contact_phone: '+91 98200 12345',
      address: 'Shop 4, Prestige Trophy Towers, Industrial Estate, Mumbai, MH',
      seo_title: 'Aryan Trophy World | Luxury Awards, Trophies & Corporate Medals',
      seo_description: 'Discover prestige custom trophies, crystal awards, corporate plaques, and championship cups in Mumbai. Wholesale quote showroom.',
      seo_keywords: 'trophy maker mumbai, custom crystal trophies, corporate shields, wholesale awards, championship medals',
      instagram: 'https://instagram.com/aryantrophyworld',
      facebook: 'https://facebook.com/aryantrophyworld',
      linkedin: 'https://linkedin.com/company/aryantrophy',
      twitter: '',
    },
  });

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/settings?public=false', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.map) {
          const map = json.data.map;
          const branding = map['site_info'] || {};
          const seo = map['seo_metadata'] || {};
          const social = map['social_links'] || {};

          reset({
            site_name: branding.site_name || 'Aryan Trophy World',
            tagline: branding.tagline || 'Award Excellence With Premium Trophy Showroom Creations',
            logo_url: branding.logo_url || '/logo.webp',
            contact_email: branding.contact_email || 'sales@aryantrophyworld.com',
            contact_phone: branding.contact_phone || '+91 98200 12345',
            address: branding.address || 'Shop 4, Prestige Trophy Towers, Industrial Estate, Mumbai, MH',
            seo_title: seo.seo_title || 'Aryan Trophy World | Luxury Awards & Corporate Trophies',
            seo_description: seo.seo_description || 'Prestige awards and championship trophies catalog in Mumbai.',
            seo_keywords: seo.seo_keywords || 'trophies, awards, mumbai, crystal awards',
            instagram: social.instagram || '',
            facebook: social.facebook || '',
            linkedin: social.linkedin || '',
            twitter: social.twitter || '',
          });
        }
      })
      .catch(() => toast.error('Diagnostic error while reading global settings from DB.'))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: SettingsFormInput) => {
    setIsSaving(true);
    try {
      const payload = [
        {
          key: 'site_info',
          group: 'branding',
          value: {
            site_name: data.site_name.trim(),
            tagline: data.tagline?.trim() || '',
            logo_url: data.logo_url?.trim() || '',
            contact_email: data.contact_email.trim(),
            contact_phone: data.contact_phone.trim(),
            address: data.address?.trim() || '',
          },
        },
        {
          key: 'seo_metadata',
          group: 'seo',
          value: {
            seo_title: data.seo_title.trim(),
            seo_description: data.seo_description.trim(),
            seo_keywords: data.seo_keywords?.trim() || '',
          },
        },
        {
          key: 'social_links',
          group: 'social',
          value: {
            instagram: data.instagram?.trim() || '',
            facebook: data.facebook?.trim() || '',
            linkedin: data.linkedin?.trim() || '',
            twitter: data.twitter?.trim() || '',
          },
        },
      ];

      const res = await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success('Site Branding & SEO configuration updated across all pages!');
        reset(data); // Clear dirty state
      } else {
        toast.error(json.error || json.message || 'Server rejected configuration update.');
      }
    } catch {
      toast.error('Network failure while updating site settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-24 w-full rounded-2xl bg-gray-800" />
        <Skeleton className="h-96 w-full rounded-2xl bg-gray-800" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Title Header */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-4 z-10 backdrop-blur-md">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-extrabold text-white uppercase tracking-wide font-serif flex items-center space-x-3">
            <Settings className="w-8 h-8 text-[#C5A55A]" />
            <span>Showroom Branding & Configuration</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Control dynamic site headers, public showroom telephone links, SEO meta tags, and brand presentation.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSaving || !isDirty}
          className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase tracking-wider text-xs h-11 px-6 rounded-lg shadow-[0_0_20px_rgba(197,165,90,0.3)] flex items-center space-x-2 shrink-0 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 stroke-[3]" />
              <span>Save Configuration</span>
            </>
          )}
        </Button>
      </div>

      {/* Section 1: Branding & Contact Identity */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
          <Building className="w-5 h-5 text-[#C5A55A]" />
          <span>1. Brand Identity & Customer Service Credentials</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="site_name" className="text-xs font-semibold uppercase text-gray-300">
              Site Brand Name <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="site_name"
              className="bg-[#090909] border-gray-700 text-white text-xs h-11 font-bold focus:border-[#C5A55A]"
              {...register('site_name')}
            />
            {errors.site_name && <p className="text-xs text-rose-400">{errors.site_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="logo_url" className="text-xs font-semibold uppercase text-gray-300">
              Logo Graphic Asset (WebP URL)
            </Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <Input
                id="logo_url"
                placeholder="/logo.webp or Supabase CDN link"
                className="pl-9 bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
                {...register('logo_url')}
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="tagline" className="text-xs font-semibold uppercase text-gray-300">
              Showroom Headline Tagline (Hero Subtitle)
            </Label>
            <Input
              id="tagline"
              className="bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
              {...register('tagline')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact_phone" className="text-xs font-semibold uppercase text-gray-300">
              Public Telephone Number <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="contact_phone"
              className="bg-[#090909] border-gray-700 text-emerald-300 font-mono text-xs h-11 font-bold focus:border-[#C5A55A]"
              {...register('contact_phone')}
            />
            {errors.contact_phone && <p className="text-xs text-rose-400">{errors.contact_phone.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact_email" className="text-xs font-semibold uppercase text-gray-300">
              Inquiry Desk Email Address <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="contact_email"
              type="email"
              className="bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
              {...register('contact_email')}
            />
            {errors.contact_email && <p className="text-xs text-rose-400">{errors.contact_email.message}</p>}
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold uppercase text-gray-300">
              Physical Showroom Address & City Headquarters
            </Label>
            <Textarea
              id="address"
              className="bg-[#090909] border-gray-700 text-white text-xs min-h-[70px] focus:border-[#C5A55A]"
              {...register('address')}
            />
          </div>
        </div>
      </div>

      {/* Section 2: SEO Settings */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
          <Search className="w-5 h-5 text-[#C5A55A]" />
          <span>2. Global SEO & Search Engine indexing Optimization</span>
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="seo_title" className="text-xs font-semibold uppercase text-gray-300">
              Global Homepage SEO Title Tag <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="seo_title"
              className="bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
              {...register('seo_title')}
            />
            {errors.seo_title && <p className="text-xs text-rose-400">{errors.seo_title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seo_keywords" className="text-xs font-semibold uppercase text-gray-300">
              Primary Organic Keywords (Comma-separated)
            </Label>
            <Input
              id="seo_keywords"
              className="bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
              {...register('seo_keywords')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seo_description" className="text-xs font-semibold uppercase text-gray-300">
              Meta Description Snippet <span className="text-rose-400">*</span>
            </Label>
            <Textarea
              id="seo_description"
              className="bg-[#090909] border-gray-700 text-white text-xs min-h-[85px] focus:border-[#C5A55A]"
              {...register('seo_description')}
            />
            {errors.seo_description && <p className="text-xs text-rose-400">{errors.seo_description.message}</p>}
          </div>
        </div>
      </div>

      {/* Section 3: Social Media Links */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
          <Share2 className="w-5 h-5 text-[#C5A55A]" />
          <span>3. Social Media & Brand Profile Connections</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="instagram" className="text-xs font-semibold uppercase text-gray-300">Instagram Profile URL</Label>
            <Input id="instagram" placeholder="https://instagram.com/..." className="bg-[#090909] border-gray-700 text-white text-xs h-11" {...register('instagram')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facebook" className="text-xs font-semibold uppercase text-gray-300">Facebook Page URL</Label>
            <Input id="facebook" placeholder="https://facebook.com/..." className="bg-[#090909] border-gray-700 text-white text-xs h-11" {...register('facebook')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedin" className="text-xs font-semibold uppercase text-gray-300">LinkedIn Company URL</Label>
            <Input id="linkedin" placeholder="https://linkedin.com/company/..." className="bg-[#090909] border-gray-700 text-white text-xs h-11" {...register('linkedin')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="twitter" className="text-xs font-semibold uppercase text-gray-300">Twitter / X Handle URL</Label>
            <Input id="twitter" placeholder="https://x.com/..." className="bg-[#090909] border-gray-700 text-white text-xs h-11" {...register('twitter')} />
          </div>
        </div>
      </div>
    </form>
  );
}
