import React from 'react';
import { MasterDataCrud } from '@/components/admin/master-data-crud';

export default function SubcategoriesPage() {
  return (
    <MasterDataCrud
      title="Subcategory Classifications"
      description="Targeted niche branches linked directly to parent categories (e.g., Cricket, Football under Sports)."
      endpoint="subcategories"
      entityName="Subcategory"
      isSubcategory={true}
      hasDescription={true}
    />
  );
}
