'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ backgroundColor: '#090909', color: '#ffffff', fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#C5A55A', fontSize: '1.5rem', textTransform: 'uppercase' }}>Global System Exception</h2>
        <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{error.message || 'Fatal system error'}</p>
        <button
          onClick={() => reset()}
          style={{
            backgroundColor: '#C5A55A',
            color: '#090909',
            border: 'none',
            padding: '0.75rem 1.5rem',
            fontWeight: 'bold',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Reset Application
        </button>
      </body>
    </html>
  );
}
