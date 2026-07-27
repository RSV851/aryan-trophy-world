import React from 'react';
import { MasterDataCrud } from '@/components/admin/master-data-crud';

export default function ThemesPage() {
  return (
    <MasterDataCrud
      title="Award Themes & Occasions"
      description="Categorize items by ceremonial spirit (e.g., Corporate Excellence, Annual Sports Meet, Academic Graduation, Patriotism)."
      endpoint="themes"
      entityName="Theme"
      hasDescription={true}
    />
  );
}
