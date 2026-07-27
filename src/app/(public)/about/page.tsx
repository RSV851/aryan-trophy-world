'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Award, ShieldCheck, Sparkles, Building2, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function PublicAboutPage() {
  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Header */}
      <section className="bg-[#1A1F36] text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-[#C5A55A]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs font-black uppercase text-[#C5A55A] tracking-widest font-mono">
            Craftsmanship Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif uppercase tracking-tight">
            About Aryan Trophy World
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Designing and manufacturing prestige recognition awards, optical crystal shields, and championship trophies in Mumbai for over 14 years.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold font-serif text-[#1A1F36] uppercase">
              Master Craftsmanship Meets Modern CNC Etching
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
              Founded in 2012 in the industrial heart of Mumbai, Aryan Trophy World has grown into India’s premier manufacturer of custom-engineered recognition awards. We specialize in fusing raw optical crystal, solid brass alloys, high-density teak wood, and cast acrylic into timeless monuments of achievement.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans">
              From corporate Fortune 500 annual leadership galas to national sports leagues and university convocations, our in-house design studio handles everything from 3D CAD modeling to sub-surface laser engraving.
            </p>
          </div>

          <div className="bg-[#F8FAFC] border-2 border-[#C5A55A] p-8 rounded-3xl space-y-6 shadow-xl">
            <div className="flex items-center space-x-3 text-[#1A1F36]">
              <Trophy className="w-8 h-8 text-[#C5A55A]" />
              <span className="text-xl font-bold font-serif uppercase">Atelier Benchmarks</span>
            </div>
            <ul className="space-y-3 text-xs font-semibold text-gray-700 font-mono">
              <li className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span>Custom Awards Manufactured:</span>
                <span className="font-extrabold text-[#C5A55A]">250,000+</span>
              </li>
              <li className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span>Corporate & Sports Clients:</span>
                <span className="font-extrabold text-[#C5A55A]">1,400+</span>
              </li>
              <li className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span>Average Production Turnaround:</span>
                <span className="font-extrabold text-[#C5A55A]">48 Hours</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Dispatch Logistics Reach:</span>
                <span className="font-extrabold text-[#C5A55A]">Pan-India & Global</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-8">
          <Link href="/catalog">
            <Button size="lg" className="bg-[#1A1F36] text-[#DFCA85] font-black uppercase tracking-wider text-xs h-12 px-8 rounded-xl">
              <span>Explore Showroom Catalog</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
