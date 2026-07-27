'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useInquiryBasketStore } from '@/stores/inquiry-basket-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Loader2,
  Trophy,
  ShieldCheck,
  Send
} from 'lucide-react';

const inquiryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  company: z.string().optional(),
  phone: z.string().min(5, 'Valid contact telephone number is required').trim(),
  email: z.string().email('Please enter a valid email address').or(z.literal('')).optional(),
  city: z.string().optional(),
  message: z.string().optional(),
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

export default function PublicInquiryPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const { items, updateQuantity, removeItem, clearBasket } = useInquiryBasketStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      name: '',
      company: '',
      phone: '',
      email: '',
      city: '',
      message: '',
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C5A55A]" />
      </div>
    );
  }

  const onSubmit = async (data: InquiryFormValues) => {
    if (items.length === 0) {
      toast.error('Your inquiry basket is empty. Please add at least one trophy item from the catalog.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name.trim(),
        company: data.company?.trim() || null,
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        city: data.city?.trim() || null,
        message: data.message?.trim() || null,
        products: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const res = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success('Wholesale Inquiry Submitted! Our sales desk will contact you shortly.');
        clearBasket();
        setSubmittedSuccess(true);
      } else {
        toast.error(json.error || json.message || 'Server rejected inquiry submission.');
      }
    } catch {
      toast.error('Network disconnection while submitting quote request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-xl">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-extrabold font-serif text-[#1A1F36] uppercase tracking-tight">
          Wholesale Quote Submitted Successfully!
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto font-sans">
          Thank you for choosing Aryan Trophy World. Our senior sales executive has received your multi-product dossier and will call/email your direct line within 2 hours with tiered pricing estimates.
        </p>
        <div className="pt-4 flex items-center justify-center space-x-4">
          <Link href="/catalog">
            <Button className="bg-[#1A1F36] text-[#DFCA85] font-extrabold uppercase text-xs h-12 px-6 rounded-xl">
              Back to Trophy Showroom
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title Header */}
      <div className="border-b border-gray-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link href="/catalog" className="text-xs text-[#C5A55A] hover:underline flex items-center space-x-1 font-semibold uppercase tracking-wider mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Browsing Catalog</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#1A1F36] uppercase tracking-tight">
            Wholesale Inquiry Basket & Custom Quote
          </h1>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            onClick={clearBasket}
            className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold"
          >
            Clear Entire Basket
          </Button>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column (7-Span): Basket Items Manager */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-[#1A1F36] font-serif flex items-center space-x-2 border-b border-gray-200 pb-3">
              <ShoppingBag className="w-5 h-5 text-[#C5A55A]" />
              <span>1. Selected Trophy Items ({items.length})</span>
            </h2>

            {items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-gray-600">Your Inquiry Basket is Empty</p>
                <p className="text-xs text-gray-400">Browse our showroom catalog to select trophy models for a custom quote.</p>
                <Link href="/catalog" className="inline-block pt-2">
                  <Button className="bg-[#1A1F36] text-[#DFCA85] font-extrabold uppercase text-xs h-10 px-5">
                    Browse Showroom Catalog
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.productId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {item.primaryImage ? (
                          <img src={item.primaryImage} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <Trophy className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <Link href={`/products/${item.slug}`} className="text-sm font-bold font-serif text-[#1A1F36] hover:text-[#C5A55A]">
                          {item.name}
                        </Link>
                        <div className="flex items-center space-x-2 mt-1 text-xs font-mono text-gray-500">
                          <span className="text-[#C5A55A] font-semibold">SKU: {item.sku}</span>
                          {item.categoryName && <span>• {item.categoryName}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Counter & Delete */}
                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-black font-mono text-[#1A1F36]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-rose-500 hover:text-rose-700 p-1.5"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5-Span): Customer Contact Credentials Form */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-[#1A1F36] text-white border border-[#C5A55A]/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <h2 className="text-base font-bold uppercase tracking-wider text-[#C5A55A] font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#C5A55A]" />
              <span>2. Customer & Organization Details</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Full Name <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Vikram Sharma"
                  className="bg-[#0F1322] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
                  {...register('name')}
                />
                {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Company / Organization Name
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <Input
                    id="company"
                    placeholder="e.g. Tata Motors Sports Club / St. Xavier Academy"
                    className="pl-9 bg-[#0F1322] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
                    {...register('company')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Contact Phone Number <span className="text-rose-400">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-emerald-400" />
                  <Input
                    id="phone"
                    placeholder="+91 98200 12345"
                    className="pl-9 bg-[#0F1322] border-gray-700 text-emerald-300 font-mono font-bold text-xs h-11 focus:border-[#C5A55A]"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && <p className="text-xs text-rose-400">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vikram@company.com"
                    className="pl-9 bg-[#0F1322] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Delivery City / Event Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-[#C5A55A]" />
                  <Input
                    id="city"
                    placeholder="e.g. Mumbai / Pune / Delhi"
                    className="pl-9 bg-[#0F1322] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
                    {...register('city')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Customization Instructions & Target Event Date
                </Label>
                <Textarea
                  id="message"
                  placeholder="Specify event logo etching requirements, ceremony target dates, or special packaging requests..."
                  className="bg-[#0F1322] border-gray-700 text-white text-xs min-h-[90px] leading-relaxed focus:border-[#C5A55A]"
                  {...register('message')}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full h-12 bg-[#C5A55A] hover:bg-[#d5b568] text-[#0F1322] font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_20px_rgba(197,165,90,0.3)] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>Submit Wholesale Quote Request</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
