'use client';

import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

export interface SmartImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackIcon?: React.ReactNode;
  cacheBust?: boolean;
}

export function SmartImage({
  src,
  alt,
  className = '',
  imgClassName = 'w-full h-full object-cover',
  fallbackIcon,
  cacheBust = true,
}: SmartImageProps) {
  const cleanSrc = typeof src === 'string' ? src.trim() : '';
  const isValidSrc = Boolean(
    cleanSrc &&
    cleanSrc !== 'null' &&
    cleanSrc !== 'undefined' &&
    cleanSrc !== '""' &&
    (cleanSrc.startsWith('http') || cleanSrc.startsWith('/') || cleanSrc.startsWith('data:'))
  );

  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(isValidSrc ? 'loading' : 'error');

  useEffect(() => {
    if (!isValidSrc) {
      setStatus('error');
      return;
    }

    // Reset status to loading on src change
    setStatus('loading');

    // Data URLs (base64) don't need network verification
    if (cleanSrc.startsWith('data:')) {
      setStatus('success');
      return;
    }

    // Force network check to verify file existence on Supabase server (bypassing browser disk cache)
    const testImg = new window.Image();
    const separator = cleanSrc.includes('?') ? '&' : '?';
    const liveVerifyUrl = cleanSrc.startsWith('http') ? `${cleanSrc}${separator}_cb=${Date.now()}` : cleanSrc;

    testImg.onerror = () => {
      setStatus('error');
    };
    testImg.onload = () => {
      setStatus('success');
    };
    testImg.src = liveVerifyUrl;
  }, [cleanSrc, isValidSrc]);

  const defaultFallback = (
    <div className="w-full h-full flex items-center justify-center bg-gray-900/80 text-[#C5A55A] p-2">
      <Trophy className="w-1/2 h-1/2 opacity-70 stroke-[1.5]" />
    </div>
  );

  return (
    <div className={`relative flex items-center justify-center overflow-hidden shrink-0 ${className}`}>
      {/* Show fallback icon by default while loading or on error */}
      {status !== 'success' && (fallbackIcon || defaultFallback)}

      {/* Render image only when live server verification succeeds */}
      {isValidSrc && status === 'success' && (
        <img
          src={cleanSrc}
          alt={alt}
          onError={() => setStatus('error')}
          className={imgClassName}
        />
      )}
    </div>
  );
}
