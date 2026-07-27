import React from 'react';
import { PublicNavbar } from '@/components/public/navbar';
import { PublicFooter } from '@/components/public/footer';

export const metadata = {
  title: 'Aryan Trophy World | Luxury Awards & Custom Trophies in Mumbai',
  description: 'Premier manufacturer and wholesale supplier of customized crystal awards, sports trophies, academic medals, and corporate plaques in Mumbai.',
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#0F172A] selection:bg-[#C5A55A] selection:text-[#0F1322]">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
