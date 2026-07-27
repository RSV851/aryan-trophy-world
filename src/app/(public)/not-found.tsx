'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowLeft } from 'lucide-react';

export default function PublicNotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-[#1A1F36] text-[#C5A55A] flex items-center justify-center mx-auto border-2 border-[#C5A55A]">
        <Trophy className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold text-[#C5A55A] uppercase tracking-widest">Error 404</span>
        <h1 className="text-3xl font-extrabold font-serif text-[#1A1F36] uppercase">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          The award page or catalog URL you requested could not be located in our showroom archives.
        </p>
      </div>
      <div className="pt-2">
        <Link href="/catalog">
          <Button className="bg-[#1A1F36] text-[#DFCA85] font-extrabold uppercase text-xs h-11 px-6 rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Return to Trophy Catalog</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
