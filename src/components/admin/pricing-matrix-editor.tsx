'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Grid, DollarSign, Box, Layers, HelpCircle } from 'lucide-react';

export interface MatrixItem {
  sizeLabel: string;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  weightKg: number | string;
  quantity: number;
  pricePerPiece: number | string;
}

interface SizeRow {
  id: string;
  sizeLabel: string;
  length: number;
  width: number;
  height: number;
  weightKg: number;
}

interface PricingMatrixEditorProps {
  value: MatrixItem[];
  onChange: (items: MatrixItem[]) => void;
  sizeUnit?: string;
}

export function PricingMatrixEditor({
  value = [],
  onChange,
  sizeUnit = 'cm',
}: PricingMatrixEditorProps) {
  const [rows, setRows] = useState<SizeRow[]>([]);
  const [quantities, setQuantities] = useState<number[]>([25, 50, 100]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [newQtyInput, setNewQtyInput] = useState<string>('');

  // Initialize internal 2D grid structure from flattened prop array
  useEffect(() => {
    if (value && value.length > 0 && rows.length === 0) {
      const uniqueQtys = Array.from(new Set(value.map((v) => Number(v.quantity)))).sort(
        (a, b) => a - b
      );
      if (uniqueQtys.length > 0) setQuantities(uniqueQtys);

      // Extract distinct rows by sizeLabel
      const distinctRowsMap: Record<string, SizeRow> = {};
      const newPrices: Record<string, number> = {};

      value.forEach((v) => {
        const key = v.sizeLabel || 'Standard';
        if (!distinctRowsMap[key]) {
          distinctRowsMap[key] = {
            id: Math.random().toString(36).substring(2, 9),
            sizeLabel: key,
            length: Number(v.length || 0),
            width: Number(v.width || 0),
            height: Number(v.height || 0),
            weightKg: Number(v.weightKg || 1),
          };
        }
        const cellKey = `${distinctRowsMap[key].id}_${v.quantity}`;
        newPrices[cellKey] = Number(v.pricePerPiece || 0);
      });

      const parsedRows = Object.values(distinctRowsMap);
      setRows(parsedRows.length > 0 ? parsedRows : getDefaultRow());
      setPrices(newPrices);
    } else if (rows.length === 0) {
      // Default Initial Grid state
      const initialRow = getDefaultRow();
      setRows(initialRow);
      setQuantities([25, 50, 100]);
      const initialPrices: Record<string, number> = {};
      initialRow.forEach((r) => {
        [25, 50, 100].forEach((q) => {
          initialPrices[`${r.id}_${q}`] = 1200; // Example placeholder ₹1,200
        });
      });
      setPrices(initialPrices);
    }
  }, [value, rows.length]);

  function getDefaultRow(): SizeRow[] {
    return [
      {
        id: Math.random().toString(36).substring(2, 9),
        sizeLabel: 'Standard Size',
        length: 12,
        width: 12,
        height: 32,
        weightKg: 1.2,
      },
    ];
  }

  // Trigger onChange callback whenever internal grid changes
  const emitChange = (updatedRows: SizeRow[], updatedQtys: number[], updatedPrices: Record<string, number>) => {
    const flatItems: MatrixItem[] = [];
    updatedRows.forEach((row) => {
      updatedQtys.forEach((qty) => {
        const cellKey = `${row.id}_${qty}`;
        const cellPrice = updatedPrices[cellKey] ?? 0;
        flatItems.push({
          sizeLabel: row.sizeLabel || 'Custom',
          length: Number(row.length) || 0,
          width: Number(row.width) || 0,
          height: Number(row.height) || 0,
          weightKg: Number(row.weightKg) || 0.1,
          quantity: Number(qty) || 1,
          pricePerPiece: Number(cellPrice) || 0,
        });
      });
    });
    onChange(flatItems);
  };

  // Add Size Row
  const handleAddRow = () => {
    const newRow: SizeRow = {
      id: Math.random().toString(36).substring(2, 9),
      sizeLabel: `Size ${rows.length + 1}`,
      length: 15,
      width: 15,
      height: 35,
      weightKg: 1.5,
    };
    const updatedRows = [...rows, newRow];
    const updatedPrices = { ...prices };
    quantities.forEach((q) => {
      updatedPrices[`${newRow.id}_${q}`] = 1500;
    });
    setRows(updatedRows);
    setPrices(updatedPrices);
    emitChange(updatedRows, quantities, updatedPrices);
  };

  // Remove Size Row
  const handleRemoveRow = (rowId: string) => {
    if (rows.length <= 1) return; // Retain at least 1 row
    const updatedRows = rows.filter((r) => r.id !== rowId);
    setRows(updatedRows);
    emitChange(updatedRows, quantities, prices);
  };

  // Add Quantity Column
  const handleAddQty = () => {
    const qtyVal = parseInt(newQtyInput, 10);
    if (isNaN(qtyVal) || qtyVal <= 0 || quantities.includes(qtyVal)) return;
    const updatedQtys = [...quantities, qtyVal].sort((a, b) => a - b);
    const updatedPrices = { ...prices };
    rows.forEach((r) => {
      updatedPrices[`${r.id}_${qtyVal}`] = updatedPrices[`${r.id}_${quantities[0]}`] || 1000;
    });
    setQuantities(updatedQtys);
    setPrices(updatedPrices);
    setNewQtyInput('');
    emitChange(rows, updatedQtys, updatedPrices);
  };

  // Remove Quantity Column
  const handleRemoveQty = (qtyToRemove: number) => {
    if (quantities.length <= 1) return;
    const updatedQtys = quantities.filter((q) => q !== qtyToRemove);
    setQuantities(updatedQtys);
    emitChange(rows, updatedQtys, prices);
  };

  // Row Header Modification
  const handleRowChange = (id: string, field: keyof SizeRow, val: string | number) => {
    const updatedRows = rows.map((r) =>
      r.id === id ? { ...r, [field]: field === 'sizeLabel' ? val : Number(val) || 0 } : r
    );
    setRows(updatedRows);
    emitChange(updatedRows, quantities, prices);
  };

  // Cell Price Modification
  const handlePriceChange = (rowId: string, qty: number, val: string) => {
    const numVal = parseFloat(val) || 0;
    const updatedPrices = { ...prices, [`${rowId}_${qty}`]: numVal };
    setPrices(updatedPrices);
    emitChange(rows, quantities, updatedPrices);
  };

  return (
    <div className="space-y-4 bg-[#090909] border border-gray-800 rounded-2xl p-5 shadow-inner">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#C5A55A] font-serif flex items-center space-x-2">
            <Grid className="w-4 h-4" />
            <span>2D Showroom Pricing & Dimension Matrix</span>
          </h3>
          <p className="text-xs text-gray-400">
            Define customized price tiers based on physical trophy volume ({sizeUnit}) and customer wholesale volume breakpoints.
          </p>
        </div>

        {/* Add Qty Breakpoint Column Input */}
        <div className="flex items-center space-x-2 bg-[#111827] border border-gray-700 rounded-lg p-1.5 shadow-sm">
          <span className="text-[11px] font-bold text-gray-300 uppercase px-1.5">New Qty Tier:</span>
          <Input
            type="number"
            placeholder="e.g. 200"
            value={newQtyInput}
            onChange={(e) => setNewQtyInput(e.target.value)}
            className="w-20 h-7 text-xs bg-[#090909] border-gray-700 text-white text-center px-1 focus:border-[#C5A55A]"
          />
          <Button
            type="button"
            onClick={handleAddQty}
            size="sm"
            className="h-7 px-2.5 bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-bold text-[11px] uppercase tracking-wider rounded"
          >
            + Add Qty
          </Button>
        </div>
      </div>

      {/* Grid Overflow Table */}
      <div className="overflow-x-auto bg-[#111827] border border-gray-800 rounded-xl shadow-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#090909]/90 border-b border-gray-800 text-gray-300 font-serif uppercase tracking-wider">
              <th className="p-3 w-48 border-r border-gray-800 font-bold text-[#C5A55A]">
                Trophy Size Label
              </th>
              <th className="p-3 w-56 border-r border-gray-800 text-center">
                Dimensions ({sizeUnit}) [L x B x H]
              </th>
              <th className="p-3 w-28 border-r border-gray-800 text-center">
                Weight (Kg)
              </th>
              {quantities.map((q) => (
                <th key={q} className="p-3 text-center border-r border-gray-800 bg-gray-900/50">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Qty: {q}+ pcs</span>
                    {quantities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQty(q)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded p-0.5"
                        title={`Delete ${q}+ tier`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-3 w-16 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800/60">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-800/30 transition-colors">
                {/* Size Label Input */}
                <td className="p-2.5 border-r border-gray-800">
                  <Input
                    value={row.sizeLabel}
                    onChange={(e) => handleRowChange(row.id, 'sizeLabel', e.target.value)}
                    placeholder="e.g. Medium 12-inch"
                    className="h-9 text-xs bg-[#090909] border-gray-700 text-white font-semibold focus:border-[#C5A55A]"
                  />
                </td>

                {/* Dimensions LxBxH */}
                <td className="p-2.5 border-r border-gray-800">
                  <div className="flex items-center justify-center space-x-1 text-gray-400">
                    <Input
                      type="number"
                      step="0.1"
                      value={row.length || ''}
                      onChange={(e) => handleRowChange(row.id, 'length', e.target.value)}
                      className="w-14 h-9 text-center bg-[#090909] border-gray-700 text-white px-1 text-xs"
                      title="Length"
                    />
                    <span>×</span>
                    <Input
                      type="number"
                      step="0.1"
                      value={row.width || ''}
                      onChange={(e) => handleRowChange(row.id, 'width', e.target.value)}
                      className="w-14 h-9 text-center bg-[#090909] border-gray-700 text-white px-1 text-xs"
                      title="Width/Breadth"
                    />
                    <span>×</span>
                    <Input
                      type="number"
                      step="0.1"
                      value={row.height || ''}
                      onChange={(e) => handleRowChange(row.id, 'height', e.target.value)}
                      className="w-14 h-9 text-center bg-[#090909] border-gray-700 text-white px-1 text-xs font-bold text-[#C5A55A]"
                      title="Height"
                    />
                  </div>
                </td>

                {/* Weight */}
                <td className="p-2.5 border-r border-gray-800 text-center">
                  <Input
                    type="number"
                    step="0.05"
                    value={row.weightKg || ''}
                    onChange={(e) => handleRowChange(row.id, 'weightKg', e.target.value)}
                    className="w-20 h-9 mx-auto text-center bg-[#090909] border-gray-700 text-white text-xs font-mono"
                  />
                </td>

                {/* Price Cells */}
                {quantities.map((q) => {
                  const cellKey = `${row.id}_${q}`;
                  const price = prices[cellKey] ?? 0;
                  return (
                    <td key={q} className="p-2.5 border-r border-gray-800 text-center bg-gray-900/20">
                      <div className="relative max-w-[110px] mx-auto">
                        <span className="absolute left-2.5 top-2 text-gray-400 text-xs font-bold">₹</span>
                        <Input
                          type="number"
                          value={price === 0 ? '' : price}
                          onChange={(e) => handlePriceChange(row.id, q, e.target.value)}
                          className="w-full h-9 pl-6 pr-2 text-right bg-[#090909] border-gray-700 text-emerald-300 font-mono font-bold text-xs focus:border-[#C5A55A]"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                  );
                })}

                {/* Row Action */}
                <td className="p-2.5 text-center">
                  {rows.length > 1 ? (
                    <Button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      variant="ghost"
                      size="sm"
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 w-8 p-0"
                      title="Remove size specification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <span className="text-[10px] text-gray-600 font-medium">Primary</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Row Button */}
      <div className="flex justify-between items-center pt-1">
        <Button
          type="button"
          onClick={handleAddRow}
          variant="outline"
          size="sm"
          className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-[#C5A55A] font-bold uppercase tracking-wider text-xs h-9 px-4 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Another Size Variation Row</span>
        </Button>
        <span className="text-[11px] text-gray-500 font-medium italic">
          * All dimensional inputs will dynamically recalculate min/max pricing range automatically.
        </span>
      </div>
    </div>
  );
}
