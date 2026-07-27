'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  MessageSquare,
  Eye,
  Trash2,
  Building2,
  MapPin,
  Mail,
  Phone,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Filter
} from 'lucide-react';

interface InquiryItem {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone: string;
  city?: string | null;
  message?: string | null;
  status: 'new' | 'read' | 'replied' | 'closed';
  linkedProductsCount?: number;
  linkedProductsSummary?: string[];
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/inquiries?page=${page}&limit=15&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;

      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.data || [];
        setInquiries(Array.isArray(items) ? items : []);
        setTotalPages(json.data?.pagination?.totalPages || 1);
        setTotalItems(json.data?.pagination?.totalItems || (Array.isArray(items) ? items.length : 0));
      } else {
        toast.error('Failed to sync customer leads from database.');
      }
    } catch {
      toast.error('Network disconnection while querying customer leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInquiries();
    }, 350);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/inquiries/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Inquiry record purged from customer history.');
        setDeleteId(null);
        fetchInquiries();
      } else {
        toast.error('Failed to delete customer inquiry.');
      }
    } catch {
      toast.error('Network disconnection during deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center space-x-1 animate-pulse">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>New Lead</span>
          </span>
        );
      case 'read':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 inline-flex items-center space-x-1">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>Reviewed</span>
          </span>
        );
      case 'replied':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Replied</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700">
            Closed
          </span>
        );
    }
  };

  const columns = useMemo<ColumnDef<InquiryItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Client Identity & Organization',
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[#C5A55A] shrink-0 text-xs">
                <User className="w-3.5 h-3.5" />
              </span>
              <span className="font-extrabold text-white text-sm hover:text-[#C5A55A] transition-colors">
                {row.original.name}
              </span>
            </div>
            {row.original.company && (
              <div className="flex items-center space-x-1 text-xs text-gray-400 pl-8">
                <Building2 className="w-3 h-3 text-gray-500" />
                <span>{row.original.company}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'contact',
        header: 'Contact Credentials',
        cell: ({ row }) => (
          <div className="space-y-1 text-xs font-mono text-gray-300">
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-300">{row.original.phone}</span>
            </div>
            {row.original.email && (
              <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="truncate max-w-[180px]">{row.original.email}</span>
              </div>
            )}
            {row.original.city && (
              <div className="flex items-center space-x-1.5 text-[11px] text-[#C5A55A]">
                <MapPin className="w-3 h-3" />
                <span>{row.original.city}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'products',
        header: 'Requested Trophies',
        cell: ({ row }) => {
          const count = row.original.linkedProductsCount || 1;
          return (
            <span className="px-3 py-1 rounded-lg bg-[#090909] border border-gray-800 text-gray-200 text-xs font-semibold inline-flex items-center space-x-2 shadow-sm">
              <Package className="w-3.5 h-3.5 text-[#C5A55A]" />
              <span>{count} Showroom Item{count !== 1 ? 's' : ''}</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => {
          let dateStr = 'Recently';
          try {
            if (row.original.createdAt) dateStr = format(new Date(row.original.createdAt), 'dd MMM yyyy, h:mm a');
          } catch {}
          return <span className="text-xs text-gray-400 font-mono">{dateStr}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Lead Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <Link href={`/admin/inquiries/${row.original.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-[#C5A55A] text-xs h-8 px-3 flex items-center space-x-1 font-semibold"
              >
                <Eye className="w-3 h-3" />
                <span>Review Lead</span>
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDeleteId(row.original.id);
                setDeleteName(`${row.original.name} (${row.original.phone})`);
              }}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 w-8 p-0"
              title="Delete Record"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title Header */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-3xl font-extrabold text-white uppercase tracking-wide font-serif flex items-center space-x-3">
            <MessageSquare className="w-8 h-8 text-[#C5A55A]" />
            <span>Customer Inquiries & Wholesale Quotes</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Review incoming bulk quote submissions, update lead conversation pipelines, and record private negotiation remarks.
          </p>
        </div>
      </div>

      {/* Status Tabs Navigation Bar */}
      <div className="flex flex-wrap gap-2 p-2 bg-[#111827] border border-gray-800 rounded-xl">
        {[
          { label: 'All Customer Inquiries', val: 'ALL' },
          { label: 'New Unread Leads', val: 'new' },
          { label: 'Reviewed / Under Processing', val: 'read' },
          { label: 'Replied & Quoted', val: 'replied' },
          { label: 'Closed Archive', val: 'closed' },
        ].map((tab) => {
          const active = statusFilter === tab.val;
          return (
            <button
              key={tab.val}
              type="button"
              onClick={() => {
                setStatusFilter(tab.val);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all ${
                active
                  ? 'bg-[#C5A55A] text-[#090909] shadow-[0_0_15px_rgba(197,165,90,0.3)] font-black'
                  : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Data Table View */}
      <DataTable
        columns={columns}
        data={inquiries}
        isLoading={loading}
        searchPlaceholder="Search leads by Client Name, Email, Phone number, or Company..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        pagination={{
          page,
          limit: 15,
          totalItems,
          totalPages,
          onPageChange: (p) => setPage(p),
        }}
        emptyTitle="No Customer Inquiries Matching Criteria"
        emptyDescription="There are currently no customer quote submissions in this lead filter status."
      />

      {/* Deletion Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Customer Lead Record?"
        description={`Are you certain you wish to permanently erase the inquiry from "${deleteName}"? This action will sever linked product quote logs and cannot be recovered.`}
        confirmText="Confirm Deletion"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
