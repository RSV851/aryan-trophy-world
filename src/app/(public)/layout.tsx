import React from 'react';
import { Navbar } from '@/components/public/navbar';
import { Footer } from '@/components/public/footer';
import { getPublicSettingsMap, getPublicOwnerProfile, getPublicCategories } from '@/lib/data/public-catalog';

export const revalidate = 60; // Refresh public layout settings cache every 60 seconds

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, profile, categories] = await Promise.all([
    getPublicSettingsMap(),
    getPublicOwnerProfile(),
    getPublicCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111827] font-sans selection:bg-[#C5A55A] selection:text-black">
      <Navbar settings={settings} profile={profile} />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <Footer settings={settings} profile={profile} categories={categories} />
    </div>
  );
}
