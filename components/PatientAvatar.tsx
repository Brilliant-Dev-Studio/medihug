'use client';

import { useState } from 'react';

export default function PatientAvatar({
  src, loading, bg, className = '',
}: {
  src: string;
  loading: boolean;
  bg: string;
  className?: string;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className={`relative flex items-center justify-center font-bold overflow-hidden shrink-0 ${className}`} style={{ backgroundColor: bg }}>
      {(loading || (src && !imgLoaded)) && (
        <div className="absolute inset-0 bg-white/25 animate-pulse" />
      )}
      {!loading && !src && 'P'}
      {src && (
        <img
          src={src}
          alt=""
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
