'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/api';

interface CMSImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: boolean;
}

/**
 * Optimized Image Component
 * Handles both local filenames and full URLs automatically
 * @example
 * // With filename (auto-constructs URL)
 * <CMSImage src="image.jpg" alt="Description" width={800} height={600} />
 * 
 * // With full URL
 * <CMSImage src="https://example.com/image.jpg" alt="Description" width={800} height={600} />
 */
export function CMSImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  rounded = false,
}: CMSImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Auto-construct full URL if needed
  const imageSrc = src.startsWith('http') ? src : getImageUrl(src);

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          rounded && 'rounded-lg',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-xs">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', rounded && 'rounded-lg')}>
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 animate-pulse bg-muted',
            rounded && 'rounded-lg'
          )}
        />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        className={cn(
          'duration-300 ease-in-out',
          isLoading ? 'opacity-0 blur-lg scale-105' : 'opacity-100 blur-0 scale-100',
          rounded && 'rounded-lg',
          className
        )}
        sizes={sizes}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
