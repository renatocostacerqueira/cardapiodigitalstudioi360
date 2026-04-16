import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus, ImageOff, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function UpsellSuggestions({ cartItemIds = [] }) {
  const { addItem } = useCart();

  const { data: products = [] } = useQuery({
    queryKey: ['products-upsell'],
    queryFn: () => base44.entities.Product.filter({ available: true }),
  });

  // Show featured products not already in cart
  const suggestions = products
    .filter(p => p.featured && !cartItemIds.includes(p.product_id || p.id))
    .slice(0, 6);

  // Fall back to any available products not in cart
  const fallback = products
    .filter(p => !cartItemIds.includes(p.product_id || p.id) && !p.featured)
    .slice(0, Math.max(0, 4 - suggestions.length));

  const toShow = [...suggestions, ...fallback].slice(0, 4);

  if (toShow.length === 0) return null;

  const handleAdd = (product) => {
    addItem(product, 1, '');
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Sparkles style={{ width: 16, height: 16, color: 'var(--purple-500)' }} />
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-800)', letterSpacing: '-0.01em' }}>
          Você também pode gostar
        </h3>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {toShow.map(product => (
          <div key={product.id} style={{
            flexShrink: 0, width: 140,
            background: '#fff', borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
          }}>
            {product.image ? (
              <img src={product.image} alt={product.name}
                style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div className="img-placeholder" style={{ width: '100%', height: 90 }}>
                <ImageOff style={{ width: 22, height: 22 }} />
              </div>
            )}
            <div style={{ padding: '8px 10px 10px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 2,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.name}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--purple-600)', letterSpacing: '-0.02em', marginBottom: 8 }}>
                R$ {product.price?.toFixed(2)}
              </div>
              <button
                onClick={() => handleAdd(product)}
                style={{
                  width: '100%', padding: '7px 0',
                  background: 'var(--purple-600)', color: '#fff',
                  border: 'none', borderRadius: 'var(--r-full)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  transition: 'background 0.15s',
                }}
              >
                <Plus style={{ width: 13, height: 13 }} /> Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}