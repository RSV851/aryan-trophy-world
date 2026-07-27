import React from 'react';
import { MasterDataCrud } from '@/components/admin/master-data-crud';

export default function MaterialsPage() {
  return (
    <MasterDataCrud
      title="Craftsmanship Materials"
      description="Manage building compositions and finishes (e.g., Solid Brass, Italian Marble Base, Optical Crystal, Gold Anodized Metal)."
      endpoint="materials"
      entityName="Material"
      hasDescription={true}
    />
  );
}
