'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Loader2, Tag, Layers, Package, RefreshCw, Search, X, ArrowLeft, CheckSquare, Square, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

interface MasterItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  categoryId?: string;
  categoryName?: string;
  createdAt?: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface MasterDataCrudProps {
  title: string;
  description: string;
  endpoint: string; // e.g. "categories" | "product-types" | "subcategories"
  entityName: string;
  isSubcategory?: boolean;
  hasDescription?: boolean;
}

export function MasterDataCrud({
  title,
  description,
  endpoint,
  entityName,
  isSubcategory = false,
  hasDescription = true,
}: MasterDataCrudProps) {
  const [items, setItems] = useState<MasterItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Multi-Select Bulk Actions State for Table Items
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Single Delete State
  const [deleteItem, setDeleteItem] = useState<MasterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Collection Items Management Modal State (Add SKU, Multi-Select Remove, Clear All)
  const [activeCollectionItemModal, setActiveCollectionItemModal] = useState<MasterItem | null>(null);
  const [collectionProducts, setCollectionProducts] = useState<any[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [skuSearchQuery, setSkuSearchQuery] = useState('');
  const [selectedProductIdsToAdd, setSelectedProductIdsToAdd] = useState<string[]>([]);
  const [selectedCollectionProductIdsToRemove, setSelectedCollectionProductIdsToRemove] = useState<string[]>([]);
  const [isLoadingCollectionProducts, setIsLoadingCollectionProducts] = useState(false);
  const [isAddingSkus, setIsAddingSkus] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Pagination for Collection Products & SKU Picker
  const [collectionProductsPage, setCollectionProductsPage] = useState(1);
  const [skuPickerPage, setSkuPickerPage] = useState(1);

  const fetchCollectionProducts = async (colId: string) => {
    setIsLoadingCollectionProducts(true);
    try {
      const res = await fetch(`/api/v1/collections/${colId}/products`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setCollectionProducts(json.data || []);
      }
    } catch {
      toast.error('Failed to load collection products');
    } finally {
      setIsLoadingCollectionProducts(false);
    }
  };

  const fetchCatalogProducts = async () => {
    try {
      const res = await fetch(`/api/v1/products?limit=100`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setCatalogProducts(json.data?.items || json.data || []);
      }
    } catch {
      console.error('Catalog fetch error');
    }
  };

  const handleOpenCollectionItemsModal = (col: MasterItem) => {
    setActiveCollectionItemModal(col);
    setSelectedProductIdsToAdd([]);
    setSelectedCollectionProductIdsToRemove([]);
    setSkuSearchQuery('');
    setIsPickerOpen(false);
    fetchCollectionProducts(col.id);
    fetchCatalogProducts();
  };

  const handleAddSelectedSkus = async () => {
    if (!activeCollectionItemModal || selectedProductIdsToAdd.length === 0) return;
    setIsAddingSkus(true);
    try {
      const res = await fetch(`/api/v1/collections/${activeCollectionItemModal.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedProductIdsToAdd }),
      });
      if (res.ok) {
        toast.success(`${selectedProductIdsToAdd.length} SKU(s) added to collection!`);
        setSelectedProductIdsToAdd([]);
        setIsPickerOpen(false);
        fetchCollectionProducts(activeCollectionItemModal.id);
      } else {
        toast.error('Failed to add selected products');
      }
    } catch {
      toast.error('Error connecting to collection service');
    } finally {
      setIsAddingSkus(false);
    }
  };

  const handleRemoveSelectedCollectionProducts = async () => {
    if (!activeCollectionItemModal || selectedCollectionProductIdsToRemove.length === 0) return;
    try {
      const results = await Promise.allSettled(
        selectedCollectionProductIdsToRemove.map((productId) =>
          fetch(`/api/v1/collections/${activeCollectionItemModal.id}/products?productId=${productId}`, {
            method: 'DELETE',
          })
        )
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      toast.success(`Removed ${successCount} product(s) from collection!`);
      setSelectedCollectionProductIdsToRemove([]);
      fetchCollectionProducts(activeCollectionItemModal.id);
    } catch {
      toast.error('Error removing selected products');
    }
  };

  const handleRemoveSingleCollectionProduct = async (productId: string) => {
    if (!activeCollectionItemModal) return;
    try {
      const res = await fetch(`/api/v1/collections/${activeCollectionItemModal.id}/products?productId=${productId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Product removed from collection!');
        fetchCollectionProducts(activeCollectionItemModal.id);
      } else {
        toast.error('Failed to remove product');
      }
    } catch {
      toast.error('Error removing product');
    }
  };

  const handleClearAllCollectionProducts = async () => {
    if (!activeCollectionItemModal) return;
    if (!confirm(`Are you sure you want to clear all products from '${activeCollectionItemModal.name}'?`)) return;
    try {
      const res = await fetch(`/api/v1/collections/${activeCollectionItemModal.id}/products?clearAll=true`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Cleared all products from '${activeCollectionItemModal.name}'!`);
        fetchCollectionProducts(activeCollectionItemModal.id);
      } else {
        toast.error('Failed to clear collection');
      }
    } catch {
      toast.error('Error clearing collection products');
    }
  };

  // Dynamic Validation Schema
  const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
    description: z.string().optional(),
    categoryId: isSubcategory
      ? z.string().min(1, { message: 'Please select a parent Category' })
      : z.string().optional(),
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', categoryId: '' },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/v1/${endpoint}?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
      if (isSubcategory && selectedCategoryFilter !== 'ALL') {
        url += `&categoryId=${selectedCategoryFilter}`;
      }

      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const dataItems = json.data?.items || json.data || [];
        setItems(Array.isArray(dataItems) ? dataItems : []);
        const paginationObj = json.pagination || json.data?.pagination || {};
        setTotalPages(paginationObj.totalPages || 1);
        setTotalItems(paginationObj.total || paginationObj.totalItems || (Array.isArray(dataItems) ? dataItems.length : 0));
        setSelectedIds([]); // Reset row selection on fetch
      } else {
        toast.error(`Failed to load ${title}.`);
      }
    } catch {
      toast.error('Network diagnostic failure while syncing master catalog.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, search, isSubcategory, selectedCategoryFilter, title]);

  // If handling subcategories, load categories list for selector & filter
  useEffect(() => {
    if (isSubcategory) {
      fetch('/api/v1/categories?page=1&limit=100', { cache: 'no-store' })
        .then((r) => r.json())
        .then((json) => {
          const catList = json.data?.items || json.data || [];
          setCategories(Array.isArray(catList) ? catList : []);
        })
        .catch(() => toast.error('Failed to load parent category classifications.'));
    }
  }, [isSubcategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open modal for Create/Edit
  const handleOpenDialog = (item?: MasterItem) => {
    if (item) {
      setEditingItem(item);
      setValue('name', item.name);
      setValue('description', item.description || '');
      if (isSubcategory && item.categoryId) {
        setValue('categoryId', item.categoryId);
      }
    } else {
      setEditingItem(null);
      reset({ name: '', description: '', categoryId: categories[0]?.id || '' });
    }
    setIsDialogOpen(true);
  };

  // Submit Save/Update
  const onSubmit = async (data: FormData) => {
    setIsSaving(true);
    try {
      const url = editingItem
        ? `/api/v1/${endpoint}/${editingItem.id}`
        : `/api/v1/${endpoint}`;
      const method = editingItem ? 'PUT' : 'POST';

      const payload = {
        name: data.name.trim(),
        ...(hasDescription ? { description: data.description?.trim() || null } : {}),
        ...(isSubcategory ? { categoryId: data.categoryId } : {}),
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success(`${entityName} successfully ${editingItem ? 'updated' : 'created'}.`);
        setIsDialogOpen(false);
        reset();
        fetchData();
      } else {
        toast.error(json.error || json.message || `Failed to modify ${entityName}.`);
      }
    } catch {
      toast.error('Server connection failed while writing entity data.');
    } finally {
      setIsSaving(false);
    }
  };

  // Single Delete Execution
  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/${endpoint}/${deleteItem.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (res.ok) {
        toast.success(`${entityName} removed from master inventory.`);
        setDeleteItem(null);
        fetchData();
      } else {
        toast.error(json.error || json.message || 'Cannot delete item: Dependent catalog products are linked.');
      }
    } catch {
      toast.error('Network failure during removal process.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Multi-Select Delete Execution
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      const results = await Promise.allSettled(
        selectedIds.map(async (id) => {
          const res = await fetch(`/api/v1/${endpoint}/${id}`, { method: 'DELETE' });
          if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error || json.message || 'Failed to delete');
          }
          return id;
        })
      );

      results.forEach((r) => {
        if (r.status === 'fulfilled') successCount++;
        else failedCount++;
      });

      if (successCount > 0) {
        toast.success(`Successfully removed ${successCount} ${entityName.toLowerCase()}(s) from database.`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} item(s) could not be removed because linked catalog products exist.`);
      }

      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      fetchData();
    } catch {
      toast.error('Network failure during multi-select removal process.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Table Column Definitions with Checkbox Selection
  const columns = useMemo<ColumnDef<MasterItem>[]>(() => {
    const cols: ColumnDef<MasterItem>[] = [
      {
        id: 'select',
        header: () => {
          const eligibleItems = items.filter(
            (i) => !(endpoint === 'collections' && (i.slug === 'best-sellers' || i.slug === 'featured'))
          );
          const allSelected = eligibleItems.length > 0 && eligibleItems.every((i) => selectedIds.includes(i.id));

          return (
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(eligibleItems.map((i) => i.id));
                } else {
                  setSelectedIds([]);
                }
              }}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-[#C5A55A] focus:ring-[#C5A55A] cursor-pointer"
              title="Select / Deselect All Items"
            />
          );
        },
        cell: ({ row }) => {
          const isProtected = endpoint === 'collections' && (row.original.slug === 'best-sellers' || row.original.slug === 'featured');
          if (isProtected) return null;

          const isChecked = selectedIds.includes(row.original.id);
          return (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds((prev) => [...prev, row.original.id]);
                } else {
                  setSelectedIds((prev) => prev.filter((id) => id !== row.original.id));
                }
              }}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-[#C5A55A] focus:ring-[#C5A55A] cursor-pointer"
            />
          );
        },
      },
      {
        accessorKey: 'name',
        header: `${entityName} Name`,
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#C5A55A]/10 border border-[#C5A55A]/30 flex items-center justify-center text-[#C5A55A] shrink-0 font-bold text-xs">
              {row.original.name[0]?.toUpperCase() || <Tag className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-bold text-white text-sm">{row.original.name}</p>
              <p className="text-[11px] font-mono text-gray-500">/{row.original.slug}</p>
            </div>
          </div>
        ),
      },
    ];

    if (isSubcategory) {
      cols.push({
        accessorKey: 'categoryId',
        header: 'Parent Category',
        cell: ({ row }) => {
          const catName =
            row.original.categoryName ||
            categories.find((c) => c.id === row.original.categoryId)?.name ||
            'General';
          return (
            <span className="px-2.5 py-1 rounded-md text-xs bg-gray-800 border border-gray-700 text-gray-300 font-semibold inline-flex items-center space-x-1.5">
              <Layers className="w-3 h-3 text-[#C5A55A]" />
              <span>{catName}</span>
            </span>
          );
        },
      });
    }

    if (hasDescription) {
      cols.push({
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <p className="text-xs text-gray-400 max-w-md truncate">
            {row.original.description || <span className="text-gray-600 italic">No description provided</span>}
          </p>
        ),
      });
    }

    cols.push({
      id: 'actions',
      header: 'Manage Actions',
      cell: ({ row }) => {
        const isCollection = endpoint === 'collections';
        const isSystemProtected = isCollection && (row.original.slug === 'best-sellers' || row.original.slug === 'featured');

        return (
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {/* Manage Products inside Collection */}
            {isCollection && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenCollectionItemsModal(row.original)}
                className="border-[#C5A55A]/40 bg-[#C5A55A]/10 hover:bg-[#C5A55A]/20 text-[#C5A55A] text-xs h-8 px-2.5 flex items-center space-x-1 font-bold"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Manage Products</span>
              </Button>
            )}

            {!isSystemProtected ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenDialog(row.original)}
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 hover:text-[#C5A55A] text-gray-300 text-xs h-8 px-2.5 flex items-center space-x-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteItem(row.original)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-2.5 text-xs flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </Button>
              </>
            ) : (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700">
                Protected Name
              </span>
            )}
          </div>
        );
      },
    });

    return cols;
  }, [entityName, isSubcategory, hasDescription, categories, endpoint, items, selectedIds]);

  // If managing products for a collection, render full inline page workspace
  if (activeCollectionItemModal) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
        {/* Top Back Navigation Bar & Collection Header */}
        <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveCollectionItemModal(null);
                setIsPickerOpen(false);
                setSelectedCollectionProductIdsToRemove([]);
              }}
              className="text-xs font-bold text-[#C5A55A] hover:text-[#d5b568] flex items-center space-x-1.5 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Collections List</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-wide font-serif flex items-center space-x-2.5">
              <Package className="w-6 h-6 text-[#C5A55A]" />
              <span>{activeCollectionItemModal.name} — Collection Workspace</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-mono">
              /{activeCollectionItemModal.slug} • {collectionProducts.length} attached trophy item(s)
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0 flex-wrap gap-2">
            {selectedCollectionProductIdsToRemove.length > 0 && (
              <Button
                onClick={handleRemoveSelectedCollectionProducts}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 px-4 rounded-lg flex items-center space-x-1.5 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Selected ({selectedCollectionProductIdsToRemove.length})</span>
              </Button>
            )}

            <Button
              onClick={() => setIsPickerOpen(true)}
              className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-bold text-xs h-10 px-5 rounded-lg flex items-center space-x-2 shadow-[0_0_20px_rgba(197,165,90,0.3)] uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Products from Catalog SKU List</span>
            </Button>

            <Button
              onClick={handleClearAllCollectionProducts}
              disabled={collectionProducts.length === 0}
              variant="outline"
              className="border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs h-10 px-4 rounded-lg flex items-center space-x-1.5 font-bold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Products</span>
            </Button>
          </div>
        </div>

        {/* Inline Attached Trophies Catalog Table */}
        <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <Tag className="w-4 h-4 text-[#C5A55A]" />
              <span>Trophies Linked to '{activeCollectionItemModal.name}' ({collectionProducts.length})</span>
            </h2>
            <Button
              onClick={() => fetchCollectionProducts(activeCollectionItemModal.id)}
              variant="outline"
              size="sm"
              className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs h-8 px-3"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C5A55A] ${isLoadingCollectionProducts ? 'animate-spin' : ''}`} />
              <span>Refresh Items</span>
            </Button>
          </div>

          {isLoadingCollectionProducts ? (
            <div className="py-16 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#C5A55A]" />
              <span>Fetching attached catalog items...</span>
            </div>
          ) : collectionProducts.length === 0 ? (
            <div className="py-12 border border-dashed border-gray-800 rounded-xl text-center space-y-3 bg-[#090909]">
              <Package className="w-10 h-10 text-gray-600 mx-auto" />
              <p className="text-sm font-bold text-white">No Trophies Linked Yet</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Click "+ Add Products from Catalog SKU List" above to attach trophies to this collection.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090909] text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="p-3.5 w-10">
                        <input
                          type="checkbox"
                          checked={
                            collectionProducts.length > 0 &&
                            selectedCollectionProductIdsToRemove.length === collectionProducts.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCollectionProductIdsToRemove(collectionProducts.map((p) => p.id));
                            } else {
                              setSelectedCollectionProductIdsToRemove([]);
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-[#C5A55A]"
                        />
                      </th>
                      <th className="p-3.5">Product SKU & Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {collectionProducts
                      .slice((collectionProductsPage - 1) * 10, collectionProductsPage * 10)
                      .map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-800/40 transition-colors">
                          <td className="p-3.5">
                            <input
                              type="checkbox"
                              checked={selectedCollectionProductIdsToRemove.includes(prod.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCollectionProductIdsToRemove((prev) => [...prev, prod.id]);
                                } else {
                                  setSelectedCollectionProductIdsToRemove((prev) => prev.filter((id) => id !== prod.id));
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-[#C5A55A]"
                            />
                          </td>
                          <td className="p-3.5 flex items-center space-x-3">
                            <SmartImage
                              src={prod.images?.[0]?.imageUrl}
                              alt={prod.name}
                              className="w-9 h-9 rounded-lg bg-gray-800 shrink-0 border border-gray-700"
                              fallbackIcon={<Trophy className="w-4 h-4 text-[#C5A55A]" />}
                            />
                            <div>
                              <p className="font-bold text-white">{prod.name}</p>
                              <p className="text-[11px] font-mono text-[#C5A55A]">{prod.sku}</p>
                            </div>
                          </td>
                          <td className="p-3.5 text-gray-300">{prod.category?.name || 'General'}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                prod.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'
                              }`}
                            >
                              {prod.isActive ? 'Active' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveSingleCollectionProduct(prod.id)}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7 px-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Collection Products Table Pagination Bar */}
              {Math.ceil(collectionProducts.length / 10) > 1 && (
                <div className="bg-[#090909] border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-gray-400">
                  <div>
                    Page <strong className="text-[#C5A55A]">{collectionProductsPage}</strong> of{' '}
                    {Math.ceil(collectionProducts.length / 10)} ({collectionProducts.length} attached items)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCollectionProductsPage((p) => Math.max(1, p - 1))}
                      disabled={collectionProductsPage <= 1}
                      className="h-7 px-2.5 border-gray-700 bg-gray-800 text-gray-300 text-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCollectionProductsPage((p) => Math.min(Math.ceil(collectionProducts.length / 10), p + 1))}
                      disabled={collectionProductsPage >= Math.ceil(collectionProducts.length / 10)}
                      className="h-7 px-2.5 border-gray-700 bg-gray-800 text-gray-300 text-xs"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Dialog: Add SKU Picker */}
        <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <DialogContent className="bg-[#111827] border border-gray-800 text-gray-100 max-w-2xl rounded-2xl p-6 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white uppercase font-serif tracking-wide">
                Select Catalog SKUs to Attach
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400">
                Check one or more catalog products to link to '{activeCollectionItemModal.name}'.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Filter catalog products by SKU or Name..."
                  value={skuSearchQuery}
                  onChange={(e) => setSkuSearchQuery(e.target.value)}
                  className="pl-9 bg-[#090909] border-gray-700 text-white placeholder:text-gray-600 text-xs h-10"
                />
              </div>

              <div className="space-y-2">
                <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-800 rounded-xl p-2 bg-[#090909]">
                  {catalogProducts
                    .filter((p) => {
                      const q = skuSearchQuery.toLowerCase();
                      return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
                    })
                    .slice((skuPickerPage - 1) * 10, skuPickerPage * 10)
                    .map((p) => {
                      const isAlreadyInCollection = collectionProducts.some((cp) => cp.id === p.id);
                      const isChecked = selectedProductIdsToAdd.includes(p.id);

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (isAlreadyInCollection) return;
                            setSelectedProductIdsToAdd((prev) =>
                              isChecked ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                            );
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                            isAlreadyInCollection
                              ? 'bg-gray-900 border-gray-800 opacity-60 cursor-not-allowed'
                              : isChecked
                              ? 'bg-[#C5A55A]/10 border-[#C5A55A]/50'
                              : 'bg-gray-800/40 border-gray-800 hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {isAlreadyInCollection ? (
                              <CheckSquare className="w-4 h-4 text-gray-600" />
                            ) : isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#C5A55A]" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-500" />
                            )}
                            <div>
                              <p className="text-xs font-bold text-white">{p.name}</p>
                              <p className="text-[10px] font-mono text-[#C5A55A]">{p.sku}</p>
                            </div>
                          </div>

                          {isAlreadyInCollection && (
                            <span className="text-[10px] uppercase font-bold text-gray-500 px-2 py-0.5 bg-gray-800 rounded">
                              Already Added
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* SKU Picker Pagination Controls */}
                {Math.ceil(
                  catalogProducts.filter((p) => {
                    const q = skuSearchQuery.toLowerCase();
                    return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
                  }).length / 10
                ) > 1 && (
                  <div className="flex items-center justify-between text-xs text-gray-400 px-1 pt-1">
                    <span>
                      Page <strong className="text-[#C5A55A]">{skuPickerPage}</strong> of{' '}
                      {Math.ceil(
                        catalogProducts.filter((p) => {
                          const q = skuSearchQuery.toLowerCase();
                          return p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
                        }).length / 10
                      )}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSkuPickerPage((p) => Math.max(1, p - 1))}
                        disabled={skuPickerPage <= 1}
                        className="h-7 px-2 border-gray-700 bg-gray-800 text-gray-300 text-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setSkuPickerPage((p) =>
                            Math.min(
                              Math.ceil(
                                catalogProducts.filter((pr) => {
                                  const q = skuSearchQuery.toLowerCase();
                                  return pr.name?.toLowerCase().includes(q) || pr.sku?.toLowerCase().includes(q);
                                }).length / 10
                              ),
                              p + 1
                            )
                          )
                        }
                        disabled={
                          skuPickerPage >=
                          Math.ceil(
                            catalogProducts.filter((pr) => {
                              const q = skuSearchQuery.toLowerCase();
                              return pr.name?.toLowerCase().includes(q) || pr.sku?.toLowerCase().includes(q);
                            }).length / 10
                          )
                        }
                        className="h-7 px-2 border-gray-700 bg-gray-800 text-gray-300 text-xs"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPickerOpen(false)}
                className="border-gray-700 bg-gray-800 text-gray-300 text-xs h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSelectedSkus}
                disabled={selectedProductIdsToAdd.length === 0 || isAddingSkus}
                className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-bold text-xs h-10 px-5"
              >
                {isAddingSkus ? 'Adding...' : `Add Selected (${selectedProductIdsToAdd.length})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-wide font-serif flex items-center space-x-2.5">
            <Tag className="w-6 h-6 text-[#C5A55A]" />
            <span>{title} Workspace</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">{description}</p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 flex-wrap gap-2">
          {/* Multi-Select Bulk Delete Button */}
          {selectedIds.length > 0 && (
            <Button
              onClick={() => setShowBulkDeleteModal(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 px-4 rounded-lg flex items-center space-x-1.5 shadow-md animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedIds.length})</span>
            </Button>
          )}

          <Button
            onClick={() => handleOpenDialog()}
            className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-bold text-xs h-10 px-5 rounded-lg flex items-center space-x-2 shadow-[0_0_20px_rgba(197,165,90,0.3)] uppercase tracking-wider transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Define New {entityName}</span>
          </Button>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={items}
        isLoading={loading}
        searchPlaceholder={`Filter ${entityName.toLowerCase()}s by name or slug...`}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filterSlot={
          isSubcategory ? (
            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#090909] border border-gray-700 text-gray-200 text-xs rounded-xl px-3 py-2 h-10 focus:border-[#C5A55A] focus:outline-none"
            >
              <option value="ALL">All Parent Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : null
        }
        pagination={{
          page,
          limit: 10,
          totalItems,
          totalPages,
          onPageChange: (p) => setPage(p),
        }}
        emptyTitle={`No ${entityName}s Defined`}
        emptyDescription={`Click 'Define New ${entityName}' above to add your first master entry.`}
      />

      {/* Create/Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={(v) => !v && !isSaving && setIsDialogOpen(false)}>
        <DialogContent className="bg-[#111827] border border-gray-800 text-gray-100 max-w-lg rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white uppercase font-serif tracking-wide">
              {editingItem ? `Modify ${entityName}` : `Define New ${entityName}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              {editingItem
                ? `Update the operational nomenclature for this ${entityName.toLowerCase()}.`
                : `Enter accurate specification labels to organize showroom items.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {isSubcategory && (
              <div className="space-y-1.5">
                <Label htmlFor="categoryId" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Parent Category <span className="text-rose-400">*</span>
                </Label>
                <select
                  id="categoryId"
                  disabled={isSaving}
                  {...register('categoryId')}
                  className="w-full bg-[#090909] border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2.5 focus:border-[#C5A55A] focus:outline-none h-11"
                >
                  <option value="">-- Choose Category Classification --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-rose-400">{errors.categoryId.message}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                {entityName} Name <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="name"
                disabled={isSaving}
                placeholder={`e.g., ${entityName === 'Material' ? 'Premium Acrylic' : 'Corporate Champions'}`}
                className="bg-[#090909] border-gray-700 text-white placeholder:text-gray-600 text-xs h-11 focus:border-[#C5A55A]"
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-rose-400">{errors.name.message}</p>}
            </div>

            {hasDescription && (
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Description / Specification Notes
                </Label>
                <Textarea
                  id="description"
                  disabled={isSaving}
                  placeholder="Optional internal remarks or display description..."
                  className="bg-[#090909] border-gray-700 text-white placeholder:text-gray-600 text-xs min-h-[90px] focus:border-[#C5A55A]"
                  {...register('description')}
                />
              </div>
            )}

            <DialogFooter className="mt-6 flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs h-10 px-5 uppercase font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-bold text-xs h-10 px-6 uppercase tracking-wider rounded-lg flex items-center space-x-2 shadow-[0_0_15px_rgba(197,165,90,0.3)]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingItem ? 'Update Specification' : 'Save Record'}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Single Delete Confirmation Warning */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title={`Delete ${entityName}?`}
        description={`You are attempting to delete "${deleteItem?.name}". If any catalog trophies are tagged with this ${entityName.toLowerCase()}, database integrity rules will prevent deletion.`}
        confirmText="Confirm Deletion"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Multi-Select Bulk Delete Confirmation Warning */}
      <ConfirmDialog
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedIds.length} Selected ${entityName}(s)?`}
        description={`Are you sure you want to batch-delete ${selectedIds.length} selected ${entityName.toLowerCase()}s? Items linked to catalog products will be safely protected by database constraints.`}
        confirmText={`Delete ${selectedIds.length} Items`}
        variant="danger"
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
