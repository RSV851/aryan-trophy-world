'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid admin email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        toast.success('Welcome back, Admin! Access granted.');
        const redirectUrl = searchParams?.get('redirect') || '/admin';
        router.push(redirectUrl);
      } else {
        toast.error(res.error || 'Invalid admin credentials. Access denied.');
      }
    } catch {
      toast.error('An unexpected system error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Admin Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="owner@aryantrophyworld.com"
            className="pl-10 bg-[#090909] border-[#C5A55A]/30 text-white placeholder:text-gray-600 focus:border-[#C5A55A] focus:ring-1 focus:ring-[#C5A55A] h-11"
            disabled={isSubmitting}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10 bg-[#090909] border-[#C5A55A]/30 text-white placeholder:text-gray-600 focus:border-[#C5A55A] focus:ring-1 focus:ring-[#C5A55A] h-11"
            disabled={isSubmitting}
            {...register('password')}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-extrabold uppercase tracking-wider text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(197,165,90,0.3)] flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <span>Authenticate & Access</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </>
        )}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090909] text-[#e5e2e1] p-4 relative overflow-hidden">
      {/* Luxury Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C5A55A]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#111827]/90 backdrop-blur-2xl border border-[#C5A55A]/30 rounded-2xl shadow-2xl p-8 relative z-10 transition-all duration-300">
        {/* Brand & Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#C5A55A]/10 border border-[#C5A55A]/50 flex items-center justify-center text-[#C5A55A] shadow-[0_0_25px_rgba(197,165,90,0.2)] mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-serif">
            Aryan Trophy World
          </h1>
          <p className="text-sm text-[#C5A55A] tracking-widest font-semibold mt-1 uppercase">
            Executive Admin Portal
          </p>
        </div>

        {/* Login Form wrapped in Suspense */}
        <Suspense fallback={
          <div className="py-8 flex justify-center text-[#C5A55A]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500 font-mono">
            Strictly Private Admin Access • Aryan Trophy World
          </p>
        </div>
      </div>
    </div>
  );
}
