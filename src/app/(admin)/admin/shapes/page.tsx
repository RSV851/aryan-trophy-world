import React from 'react';
import { MasterDataCrud } from '@/components/admin/master-data-crud';

export default function ShapesPage() {
  return (
    <MasterDataCrud
      title="Trophy Shapes & Profiles"
      description="Geometric & sculptural contours (e.g., Chalice Cup, Victory Wings, Shield, Five-Point Star, Figurines)."
      endpoint="shapes"
      entityName="Shape"
      hasDescription={true}
    />
  );
}
