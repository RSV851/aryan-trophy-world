import React from 'react';
import { MasterDataCrud } from '@/components/admin/master-data-crud';

export default function ProductTypesPage() {
  return (
    <MasterDataCrud
      title="Product Types & Formats"
      description="Define core architectural forms (e.g., Trophy, Championship Medal, Lapel Pin, Wooden Plaque, Crystal Badge)."
      endpoint="product-types"
      entityName="Product Type"
      hasDescription={true}
    />
  );
}
