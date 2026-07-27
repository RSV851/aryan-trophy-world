import React from 'react';
import { MasterDataCrud } from '@/components/admin/master-data-crud';

export default function CategoriesPage() {
  return (
    <MasterDataCrud
      title="Product Categories"
      description="Primary high-level organizational buckets (e.g., Sports Awards, Academic Honors, Corporate Shields)."
      endpoint="categories"
      entityName="Category"
      hasDescription={true}
    />
  );
}
