'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { Trophy, Plus, Edit2, Trash2, Eye, Star, CheckCircle, XCircle, Tag, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryName?: string;
  typeName?: string;
  isFeatured: boolean;
  isActive: boolean;
  minPrice?: number | null;
  maxPrice?: number | null;
  primaryImage?: { imageUrl: string } | null;
  createdAt: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Multi-Select Bulk Actions State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Single Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user clicked Quick Action 'Add New Trophy' shortcut
  useEffect(() => {
    if (searchParams?.get('action') === 'new') {
      router.replace('/admin/products/create');
    }
  }, [searchParams, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = `/api/v1/products?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.data || [];
        setProducts(Array.isArray(items) ? items : []);
        const paginationObj = json.pagination || json.data?.pagination || {};
        setTotalPages(paginationObj.totalPages || 1);
        setTotalItems(paginationObj.total || paginationObj.totalItems || (Array.isArray(items) ? items.length : 0));
        setSelectedProductIds([]); // Reset selection on page reload
      } else {
        toast.error('Failed to query catalog trophies from server.');
      }
    } catch {
      toast.error('Network fault while retrieving showroom catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/products/${deleteId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Trophy item successfully archived (soft deleted).');
        setDeleteId(null);
        fetchProducts();
      } else {
        toast.error(json.error || json.message || 'Failed to delete product item.');
      }
    } catch {
      toast.error('Server network disconnected during product deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteProducts = async () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        selectedProductIds.map(async (id) => {
          const res = await fetch(`/api/v1/products/${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed');
          return id;
        })
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      toast.success(`Successfully archived ${successCount} selected trophy item(s).`);
      setSelectedProductIds([]);
      setShowBulkDeleteModal(false);
      fetchProducts();
    } catch {
      toast.error('Failed to process batch product archiving.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<CatalogProduct>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={products.length > 0 && products.every((p) => selectedProductIds.includes(p.id))}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedProductIds(products.map((p) => p.id));
              } else {
                setSelectedProductIds([]);
              }
            }}
            className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-[#C5A55A] focus:ring-[#C5A55A] cursor-pointer"
            title="Select / Deselect All Products"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedProductIds.includes(row.original.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedProductIds((prev) => [...prev, row.original.id]);
              } else {
                setSelectedProductIds((prev) => prev.filter((id) => id !== row.original.id));
              }
            }}
            className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-[#C5A55A] focus:ring-[#C5A55A] cursor-pointer"
          />
        ),
      },
      {
        accessorKey: 'name',
        header: 'Trophy Showroom Title & SKU',
        cell: ({ row }) => (
          <div className="flex items-center space-x-3.5">
            <SmartImage
              src={row.original.primaryImage?.imageUrl}
              alt={row.original.name}
              className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800"
              imgClassName="w-full h-full object-cover"
              fallbackIcon={<Trophy className="w-5 h-5 text-[#C5A55A]/50 stroke-[1.5]" />}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-sm hover:text-[#C5A55A] transition-colors">
                  {row.original.name}
                </span>
                {row.original.isFeatured && (
                  <span className="p-0.5 bg-[#C5A55A]/20 text-[#C5A55A] rounded" title="Featured Star">
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[11px] font-mono text-[#C5A55A] font-semibold uppercase">
                  SKU: {row.original.sku}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-[10px] text-gray-500 font-mono">/{row.original.slug}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'categoryName',
        header: 'Category & Type',
        cell: ({ row }) => (
          <div className="space-y-1">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] bg-gray-800 text-gray-200 border border-gray-700 font-bold uppercase tracking-wider">
              <Layers className="w-3 h-3 text-blue-400 mr-1" />
              {row.original.categoryName || 'General'}
            </span>
            {row.original.typeName && (
              <div className="text-[10px] text-gray-400 font-semibold uppercase pl-1 flex items-center">
                <Tag className="w-2.5 h-2.5 text-[#C5A55A] mr-1" />
                {row.original.typeName}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'priceRange',
        header: '2D Pricing Tier Range',
        cell: ({ row }) => {
          const min = row.original.minPrice;
          const max = row.original.maxPrice;
          if (!min && !max) return <span className="text-xs text-gray-500 italic">Quote Only</span>;
          return (
            <div className="font-mono text-xs font-bold text-emerald-300">
              ₹{min?.toLocaleString('en-IN') || 0}{' '}
              {max && max !== min ? `— ₹${max.toLocaleString('en-IN')}` : '/ pcs'}
            </div>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Showroom Status',
        cell: ({ row }) =>
          row.original.isActive ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Active Showroom</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-flex items-center space-x-1">
              <XCircle className="w-3 h-3 text-rose-400" />
              <span>Draft / Hidden</span>
            </span>
          ),
      },
      {
        id: 'actions',
        header: 'Manage Actions',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Link href={`/admin/products/${row.original.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-[#C5A55A] hover:border-[#C5A55A]/60 text-xs h-8 px-3 flex items-center space-x-1 font-semibold"
              >
                <Edit2 className="w-3 h-3" />
                <span>Workspace</span>
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDeleteId(row.original.id);
                setDeleteName(row.original.name);
              }}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-2.5 text-xs flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [products, selectedProductIds]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title Header */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-extrabold text-white uppercase tracking-wide font-serif flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-[#C5A55A]" />
            <span>Showroom Product Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Manage your physical trophy portfolio, multi-tiered volume pricing matrices, and customization amenities.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 flex-wrap gap-2">
          {/* Multi-Select Bulk Delete Button */}
          {selectedProductIds.length > 0 && (
            <Button
              onClick={() => setShowBulkDeleteModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 px-5 rounded-lg flex items-center space-x-2 shadow-md animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" />
              <span>Archive Selected ({selectedProductIds.length})</span>
            </Button>
          )}

          <Link href="/admin/products/create">
            <Button className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-extrabold uppercase tracking-wider text-xs h-11 px-6 rounded-lg shadow-[0_0_20px_rgba(197,165,90,0.3)] flex items-center space-x-2 shrink-0">
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* TanStack Data Table */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={loading}
        searchPlaceholder="Search trophies by Title, SKU code, or category..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        pagination={{
          page,
          limit: 10,
          totalItems,
          totalPages,
          onPageChange: (p) => setPage(p),
        }}
        emptyTitle="No Trophy Records Located"
        emptyDescription="Your catalog currently has no products matching this search criteria. Click 'Add Product' to create an award item."
      />

      {/* Single Soft Delete Warning Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Archive Trophy From Showroom?"
        description={`Are you certain you wish to remove "${deleteName}"? This performs a safe soft deletion, hiding it from customer quotes while preserving historical inquiry records.`}
        confirmText="Confirm Soft Deletion"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Multi-Select Bulk Archive Confirmation Warning */}
      <ConfirmDialog
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDeleteProducts}
        title={`Archive ${selectedProductIds.length} Selected Trophies?`}
        description={`Are you sure you want to batch-archive ${selectedProductIds.length} selected catalog products? They will be hidden from the showroom while preserving customer quote inquiry history.`}
        confirmText={`Archive ${selectedProductIds.length} Trophies`}
        variant="danger"
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
