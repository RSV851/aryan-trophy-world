'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { SmartImage } from '@/components/ui/smart-image';
import {
  User,
  Shield,
  Key,
  Save,
  Building,
  Mail,
  Phone,
  Image as ImageIcon,
  Loader2,
  Upload,
  Lock,
  Edit2,
  X,
  ArrowLeft
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
  const router = useRouter();
  const { fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // Toggle Edit mode vs View mode
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile Form
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors: profileErrors },
  } = useForm<UpdateAdminProfileInput>({
    resolver: zodResolver(updateAdminProfileSchema),
    defaultValues: {
      name: 'Aryan Business Owner',
      email: 'info@aryantrophyworld.com',
      phone: '+91 98765 43210',
      businessName: 'Aryan Trophy World',
      address: 'Shop 12, Trophy Market, MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      avatarUrl: '',
      bio: 'Leading manufacturer and supplier of customized trophies, medals, plaques, and corporate awards.',
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

  const pendingAvatarFileRef = React.useRef<File | null>(null);

  // Save Profile Handler
  const onProfileSubmit = async (data: UpdateAdminProfileInput) => {
    setIsSavingProfile(true);
    try {
      const finalData = { ...data };

      // Upload pending avatar file NOW (on submit trigger)
      if (pendingAvatarFileRef.current) {
        toast.loading('Uploading avatar photo to Supabase Storage...', { id: 'avatar-upload' });
        const fd = new FormData();
        fd.append('file', pendingAvatarFileRef.current);
        fd.append('folder', 'branding');

        const res = await fetch('/api/v1/upload', { method: 'POST', body: fd });
        const json = await res.json();
        if (res.ok && json.url) {
          finalData.avatarUrl = json.url;
        } else {
          toast.error(`Upload failed: ${json.error || 'Server error'}`);
          setIsSavingProfile(false);
          toast.dismiss('avatar-upload');
          return;
        }
        toast.dismiss('avatar-upload');
      }

      const res = await fetch('/api/v1/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success('Executive profile credentials successfully updated!');
        pendingAvatarFileRef.current = null;
        setIsEditing(false); // Lock edit mode on success
        await fetchProfile();
        useAuthStore.getState().fetchProfile();
        router.refresh();
      } else {
        toast.error(json.error || json.message || 'Server rejected profile modification.');
      }
    } catch (err: any) {
      toast.error('Network disconnection during profile commit.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Update Password Handler
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

          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                {/* Exit Edit Mode Button (<- / X Icon) */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setIsEditing(false);
                  }}
                  className="border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white font-bold text-xs h-10 px-3.5 rounded-lg flex items-center space-x-1.5"
                  title="Cancel & Exit Edit Mode"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-400" />
                  <span>Cancel</span>
                </Button>

                {/* Update Credentials Button */}
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
              </>
            ) : (
              /* Edit Mode Button */
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-[#C5A55A]/20 border border-[#C5A55A]/50 text-[#C5A55A] hover:bg-[#C5A55A] hover:text-[#090909] font-black uppercase tracking-wider text-xs h-10 px-5 rounded-lg transition-all flex items-center space-x-2 shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Edit Credentials</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold uppercase text-gray-300">
              Executive Name <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="name"
              disabled={!isEditing}
              className={`bg-[#090909] border-gray-700 text-white text-xs h-11 font-bold focus:border-[#C5A55A] ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
              {...register('name')}
            />
            {profileErrors.name && <p className="text-xs text-rose-400">{profileErrors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessName" className="text-xs font-semibold uppercase text-gray-300">
              Operating Business Name
            </Label>
            <Input
              id="businessName"
              disabled={!isEditing}
              className={`bg-[#090909] border-gray-700 text-[#C5A55A] font-extrabold text-xs h-11 focus:border-[#C5A55A] ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
              {...register('businessName')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase text-gray-300">
              Login & Communication Email <span className="text-rose-400">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
              <Input
                id="email"
                type="email"
                disabled={!isEditing}
                className={`pl-9 bg-[#090909] border-gray-700 text-gray-300 text-xs h-11 focus:border-[#C5A55A] ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
                {...register('email')}
              />
            </div>
            {profileErrors.email && <p className="text-xs text-rose-400">{profileErrors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold uppercase text-gray-300">
              Executive Telephone
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-emerald-500" />
              <Input
                id="phone"
                disabled={!isEditing}
                className={`pl-9 bg-[#090909] border-gray-700 text-emerald-300 font-mono text-xs h-11 font-bold focus:border-[#C5A55A] ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
                {...register('phone')}
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <input type="hidden" {...register('avatarUrl')} />
            <Label className="text-xs font-semibold uppercase text-gray-300">Executive Avatar Photo</Label>
            <div className="flex items-center space-x-4">
              <SmartImage
                src={watch('avatarUrl')}
                alt="Avatar Preview"
                className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700"
                imgClassName="w-full h-full object-cover rounded-full"
                fallbackIcon={<User className="w-6 h-6 text-gray-500" />}
              />
              {isEditing && (
                <div className="space-y-1">
                  <Label htmlFor="avatar-file-upload" className="cursor-pointer inline-flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-xs px-3.5 py-2 rounded-lg border border-gray-700 text-gray-200 font-bold">
                    <Upload className="w-4 h-4 text-[#C5A55A]" />
                    <span>Upload New Avatar Photo</span>
                  </Label>
                  <input
                    id="avatar-file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      pendingAvatarFileRef.current = file;

                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setValue('avatarUrl', evt.target.result as string, { shouldDirty: true, shouldValidate: true });
                          toast.success('Avatar selected! Click "Update Credentials" to upload & save.');
                        }
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                  />
                  {watch('avatarUrl') && (
                    <button
                      type="button"
                      onClick={() => {
                        setValue('avatarUrl', '', { shouldDirty: true, shouldValidate: true });
                        toast.info('Avatar removed. Click "Update Credentials" to save.');
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold underline block"
                    >
                      Remove Avatar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold uppercase text-gray-300">
              Street Address & Complex
            </Label>
            <Input
              id="address"
              disabled={!isEditing}
              className={`bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A] ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
              {...register('address')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-semibold uppercase text-gray-300">City / Township</Label>
            <Input
              id="city"
              disabled={!isEditing}
              className={`bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A] ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
              {...register('city')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-xs font-semibold uppercase text-gray-300">State / Region</Label>
              <Input
                id="state"
                disabled={!isEditing}
                className={`bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A] ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
                {...register('state')}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pincode" className="text-xs font-semibold uppercase text-gray-300">Postal Pincode</Label>
              <Input
                id="pincode"
                disabled={!isEditing}
                className={`bg-[#090909] border-gray-700 text-white text-xs h-11 font-mono focus:border-[#C5A55A] ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
                {...register('pincode')}
              />
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="bio" className="text-xs font-semibold uppercase text-gray-300">
              Executive Bio / Craftsmanship Philosophy
            </Label>
            <Textarea
              id="bio"
              disabled={!isEditing}
              className={`bg-[#090909] border-gray-700 text-white text-xs min-h-[90px] leading-relaxed focus:border-[#C5A55A] ${!isEditing ? 'opacity-70 cursor-not-allowed bg-gray-900/50' : ''}`}
              {...register('bio')}
            />
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
