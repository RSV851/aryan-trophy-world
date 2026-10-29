'use client';

import React, { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight, Inbox, ArrowUpDown } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  emptyTitle?: string;
  emptyDescription?: string;
  headerAction?: React.ReactNode;
  filterSlot?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = 'Search catalog entries...',
  onSearchChange,
  searchValue = '',
  pagination,
  emptyTitle = 'No entries available',
  emptyDescription = 'There are no records matching your current filter criteria.',
  headerAction,
  filterSlot,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Debounced search trigger (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearchChange && localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange, searchValue]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mobile-mid:gap-4 bg-[#111827]/60 border border-gray-800/80 rounded-xl p-2.5 mobile-mid:p-3.5 sm:p-4 backdrop-blur-xs shadow-inner">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mobile-mid:gap-3 flex-1">
          {onSearchChange && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 mobile-mid:top-3 w-3.5 h-3.5 mobile-mid:w-4 mobile-mid:h-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-8 mobile-mid:pl-9 bg-[#090909] border-gray-700 text-white placeholder:text-gray-500 text-[11px] mobile-mid:text-xs h-9 mobile-mid:h-10 focus:border-[#C5A55A] focus:ring-[#C5A55A]/50"
              />
            </div>
          )}
          {filterSlot && <div className="flex items-center gap-2">{filterSlot}</div>}
        </div>
        {headerAction && <div className="flex items-center justify-end shrink-0">{headerAction}</div>}
      </div>

      {/* Table Container */}
      <div className="bg-[#111827] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <Table className="w-full text-left">
            <TableHeader className="bg-[#090909]/80 border-b border-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-gray-800">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <TableHead
                        key={header.id}
                        className="py-2.5 mobile-mid:py-3.5 px-2.5 mobile-mid:px-4 text-[10px] mobile-mid:text-xs font-bold uppercase tracking-wider text-gray-300 font-serif whitespace-nowrap select-none"
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        style={{ cursor: canSort ? 'pointer' : 'default' }}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {canSort && <ArrowUpDown className="w-3 h-3 mobile-mid:w-3.5 mobile-mid:h-3.5 text-[#C5A55A]/70 shrink-0" />}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y divide-gray-800/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent border-gray-800/60">
                    {columns.map((_, idx) => (
                      <TableCell key={idx} className="py-3 mobile-mid:py-4 px-2.5 mobile-mid:px-4">
                        <Skeleton className="h-4 mobile-mid:h-5 w-full max-w-[140px] bg-gray-800/80 rounded-md" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="hover:bg-[#1f2937]/50 transition-colors border-gray-800/60 group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5 mobile-mid:py-3.5 px-2.5 mobile-mid:px-4 text-xs mobile-mid:text-sm text-gray-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="h-60 text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-500 mb-2">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-300 uppercase font-serif tracking-wider">
                        {emptyTitle}
                      </p>
                      <p className="text-xs text-gray-400 text-center leading-relaxed">
                        {emptyDescription}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-[#090909]/90 border-t border-gray-800 px-3 mobile-mid:px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <div className="text-[11px] mobile-mid:text-xs text-center sm:text-left">
              Showing page <strong className="text-[#C5A55A] font-semibold">{pagination.page}</strong> of{' '}
              <strong className="text-white font-semibold">{pagination.totalPages}</strong> (
              <span className="text-gray-300 font-medium">{pagination.totalItems} total records</span>)
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
                className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] mobile-mid:text-xs h-8 mobile-mid:h-9 px-2.5 mobile-mid:px-3.5 flex items-center space-x-1 uppercase font-semibold tracking-wider"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] mobile-mid:text-xs h-8 mobile-mid:h-9 px-2.5 mobile-mid:px-3.5 flex items-center space-x-1 uppercase font-semibold tracking-wider"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
