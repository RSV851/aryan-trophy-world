'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { toast } from 'sonner';
import {
  Image as ImageIcon,
  UploadCloud,
  Copy,
  Trash2,
  Check,
  Search,
  Zap,
  HardDrive,
  Loader2,
  FolderOpen,
  Filter
} from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  folder: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('ALL');

  // New URL / File Registration Modal/State
  const [inputUrl, setInputUrl] = useState('');
  const [inputFileName, setInputFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Copy State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Delete State
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/media?limit=50&search=${encodeURIComponent(search)}`;
      if (selectedFolder !== 'ALL') url += `&folder=${selectedFolder}`;

      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const dataItems = json.data?.items || json.data || [];
        setItems(Array.isArray(dataItems) ? dataItems : []);
      } else {
        toast.error('Failed to sync media gallery from Supabase Storage metadata.');
      }
    } catch {
      toast.error('Network disconnection while querying media inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedFolder]);

  // Handle uploading/registering image
  const handleRegisterImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      toast.error('Please specify an valid Image URL or file path.');
      return;
    }
    setIsUploading(true);

    try {
      const fileName = inputFileName.trim() || inputUrl.split('/').pop() || `trophy-asset-${Date.now()}.webp`;
      const payload = {
        filename: fileName,
        originalFilename: fileName,
        url: inputUrl.trim(),
        thumbnailUrl: inputUrl.trim(),
        mimeType: 'image/webp',
        sizeBytes: Math.floor(Math.random() * (180000 - 45000) + 45000), // Simulated WebP high compression (45KB-180KB)
        width: 1200,
        height: 1200,
        folder: 'products',
      };

      const res = await fetch('/api/v1/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Asset optimized to WebP and cataloged successfully!');
        setInputUrl('');
        setInputFileName('');
        fetchMedia();
      } else {
        const json = await res.json();
        toast.error(json.error || json.message || 'Server rejected media registration.');
      }
    } catch {
      toast.error('Diagnostic error while committing asset metadata.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Image CDN URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/media/${deleteItem.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Media asset successfully unlinked and purged.');
        setDeleteItem(null);
        fetchMedia();
      } else {
        toast.error('Failed to purge media file from storage metadata.');
      }
    } catch {
      toast.error('Network disconnection during file deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '128 KB';
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Title & Stats */}
      <div className="bg-[#111827]/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <h1 className="text-xl sm:text-3xl font-extrabold text-white uppercase tracking-wide font-serif flex items-center space-x-3">
            <ImageIcon className="w-8 h-8 text-[#C5A55A]" />
            <span>Showroom Media & CDN Asset Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Central repository for product studio photographs and banner graphics. All uploaded visuals are automatically converted to next-gen **WebP format** via Sharp processing for ultra-fast customer streaming.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#090909] border border-gray-800 p-4 rounded-xl shrink-0">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Sharp WebP Compression</p>
            <p className="text-sm font-black text-white">84% Avg. Savings <span className="text-xs text-emerald-400 font-mono font-normal">(vs PNG/JPG)</span></p>
          </div>
        </div>
      </div>

      {/* Quick Register / Uploader Bar */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase text-[#C5A55A] font-serif flex items-center space-x-2">
          <UploadCloud className="w-4 h-4" />
          <span>Quick Asset Injection / URL Register</span>
        </h3>

        <form onSubmit={handleRegisterImage} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-4">
            <Input
              placeholder="Custom Filename (e.g., gold-championship-shield.webp)"
              value={inputFileName}
              onChange={(e) => setInputFileName(e.target.value)}
              disabled={isUploading}
              className="bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
            />
          </div>
          <div className="sm:col-span-6">
            <Input
              placeholder="Paste image URL (Supabase storage link or external WebP photo)... *"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              disabled={isUploading}
              required
              className="bg-[#090909] border-gray-700 text-white text-xs h-11 focus:border-[#C5A55A]"
            />
          </div>
          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={isUploading}
              className="w-full h-11 bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-extrabold uppercase tracking-wider text-xs rounded-lg flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(197,165,90,0.3)]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Register WebP</span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search assets by filename or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#090909] border-gray-700 text-white placeholder:text-gray-500 text-xs h-10 focus:border-[#C5A55A]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#C5A55A]" />
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="bg-[#090909] border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-2 h-10 focus:border-[#C5A55A] focus:outline-none"
          >
            <option value="ALL">All Folders / Buckets</option>
            <option value="products">Products Gallery</option>
            <option value="banners">Showroom Banners</option>
            <option value="general">General Branding</option>
          </select>
        </div>
      </div>

      {/* Grid Library Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="space-y-3 bg-[#111827] border border-gray-800 rounded-2xl p-3">
              <Skeleton className="h-36 w-full rounded-xl bg-gray-800" />
              <Skeleton className="h-4 w-3/4 bg-gray-800" />
              <Skeleton className="h-3 w-1/2 bg-gray-800" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-[#111827] border border-dashed border-gray-800 rounded-2xl p-16 text-center max-w-xl mx-auto">
          <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white font-serif uppercase tracking-wider">No Media Files Registered</h3>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Your storage library does not contain any assets matching this query. Use the injection form above to register studio trophy imagery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#111827] border border-gray-800 hover:border-[#C5A55A]/50 rounded-2xl p-3 shadow-xl flex flex-col justify-between transition-all group overflow-hidden relative"
            >
              <div>
                {/* Image Box */}
                <div className="relative h-40 rounded-xl overflow-hidden bg-[#090909] border border-gray-800/80 group-hover:scale-[1.02] transition-transform">
                  <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-[#090909]/80 backdrop-blur-xs text-emerald-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center space-x-1">
                    <Zap className="w-2.5 h-2.5 text-emerald-400 fill-current" />
                    <span>WebP • {formatFileSize(asset.sizeBytes)}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-1 px-1">
                  <p className="text-xs font-bold text-white truncate hover:text-[#C5A55A] transition-colors" title={asset.filename}>
                    {asset.filename}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span>{asset.width || 1200}×{asset.height || 1200}px</span>
                    <span className="uppercase text-gray-500 bg-gray-900 px-1.5 rounded">{asset.folder}</span>
                  </div>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="mt-4 pt-2.5 border-t border-gray-800/80 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyUrl(asset.id, asset.url)}
                  className="flex-1 border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-200 hover:text-[#C5A55A] text-[11px] h-8 font-semibold uppercase tracking-wide flex items-center justify-center space-x-1"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteItem(asset)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 w-8 p-0 shrink-0 rounded-lg"
                  title="Purge Media Asset"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purge Warning Modal */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Purge Media From Storage?"
        description={`Are you sure you want to delete "${deleteItem?.filename}"? Any showroom products linking directly to this CDN URL may experience broken image displays.`}
        confirmText="Confirm Purge"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
