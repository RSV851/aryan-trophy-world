'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateAdminProfileSchema, UpdateAdminProfileInput } from '@/lib/validations/admin-profile';
import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  User,
  Shield,
  Key,
  Save,
  Building,
  MapPin,
  Mail,
  Phone,
  Image as ImageIcon,
  Loader2,
  Lock,
  CheckCircle2
} from 'lucide-react';

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must contain at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordInput = z.infer<typeof passwordSchema>;

export default function AdminProfilePage() {
  const { profile: storeProfile, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: profileErrors, isDirty },
  } = useForm<UpdateAdminProfileInput>({
    resolver: zodResolver(updateAdminProfileSchema),
    defaultValues: {
      name: 'Aryan Business Owner',
      email: 'owner@aryantrophyworld.com',
      phone: '+91 98200 12345',
      businessName: 'Aryan Trophy World Enterprises',
      address: 'Shop 4, Prestige Trophy Towers, Industrial Estate',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400013',
      avatarUrl: '',
      bio: 'Founder & Chief Trophy Architect. Premier distributor of customized crystal shields and corporate recognition awards.',
    },
  });

  // Password Form
  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/admin/profile', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const p = json.data;
          reset({
            name: p.name || '',
            email: p.email || '',
            phone: p.phone || '',
            businessName: p.businessName || '',
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            pincode: p.pincode || '',
            avatarUrl: p.avatarUrl || '',
            bio: p.bio || '',
          });
        }
      })
      .catch(() => toast.error('Failed to load executive profile credentials.'))
      .finally(() => setLoading(false));
  }, [reset]);

  // Save Profile Handler
  const onProfileSubmit = async (data: UpdateAdminProfileInput) => {
    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/v1/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success('Executive profile credentials successfully updated!');
        await fetchProfile(); // Refresh Header Avatar chip reactive store
      } else {
        toast.error(json.error || json.message || 'Server rejected profile modification.');
      }
    } catch {
      toast.error('Network disconnection during profile commit.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Update Password Handler via Supabase Auth
  const onPasswordSubmit = async (data: PasswordInput) => {
    setIsUpdatingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        toast.error(`Password modification error: ${error.message}`);
      } else {
        toast.success('Security password upgraded successfully!');
        resetPw();
      }
    } catch {
      toast.error('Network fault while transmitting encryption key.');
    } finally {
      setIsUpdatingPassword(false);
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
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* Title Header */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-extrabold text-white uppercase tracking-wide font-serif flex items-center space-x-3">
            <User className="w-8 h-8 text-[#C5A55A]" />
            <span>Executive Business Owner Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Maintain your executive contact card, business coordinates, showroom bio, and authentication passcodes.
          </p>
        </div>
      </div>

      {/* Section 1: Admin Profile Details Form */}
      <form onSubmit={handleSubmit(onProfileSubmit)} className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif flex items-center space-x-2">
            <Building className="w-5 h-5 text-[#C5A55A]" />
            <span>1. Executive Identity & Showroom Coordinates</span>
          </h2>
          <Button
            type="submit"
            disabled={isSavingProfile}
            className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase tracking-wider text-xs h-10 px-5 rounded-lg shadow-[0_0_15px_rgba(197,165,90,0.3)] flex items-center space-x-2 shrink-0"
          >
            {isSavingProfile ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Update Credentials</span>
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold uppercase text-gray-300">
              Executive Name <span className="text-rose-400">*</span>
            </Label>
            <Input id="name" className="bg-[#090909] border-gray-700 text-white text-xs h-11 font-bold focus:border-[#C5A55A]" {...register('name')} />
            {profileErrors.name && <p className="text-xs text-rose-400">{profileErrors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessName" className="text-xs font-semibold uppercase text-gray-300">
              Operating Business Name
            </Label>
            <Input id="businessName" className="bg-[#090909] border-gray-700 text-[#C5A55A] font-extrabold text-xs h-11 focus:border-[#C5A55A]" {...register('businessName')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase text-gray-300">
              Login & Communication Email <span className="text-rose-400">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <Input id="email" type="email" className="pl-9 bg-[#090909] border-gray-700 text-gray-300 text-xs h-11 focus:border-[#C5A55A]" {...register('email')} />
            </div>
            {profileErrors.email && <p className="text-xs text-rose-400">{profileErrors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold uppercase text-gray-300">
              Executive Telephone
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-emerald-500" />
              <Input id="phone" className="pl-9 bg-[#090909] border-gray-700 text-emerald-300 font-mono text-xs h-11 font-bold focus:border-[#C5A55A]" {...register('phone')} />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="avatarUrl" className="text-xs font-semibold uppercase text-gray-300">
              Avatar Icon WebP CDN URL
            </Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <Input id="avatarUrl" placeholder="https://..." className="pl-9 bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]" {...register('avatarUrl')} />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold uppercase text-gray-300">
              Street Address & Complex
            </Label>
            <Input id="address" className="bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]" {...register('address')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-semibold uppercase text-gray-300">City / Township</Label>
            <Input id="city" className="bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]" {...register('city')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-xs font-semibold uppercase text-gray-300">State / Region</Label>
              <Input id="state" className="bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]" {...register('state')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pincode" className="text-xs font-semibold uppercase text-gray-300">Postal Pincode</Label>
              <Input id="pincode" className="bg-[#090909] border-gray-700 text-white text-xs h-11 font-mono focus:border-[#C5A55A]" {...register('pincode')} />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-semibold uppercase text-gray-300">
              Executive Bio / Craftsmanship Philosophy
            </Label>
            <Textarea id="bio" className="bg-[#090909] border-gray-700 text-white text-xs min-h-[90px] leading-relaxed focus:border-[#C5A55A]" {...register('bio')} />
          </div>
        </div>
      </form>

      {/* Section 2: Password Change Security Tab */}
      <form onSubmit={handleSubmitPw(onPasswordSubmit)} className="bg-[#111827] border border-rose-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-gray-800 pb-4">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif">
              2. Executive Security & Password Modification
            </h2>
            <p className="text-xs text-gray-400">
              Update your primary administrative passcode via cryptographically secured Supabase Auth tokens.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs font-semibold uppercase text-gray-300 flex items-center space-x-1">
              <Lock className="w-3 h-3 text-rose-400 mr-1" />
              <span>New Password (Min 8 Chars)</span>
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              className="bg-[#090909] border-gray-700 text-white text-xs h-11 font-mono focus:border-rose-400"
              {...registerPw('newPassword')}
            />
            {pwErrors.newPassword && <p className="text-xs text-rose-400">{pwErrors.newPassword.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase text-gray-300">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="bg-[#090909] border-gray-700 text-white text-xs h-11 font-mono focus:border-rose-400"
              {...registerPw('confirmPassword')}
            />
            {pwErrors.confirmPassword && <p className="text-xs text-rose-400">{pwErrors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isUpdatingPassword}
            variant="destructive"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider text-xs h-11 px-6 rounded-lg shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center space-x-2"
          >
            {isUpdatingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Encrypting & Upgrading...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 stroke-[2.5]" />
                <span>Upgrade Security Password</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
