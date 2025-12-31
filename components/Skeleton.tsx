'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  rows?: number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ 
  className = '', 
  rows = 1, 
  variant = 'rectangular' 
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 green-mode:bg-green-200';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className={`${baseClasses} ${variantClasses[variant]} ${className}`} 
        />
      ))}
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 green-mode:bg-green-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}
