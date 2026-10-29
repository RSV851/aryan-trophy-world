import React from 'react';
import { getPublicOwnerProfile, getPublicSettingsMap, getPublicProducts } from '@/lib/data/public-catalog';
import { ContactClient } from '@/components/public/contact-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Studio & Workshop | Aryan Trophy World',
  description: 'Visit our Mumbai atelier or contact our executive specialists for custom corporate trophy designing, wholesale tournament medals, and brand engraving.',
};

export const dynamic = 'force-dynamic'; // SSR refresh interval

export default async function ContactPage() {
  const [profile, settings, productsData] = await Promise.all([
    getPublicOwnerProfile(),
    getPublicSettingsMap(),
    getPublicProducts({ limit: 40 }),
  ]);

  const brandName = settings?.site_name || 'Aryan Trophy World';
  const phone = profile?.phone || settings?.contact_phone || '+91-9876543210';
  const email = profile?.email || settings?.contact_email || 'concierge@aryantrophyworld.com';
  const address = profile?.address ? `${profile.address}, ${profile.city || ''}, ${profile.state || ''} ${profile.pincode || ''}` : 'Shop 12, Trophy Market, MG Road, Mumbai, Maharashtra 400001';

  return (
    <ContactClient
      brandName={brandName}
      phone={phone}
      email={email}
      address={address}
      settings={settings || {}}
      profile={profile || {}}
      products={productsData?.products || []}
    />
  );
}
