import React from 'react';
import { Navbar } from '@/components/public/navbar';
import { Footer } from '@/components/public/footer';
import { getPublicSettingsMap, getPublicOwnerProfile, getPublicCategories } from '@/lib/data/public-catalog';

export const dynamic = 'force-dynamic'; // Standard Next.js server cache

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
    <div className="public-site min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 font-sans selection:bg-[#FF5B00] dark:selection:bg-[#f2ca50] selection:text-white">
      <Navbar settings={settings} profile={profile} />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      <Footer settings={settings} profile={profile} categories={categories} />
    </div>
  );
}
