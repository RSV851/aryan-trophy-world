import React from 'react';
import { MasterDataCrud } from '@/components/admin/master-data-crud';

export default function CollectionsPage() {
  return (
    <MasterDataCrud
      title="Showroom Collections"
      description="Exclusive marketing groupings & prestige tiers (e.g., Obsidian Prestige Tier, Royal Heritage Collection, Classic Gold, Value Series)."
      endpoint="collections"
      entityName="Collection"
      hasDescription={true}
    />
  );
}
