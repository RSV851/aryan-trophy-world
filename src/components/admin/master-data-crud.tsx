'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
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
import { Plus, Edit2, Trash2, Loader2, Tag, Layers } from 'lucide-react';

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

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteItem, setDeleteItem] = useState<MasterItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        setTotalPages(json.data?.pagination?.totalPages || 1);
        setTotalItems(json.data?.pagination?.totalItems || (Array.isArray(dataItems) ? dataItems.length : 0));
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

  // Delete Execution
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
        // Strict relational error checking (e.g. Dependent products exist)
        toast.error(json.error || json.message || 'Cannot delete item: Dependent catalog products are linked.');
      }
    } catch {
      toast.error('Network failure during removal process.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Table Column Definitions
  const columns = useMemo<ColumnDef<MasterItem>[]>(() => {
    const cols: ColumnDef<MasterItem>[] = [
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
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
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
        </div>
      ),
    });

    return cols;
  }, [entityName, isSubcategory, hasDescription, categories]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Add CTA */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-wide font-serif flex items-center space-x-2">
            <Layers className="w-6 h-6 text-[#C5A55A]" />
            <span>{title} Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">{description}</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-bold uppercase tracking-wider text-xs h-10 px-5 rounded-lg shadow-[0_0_20px_rgba(197,165,90,0.3)] flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create New {entityName}</span>
        </Button>
      </div>

      {/* Main Table View */}
      <DataTable
        columns={columns}
        data={items}
        isLoading={loading}
        searchPlaceholder={`Search ${entityName.toLowerCase()}s by name or keyword...`}
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
        emptyTitle={`No ${entityName} Records Defined`}
        emptyDescription={`Click 'Create New ${entityName}' above to add classification terms to your database.`}
        filterSlot={
          isSubcategory ? (
            <select
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#090909] border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-2 focus:border-[#C5A55A] focus:outline-none h-10"
            >
              <option value="ALL">All Parent Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : undefined
        }
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

      {/* Delete Confirmation Warning */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title={`Delete ${entityName}?`}
        description={`You are attempting to delete "${deleteItem?.name}". If any showroom trophies or medals are currently tagged with this ${entityName.toLowerCase()}, the database will block removal to preserve relational integrity.`}
        confirmText={`Confirm Deletion`}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
