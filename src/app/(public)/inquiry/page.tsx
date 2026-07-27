'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createInquirySchema, CreateInquiryInput } from '@/lib/validations/inquiries';
import { useInquiryStore } from '@/stores/inquiry-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Trash2, Plus, Minus, Send, CheckCircle2, ShoppingBag, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function WholesaleInquiryPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const { items, removeItem, updateQuantity, clearInquiry } = useInquiryStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<any>({
    resolver: zodResolver(createInquirySchema) as any,
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      city: '',
      message: '',
      products: [],
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync basket items into RHF Zod validator
  useEffect(() => {
    if (mounted) {
      const productPayload = items.map((i) => ({
        productId: i.productId,
        quantity: Number(i.quantity) || 25,
      }));
      setValue('products', productPayload, { shouldValidate: items.length > 0 });
    }
  }, [items, mounted, setValue]);

  const onSubmit = async (data: any) => {
    if (items.length === 0) {
      toast.error('Please select at least one trophy from the catalog before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok && result.success !== false) {
        toast.success('Executive quotation request submitted successfully!');
        setSubmittedSuccess(true);
        clearInquiry();
      } else {
        toast.error(result.message || 'Failed to submit inquiry. Please verify inputs.');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('Network error occurred while sending quotation request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  // Success Confirmation State
  if (submittedSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-8">
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-[#C5A55A] rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(197,165,90,0.5)]">
          <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#1A1F36] uppercase tracking-tight">
            Quotation Dossier Transmitted!
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Your multi-product wholesale inquiry has been dispatched directly to our Mumbai executive workshop. A senior production specialist will review your selected sizing tiers and reply via phone/email within 24 hours.
          </p>
        </div>
        <div className="pt-4 flex items-center justify-center space-x-4">
          <Link href="/catalog">
            <Button className="h-12 px-8 bg-[#1A1F36] hover:bg-[#C5A55A] text-white hover:text-[#090909] font-black uppercase text-xs rounded-xl shadow-lg transition-all">
              <span>Return to Award Showroom</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
      
      {/* Header Banner */}
      <div className="bg-[#1A1F36] text-white rounded-3xl p-8 sm:p-12 border border-[#C5A55A]/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 relative z-10 text-center md:text-left">
          <span className="text-xs font-black uppercase tracking-widest text-[#090909] bg-[#C5A55A] px-3 py-1 rounded-md font-serif inline-block">
            Direct Studio Negotiation
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-serif uppercase tracking-tight text-white">
            Wholesale Quote Basket
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl">
            Review your selected trophies, customize wholesale volume brackets, and transmit your details for immediate factory-direct pricing and laser engraving consultations.
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-[#C5A55A]/10 border border-[#C5A55A] flex items-center justify-center text-[#C5A55A] font-black flex-shrink-0">
          <ShoppingBag className="w-8 h-8 stroke-[2]" />
        </div>
      </div>

      {/* Main Form & Checklist Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Col: Selected Catalog Items Checklist (Col Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-lg font-black uppercase font-serif text-[#1A1F36] tracking-tight">
              Selected Awards ({items.length})
            </h2>
            {items.length > 0 && (
              <button
                onClick={clearInquiry}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Items</span>
              </button>
            )}
          </div>

          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#C5A55A] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="relative w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                      <Image
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-gray-400 font-extrabold uppercase">SKU: {item.sku}</span>
                      <h3 className="text-base font-bold font-serif text-[#1A1F36] leading-tight">
                        {item.name}
                      </h3>
                      {item.selectedSizeLabel && (
                        <span className="inline-block text-[11px] bg-amber-50 text-[#1A1F36] font-extrabold px-2 py-0.5 rounded border border-amber-200/80">
                          Tier: {item.selectedSizeLabel}
                        </span>
                      )}
                      <p className="text-xs font-mono text-[#C5A55A] font-black">{item.priceRange || 'Price on Inquiry'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 5))}
                        className="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-lg font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-12 text-center font-mono font-black text-sm text-[#1A1F36]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 5)}
                        className="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-gray-200 rounded-lg font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.productId)}
                      className="text-gray-400 hover:text-rose-600 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50/70 rounded-3xl border border-dashed border-gray-300 space-y-4">
              <div className="w-14 h-14 bg-gray-200 text-gray-500 rounded-2xl flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#1A1F36] uppercase">Inquiry Basket is Currently Empty</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                No trophies or medals have been added for quotation yet. Please navigate to our showroom catalog to select items and configure quantities.
              </p>
              <Link href="/catalog" className="inline-block pt-2">
                <Button className="h-11 px-8 bg-[#1A1F36] hover:bg-[#C5A55A] text-white hover:text-[#090909] font-black uppercase text-xs rounded-xl shadow-md">
                  Browse Award Showroom
                </Button>
              </Link>
            </div>
          )}

          {/* Value Guaranteed Banner */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center space-x-4">
            <Sparkles className="w-6 h-6 text-[#C5A55A] flex-shrink-0" />
            <p className="text-xs text-[#1A1F36] font-medium leading-relaxed">
              <strong className="font-extrabold uppercase">Wholesale Volume Notice:</strong> Larger quantities unlock significant price reductions in our 2D pricing grid. Custom logos and individual nameplate engravings are included at no additional cost for orders above 50 units.
            </p>
          </div>
        </div>

        {/* Right Col: Lead Submission Form (Col Span 5) */}
        <div className="lg:col-span-5 bg-white p-7 sm:p-8 rounded-3xl border-2 border-[#1A1F36] shadow-2xl space-y-6 sticky top-24">
          <div className="space-y-1">
            <h2 className="text-xl font-black font-serif uppercase text-[#1A1F36]">
              Client & Delivery Credentials
            </h2>
            <p className="text-xs text-gray-500">
              Provide your organization details for immediate formal quotation dispatch.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#1A1F36]">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="Executive / Tournament Director Name"
                className="h-11 bg-gray-50 border-gray-300 rounded-xl text-xs font-semibold focus:border-[#C5A55A]"
              />
              {errors.name && <p className="text-[11px] text-rose-500 font-semibold">{String(errors.name?.message || '')}</p>}
            </div>

            {/* Company & City Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#1A1F36]">
                  Organization / Club
                </label>
                <Input
                  {...register('company')}
                  placeholder="Company Name"
                  className="h-11 bg-gray-50 border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-[#1A1F36]">
                  City / State
                </label>
                <Input
                  {...register('city')}
                  placeholder="Mumbai, Maharashtra"
                  className="h-11 bg-gray-50 border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#1A1F36]">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                {...register('email')}
                placeholder="director@company.com"
                className="h-11 bg-gray-50 border-gray-300 rounded-xl text-xs font-semibold"
              />
              {errors.email && <p className="text-[11px] text-rose-500 font-semibold">{String(errors.email?.message || '')}</p>}
            </div>

            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#1A1F36]">
                Phone / WhatsApp Contact <span className="text-rose-500">*</span>
              </label>
              <Input
                {...register('phone')}
                placeholder="+91 98765 43210"
                className="h-11 bg-gray-50 border-gray-300 rounded-xl text-xs font-semibold font-mono"
              />
              {errors.phone && <p className="text-[11px] text-rose-500 font-semibold">{String(errors.phone?.message || '')}</p>}
            </div>

            {/* Message Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[#1A1F36]">
                Customization & Event Notes <span className="text-rose-500">*</span>
              </label>
              <Textarea
                {...register('message')}
                rows={4}
                placeholder="Mention desired delivery dates, custom logo engraving instructions, or budget constraints..."
                className="bg-gray-50 border-gray-300 rounded-xl text-xs font-medium p-3 resize-none"
              />
              {errors.message && <p className="text-[11px] text-rose-500 font-semibold">{String(errors.message?.message || '')}</p>}
            </div>

            {errors.products && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{String(errors.products?.message || 'Please select valid awards.')}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full h-14 bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase text-xs rounded-2xl shadow-[0_0_25px_rgba(197,165,90,0.4)] flex items-center justify-center space-x-2 transition-all mt-6 disabled:opacity-50"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Transmitting Quotation...' : 'Submit Wholesale Quote Request'}</span>
            </Button>
          </form>

        </div>

      </div>

    </div>
  );
}
