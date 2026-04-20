import React from 'react';
import { Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

/**
 * Exibe nota média real do produto (entidade Review). Fallback para placeholder se não tem reviews.
 */
export default function ProductRatingBadge({ productId, size = 13, showCount = true }) {
  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => base44.entities.Review.filter({ product_id: productId }),
    staleTime: 60000,
  });

  if (reviews.length === 0) return null;

  const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Star style={{ width: size, height: size, fill: '#eab308', color: '#eab308' }} />
      <span style={{ fontSize: Math.max(11, size - 2), color: 'var(--gray-500)', fontWeight: 700 }}>
        {avg.toFixed(1)}
        {showCount && <span style={{ color: 'var(--gray-400)', fontWeight: 500 }}> ({reviews.length})</span>}
      </span>
    </div>
  );
}