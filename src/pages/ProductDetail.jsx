import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Heart, ShoppingCart, ImageOff, Star, Sparkles } from 'lucide-react';
import QuantitySelector from '../components/menu/QuantitySelector';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id });
      return products[0];
    },
  });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (product?.has_variations && product.variations?.length > 0) {
      setSelectedVariation(product.variations[0]);
    }
  }, [product]);

  const activePrice = product?.has_variations && selectedVariation
    ? selectedVariation.price
    : product?.price;

  const handleAddToCart = () => {
    if (!product) return;
    const variationLabel = product.has_variations && selectedVariation ? selectedVariation.name : null;
    const itemNotes = variationLabel ? [variationLabel, notes].filter(Boolean).join(' — ') : notes;
    addItem({ ...product, price: activePrice }, quantity, itemNotes);
    setAdded(true);
    setTimeout(() => navigate(-1), 650);
  };

  if (isLoading) {
    return (
      <div className="app-shell">
        <div className="loading-container" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="app-shell">
        <div className="page-container">
          <div className="empty-state"><h3>Produto não encontrado</h3></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ background: '#fff' }}>
      {/* Image Hero */}
      <div style={{ position: 'relative', width: '100%', height: 300, background: 'var(--gray-100)', maxWidth: '100%' }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            fetchpriority="high"
          />
        ) : (
          <div className="img-placeholder" style={{ width: '100%', height: '100%' }}>
            <ImageOff style={{ width: 48, height: 48 }} />
          </div>
        )}

        {/* Top bar overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '16px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.28), transparent)',
        }}>
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
            aria-label="Go back"
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <button
            onClick={() => setLiked(l => !l)}
            style={{
              width: 40, height: 40, borderRadius: 'var(--r-sm)',
              background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
              border: 'none', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
            aria-label="Add to favorites"
          >
            <Heart style={{
              width: 18, height: 18,
              color: liked ? '#ef4444' : 'var(--gray-500)',
              fill: liked ? '#ef4444' : 'transparent',
              transition: 'color 0.2s, fill 0.2s',
            }} />
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="animate-slide-up" style={{
        background: '#fff',
        borderRadius: '28px 28px 0 0',
        marginTop: -24,
        position: 'relative',
        zIndex: 2,
        minHeight: 'calc(100vh - 276px)',
        paddingBottom: 100,
      }}>
        <div style={{ padding: '24px 20px 0' }}>
          {/* Name & Price Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em', lineHeight: 1.25, flex: 1 }}>
              {product.name}
            </h1>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--purple-600)', letterSpacing: '-0.03em', flexShrink: 0, paddingTop: 2 }}>
              R$ {activePrice?.toFixed(2)}
            </div>
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} style={{ width: 13, height: 13, fill: '#eab308', color: '#eab308' }} />
            ))}
            <span style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 600, marginLeft: 2 }}>4.8 (128 avaliações)</span>
          </div>

          {/* Description */}
          {product.description && (
            <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: 22 }}>
              {product.description}
            </p>
          )}

          {/* Variations */}
          {product.has_variations && product.variations?.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 10 }}>Tamanho / Variação</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.variations.map((v, i) => {
                  const isSelected = selectedVariation?.name === v.name;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedVariation(v)}
                      style={{
                        padding: '9px 18px',
                        borderRadius: 'var(--r-full)',
                        border: `2px solid ${isSelected ? 'var(--purple-600)' : 'var(--gray-200)'}`,
                        background: isSelected ? 'var(--purple-600)' : '#fff',
                        color: isSelected ? '#fff' : 'var(--gray-700)',
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {v.name}
                      <span style={{ marginLeft: 6, opacity: 0.85, fontSize: 13 }}>R$ {Number(v.price).toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="divider" />

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 8 }}>Quantidade</div>
              <QuantitySelector value={quantity} onChange={setQuantity} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Subtotal</div>

              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>
                R$ {((activePrice || 0) * quantity).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="input-group">
            <label className="input-label" htmlFor="notes">
              Pedidos Especiais
            </label>
            <textarea
              id="notes"
              className="input-field"
              placeholder="Ex: sem cebola, molho extra, sem glúten... qualquer preferência é bem-vinda!"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Future customization placeholder */}
          <div style={{
            marginTop: 4,
            marginBottom: 24,
            padding: '14px 16px',
            borderRadius: 'var(--r-md)',
            background: 'var(--purple-50)',
            border: '1.5px dashed var(--purple-200)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <Sparkles style={{ width: 18, height: 18, color: 'var(--purple-400)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple-600)', marginBottom: 2 }}>
                Opções de personalização em breve
              </div>
              <div style={{ fontSize: 11, color: 'var(--purple-400)' }}>
                Adicionais e remoções sugeridas estarão disponíveis aqui
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            className={`btn btn-lg ${added ? 'btn-success' : 'btn-primary'}`}
            onClick={handleAddToCart}
            disabled={added}
            style={{ borderRadius: 'var(--r-full)', fontSize: 16, fontWeight: 800 }}
          >
            <ShoppingCart style={{ width: 20, height: 20 }} />
            {added ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
          </button>
        </div>
      </div>
    </div>
  );
}