'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Clock, Send, Trophy, ArrowRight } from 'lucide-react';

export default function PublicContactPage() {
  return (
    <div className="space-y-12 py-12 pb-24">
      {/* Header */}
      <section className="bg-[#1A1F36] text-white py-14 px-4 sm:px-6 lg:px-8 border-b-4 border-[#C5A55A]">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <span className="text-xs font-black uppercase text-[#C5A55A] tracking-widest font-mono">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif uppercase tracking-tight">
            Contact Our Showroom
          </h1>
          <p className="text-sm text-gray-300 max-w-xl mx-auto font-sans">
            Visit our Mumbai showroom or connect directly with our senior trophy architects for bulk quotations.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#F8FAFC] border border-gray-200 p-8 rounded-3xl space-y-3 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1F36] text-[#C5A55A] flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-serif text-[#1A1F36]">Showroom Headquarters</h3>
            <p className="text-xs text-gray-600 font-mono leading-relaxed">
              Shop 4, Prestige Trophy Towers, Industrial Estate, Mumbai, MH 400013
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-gray-200 p-8 rounded-3xl space-y-3 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1F36] text-emerald-400 flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-serif text-[#1A1F36]">Direct Phone Desk</h3>
            <p className="text-xs text-gray-600 font-mono leading-relaxed">
              <a href="tel:+919820012345" className="hover:underline text-emerald-700 font-bold block">+91 98200 12345</a>
              <span className="text-[11px] text-gray-400">Mon – Sat, 9:30 AM – 7:30 PM</span>
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-gray-200 p-8 rounded-3xl space-y-3 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#1A1F36] text-blue-400 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-serif text-[#1A1F36]">Inquiry Email Desk</h3>
            <p className="text-xs text-gray-600 font-mono leading-relaxed">
              <a href="mailto:sales@aryantrophyworld.com" className="hover:underline text-blue-700 font-bold block">sales@aryantrophyworld.com</a>
              <span className="text-[11px] text-gray-400">Response within 2 hours</span>
            </p>
          </div>
        </div>

        <div className="mt-12 bg-[#1A1F36] text-white border-2 border-[#C5A55A] p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl">
          <h2 className="text-2xl font-bold font-serif uppercase">Need A Fast Multi-Item Quote?</h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto">
            Use our interactive inquiry basket to select trophies and receive a instant custom bulk rate.
          </p>
          <Link href="/inquiry" className="inline-block pt-2">
            <Button size="lg" className="bg-[#C5A55A] text-[#0F1322] font-black uppercase tracking-wider text-xs h-12 px-8 rounded-xl">
              <span>Go to Inquiry Basket</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
