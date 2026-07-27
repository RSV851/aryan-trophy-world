'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled App Router Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#090909] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-6">
        <AlertTriangle className="w-9 h-9" />
      </div>

      <h1 className="text-2xl font-bold uppercase tracking-wider text-white mb-2 font-serif">System Error Encountered</h1>
      <p className="text-xs text-gray-400 max-w-md leading-relaxed mb-6 font-mono bg-gray-900/60 p-3 rounded-lg border border-gray-800">
        {error.message || 'An unexpected rendering error occurred inside the application.'}
      </p>

      <Button
        onClick={() => reset()}
        className="bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase text-xs h-11 px-6 rounded-lg flex items-center space-x-2 shadow-[0_0_15px_rgba(197,165,90,0.3)]"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Try Reloading Component</span>
      </Button>
    </div>
  );
}
