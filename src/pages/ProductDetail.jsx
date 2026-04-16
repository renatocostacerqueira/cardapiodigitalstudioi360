import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ImageOff, ShoppingCart } from 'lucide-react';
import QuantitySelector from '../components/menu/QuantitySelector';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id });
      return products[0];
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, notes);
    setAdded(true);
    setTimeout(() => navigate(-1), 600);
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <div className="loading-container" style={{ minHeight: '100vh' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="app-shell">
        <div className="page-container">
          <div className="empty-state">
            <h3>Product not found</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div style={{ position: 'relative' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: 280, objectFit: 'cover' }}
          />
        ) : (
          <div className="img-placeholder" style={{ width: '100%', height: 280 }}>
            <ImageOff style={{ width: 48, height: 48 }} />
          </div>
        )}
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: 16, left: 16 }}
        >
          <ArrowLeft style={{ width: 20, height: 20 }} />
        </button>
      </div>

      <div className="card-body animate-slide-up" style={{ padding: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
          {product.name}
        </h1>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--purple-600)', marginBottom: 16 }}>
          R$ {product.price?.toFixed(2)}
        </div>
        {product.description && (
          <p style={{ fontSize: 15, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 24 }}>
            {product.description}
          </p>
        )}

        <div className="divider" />

        <div style={{ marginBottom: 20 }}>
          <label className="input-label">Quantity</label>
          <QuantitySelector value={quantity} onChange={setQuantity} />
        </div>

        <div className="input-group">
          <label className="input-label">Special Notes</label>
          <textarea
            className="input-field"
            placeholder="Any special requests? (e.g., no onions, extra sauce...)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div style={{
          padding: '16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8
        }}>
          <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>Subtotal</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)' }}>
            R$ {(product.price * quantity).toFixed(2)}
          </span>
        </div>

        <button
          className={`btn ${added ? 'btn-success' : 'btn-primary'} btn-lg`}
          onClick={handleAddToCart}
          disabled={added}
        >
          <ShoppingCart style={{ width: 20, height: 20 }} />
          {added ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}