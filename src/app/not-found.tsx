'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#090909] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#C5A55A]/10 border border-[#C5A55A]/40 flex items-center justify-center text-[#C5A55A] mb-6 shadow-[0_0_30px_rgba(197,165,90,0.2)]">
        <ShieldAlert className="w-9 h-9" />
      </div>

      <h1 className="text-6xl font-black font-serif text-[#C5A55A] mb-2 tracking-tight">404</h1>
      <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-3">Page Not Found</h2>
      <p className="text-xs text-gray-400 max-w-md leading-relaxed mb-8">
        The requested resource or showroom link could not be located in our catalog repository.
      </p>

      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase text-xs h-11 px-6 rounded-lg flex items-center space-x-2 shadow-[0_0_15px_rgba(197,165,90,0.3)]">
            <Home className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
