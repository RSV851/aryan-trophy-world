'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/smart-image';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  MessageSquare,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  Save,
  Loader2,
  User,
  CheckCircle,
  ExternalLink,
  Edit3,
  ShieldAlert
} from 'lucide-react';

interface InquiryDetail {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone: string;
  city?: string | null;
  message?: string | null;
  status: 'new' | 'read' | 'replied' | 'closed';
  adminNotes?: string | null;
  createdAt: string;
  linkedProducts: {
    inquiryProductId: string;
    productId: string;
    quantity: number;
    productDetails?: {
      name: string;
      sku: string;
      slug: string;
      sizeUnit?: string;
      categoryName?: string;
      typeName?: string;
      primaryImage?: string | null;
    } | null;
  }[];
}

export default function AdminInquiryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [status, setStatus] = useState<InquiryDetail['status']>('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/v1/inquiries/${id}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setInquiry(json.data);
          setStatus(json.data.status || 'new');
          setAdminNotes(json.data.adminNotes || '');
        } else {
          toast.error('Failed to locate customer lead in server archive.');
        }
      })
      .catch(() => toast.error('Diagnostic network fault while reading inquiry dossier.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveUpdate = async () => {
    if (!inquiry) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/v1/inquiries/${inquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: adminNotes.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Customer Lead status & internal notes updated successfully!');
        setInquiry((prev) => (prev ? { ...prev, status, adminNotes } : null));
      } else {
        toast.error(json.error || json.message || 'Failed to apply modifications.');
      }
    } catch {
      toast.error('Network error during transaction.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl bg-gray-800" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-2 rounded-2xl bg-gray-800" />
          <Skeleton className="h-96 rounded-2xl bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="text-center py-16 bg-[#111827] border border-gray-800 rounded-2xl max-w-4xl mx-auto text-rose-400 font-bold">
        Inquiry record not found or previously erased from database.
      </div>
    );
  }

  let formattedDate = 'Recent';
  try {
    if (inquiry.createdAt) formattedDate = format(new Date(inquiry.createdAt), 'EEEE, MMMM dd, yyyy at h:mm a');
  } catch {}

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Link
            href="/admin/inquiries"
            className="text-xs text-[#C5A55A] hover:underline flex items-center space-x-1 font-semibold uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inquiries Registry</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white uppercase font-serif tracking-tight flex items-center space-x-3">
            <MessageSquare className="w-7 h-7 text-[#C5A55A]" />
            <span>Inquiry Dossier: {inquiry.name}</span>
          </h1>
          <p className="text-xs text-gray-400 font-mono flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Received: {formattedDate}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            type="button"
            onClick={handleSaveUpdate}
            disabled={isSaving}
            className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase tracking-wider text-xs h-11 px-6 rounded-lg shadow-[0_0_20px_rgba(197,165,90,0.3)] flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Committing...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Save Lead Update</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2-Span): Client Info & Multi-Product breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Dossier Card */}
          <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
              <User className="w-5 h-5 text-[#C5A55A]" />
              <span>Customer Identification & Communication Channels</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1 bg-[#090909] border border-gray-800 p-4 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-gray-400">Primary Contact Name</span>
                <p className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <span>{inquiry.name}</span>
                </p>
              </div>

              <div className="space-y-1 bg-[#090909] border border-gray-800 p-4 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-gray-400">Organization / Company</span>
                <p className="text-sm font-extrabold text-[#C5A55A] flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span>{inquiry.company || 'Private Individual / Non-Corporate'}</span>
                </p>
              </div>

              <div className="space-y-1 bg-[#090909] border border-gray-800 p-4 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-gray-400">Direct Telephone / Phone</span>
                <a href={`tel:${inquiry.phone}`} className="text-sm font-extrabold font-mono text-emerald-300 hover:underline flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{inquiry.phone}</span>
                </a>
              </div>

              <div className="space-y-1 bg-[#090909] border border-gray-800 p-4 rounded-xl">
                <span className="text-[11px] font-bold uppercase text-gray-400">Email Address</span>
                {inquiry.email ? (
                  <a href={`mailto:${inquiry.email}`} className="text-sm font-semibold text-blue-300 hover:underline flex items-center space-x-2 truncate">
                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{inquiry.email}</span>
                  </a>
                ) : (
                  <span className="text-xs text-gray-600 italic">No email address specified</span>
                )}
              </div>
            </div>

            {inquiry.city && (
              <div className="bg-[#090909] border border-gray-800 p-3.5 rounded-xl flex items-center space-x-2 text-xs text-gray-300 font-semibold">
                <MapPin className="w-4 h-4 text-[#C5A55A]" />
                <span><strong>Location / City:</strong> {inquiry.city}</span>
              </div>
            )}

            {/* Customer Remarks Message Box */}
            <div className="bg-[#090909] border border-gray-800 p-5 rounded-xl space-y-2">
              <span className="text-xs font-extrabold uppercase text-[#C5A55A] tracking-wider font-serif">
                Customer Message & Customization Notes:
              </span>
              <p className="text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-line bg-gray-900/40 p-4 rounded-lg border border-gray-800/60">
                {inquiry.message || 'The client submitted the catalog quotation request without extra written remarks.'}
              </p>
            </div>
          </div>

          {/* Multi-Product Requested Trophies Breakdown */}
          <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h2 className="text-base font-bold uppercase tracking-wide text-white font-serif flex items-center space-x-2">
                <Package className="w-5 h-5 text-[#C5A55A]" />
                <span>Requested Trophy Catalog Items ({inquiry.linkedProducts.length})</span>
              </h2>
              <span className="text-xs font-mono text-[#C5A55A]">Wholesale Quote Inventory</span>
            </div>

            <div className="divide-y divide-gray-800">
              {inquiry.linkedProducts.length === 0 ? (
                <p className="text-xs text-gray-500 py-6 text-center italic">General quotation request without direct item linkages.</p>
              ) : (
                inquiry.linkedProducts.map((item, idx) => {
                  const p = item.productDetails;
                  return (
                    <div key={item.inquiryProductId || idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <SmartImage
                          src={p?.primaryImage}
                          alt="Award Thumbnail"
                          className="w-16 h-16 rounded-xl bg-gray-900 border border-gray-800"
                          imgClassName="w-full h-full object-cover"
                          fallbackIcon={<Package className="w-6 h-6 text-gray-600" />}
                        />
                        <div>
                          <p className="text-sm font-bold text-white uppercase font-serif hover:text-[#C5A55A]">
                            {p?.name || `Showroom Trophy #${item.productId.substring(0, 8)}`}
                          </p>
                          <div className="flex items-center space-x-2 mt-1 text-xs font-mono">
                            <span className="text-[#C5A55A] font-semibold">SKU: {p?.sku || 'ARCHIVE'}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400 uppercase">{p?.categoryName || 'Trophy'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 justify-between sm:justify-end bg-[#090909] p-3 rounded-xl border border-gray-800/80">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase block font-bold">Requested Qty:</span>
                          <span className="text-base font-black font-mono text-emerald-300">
                            {item.quantity} <span className="text-xs font-normal text-gray-400">pieces</span>
                          </span>
                        </div>
                        {p?.slug ? (
                          <Link href={`/admin/products/${item.productId}`} title="Open in Showroom Workspace">
                            <Button size="sm" variant="outline" className="border-gray-700 bg-gray-800 text-[#C5A55A] hover:bg-gray-700 text-xs h-9 px-3 font-bold">
                              <Edit3 className="w-3.5 h-3.5 mr-1" />
                              <span>View Item</span>
                            </Button>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1-Span): Admin Processor & Notes */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6 sticky top-28">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#C5A55A] font-serif border-b border-gray-800 pb-3 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Lead Pipeline Processor</span>
            </h3>

            {/* Status Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-gray-300 tracking-wider">
                Conversation Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={isSaving}
                className="w-full bg-[#090909] border border-gray-700 text-white font-bold text-xs rounded-xl px-3.5 py-3 focus:border-[#C5A55A] focus:outline-none h-12 shadow-sm"
              >
                <option value="new">🟡 NEW — Unread Customer Lead</option>
                <option value="read">🔵 READ — Under Quote Review</option>
                <option value="replied">🟢 REPLIED — Quotation Dispatched</option>
                <option value="closed">⚪ CLOSED — Archived / Won or Expired</option>
              </select>
              <p className="text-[11px] text-gray-400 leading-normal">
                Update status to keep your dashboard metrics accurate.
              </p>
            </div>

            {/* Admin Notes */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-gray-300 tracking-wider">
                Private Admin Remarks & Pricing Quotes
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Record negotiated prices, sample delivery timelines, or follow-up dates here. (Never visible to clients)..."
                className="bg-[#090909] border-gray-700 text-emerald-300 placeholder:text-gray-600 font-mono text-xs min-h-[160px] leading-relaxed focus:border-[#C5A55A] p-3.5 rounded-xl"
                disabled={isSaving}
              />
            </div>

            {/* Save Button */}
            <Button
              type="button"
              onClick={handleSaveUpdate}
              disabled={isSaving}
              className="w-full h-12 bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_20px_rgba(197,165,90,0.3)] flex items-center justify-center space-x-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Committing...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[3]" />
                  <span>Commit Status & Notes</span>
                </>
              )}
            </Button>

            <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400 text-center font-medium">
              ⚡ Instant Phone Connect: <a href={`tel:${inquiry.phone}`} className="text-[#C5A55A] font-extrabold underline">{inquiry.phone}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
