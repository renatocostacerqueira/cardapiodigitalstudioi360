import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, ImageOff, Star, Sparkles, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

function QuantityControl({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--gray-100)', borderRadius: 'var(--r-full)', padding: '4px' }}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        style={{
          width: 34, height: 34, borderRadius: 'var(--r-full)', border: 'none',
          background: value <= 1 ? 'transparent' : '#fff',
          color: value <= 1 ? 'var(--gray-300)' : 'var(--gray-700)',
          cursor: value <= 1 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: value <= 1 ? 'none' : 'var(--shadow-xs)',
          transition: 'all 0.15s',
        }}
      >
        <Minus style={{ width: 14, height: 14 }} />
      </button>
      <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 800, fontSize: 16, color: 'var(--gray-900)' }}>{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        style={{
          width: 34, height: 34, borderRadius: 'var(--r-full)', border: 'none',
          background: 'var(--purple-600)', color: '#fff',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(109,40,217,0.30)',
          transition: 'background 0.15s',
        }}
      >
        <Plus style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}

/* ─── MOBILE layout (bottom-sheet style) ─────────────────────────────── */
function MobileModal({ product, onClose }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(
    product?.has_variations && product.variations?.length > 0 ? product.variations[0] : null
  );

  const activePrice = product?.has_variations && selectedVariation ? selectedVariation.price : product?.price;

  const handleAdd = () => {
    const variationLabel = product.has_variations && selectedVariation ? selectedVariation.name : null;
    const itemNotes = variationLabel ? [variationLabel, notes].filter(Boolean).join(' — ') : notes;
    addItem({ ...product, price: activePrice }, quantity, itemNotes);
    setAdded(true);
    setTimeout(() => onClose(), 600);
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 1001,
        background: '#fff',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Drag handle */}
      <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--gray-200)' }} />
      </div>

      {/* Image */}
      <div style={{ position: 'relative', width: '100%', height: 220, background: 'var(--gray-100)', flexShrink: 0 }}>
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div className="img-placeholder" style={{ width: '100%', height: '100%' }}><ImageOff style={{ width: 40, height: 40 }} /></div>}
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.45)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
        <button onClick={() => setLiked(l => !l)} style={{ position: 'absolute', top: 12, right: 56, width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.45)', color: liked ? '#ef4444' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
          <Heart style={{ width: 16, height: 16, fill: liked ? '#ef4444' : 'transparent', transition: 'fill 0.2s' }} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em', lineHeight: 1.25, flex: 1 }}>{product.name}</h2>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--purple-600)', letterSpacing: '-0.03em', flexShrink: 0 }}>R$ {activePrice?.toFixed(2)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          {[...Array(5)].map((_, i) => <Star key={i} style={{ width: 12, height: 12, fill: '#eab308', color: '#eab308' }} />)}
          <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 600, marginLeft: 2 }}>4.8 (128)</span>
        </div>
        {product.description && <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: 18 }}>{product.description}</p>}

        {product.has_variations && product.variations?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tamanho</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.variations.map((v, i) => {
                const sel = selectedVariation?.name === v.name;
                return (
                  <button key={i} onClick={() => setSelectedVariation(v)} style={{ padding: '8px 16px', borderRadius: 'var(--r-full)', border: `2px solid ${sel ? 'var(--purple-600)' : 'var(--gray-200)'}`, background: sel ? 'var(--purple-600)' : '#fff', color: sel ? '#fff' : 'var(--gray-700)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {v.name} · R$ {Number(v.price).toFixed(2)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="divider" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <QuantityControl value={quantity} onChange={setQuantity} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subtotal</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>R$ {((activePrice || 0) * quantity).toFixed(2)}</div>
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 20 }}>
          <label className="input-label">Pedidos Especiais</label>
          <textarea className="input-field" placeholder="Ex: sem cebola, molho extra..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ resize: 'none' }} />
        </div>

        <button className={`btn btn-lg ${added ? 'btn-success' : 'btn-primary'}`} onClick={handleAdd} disabled={added} style={{ borderRadius: 'var(--r-full)', fontWeight: 800 }}>
          <ShoppingCart style={{ width: 18, height: 18 }} />
          {added ? '✓ Adicionado!' : `Adicionar · R$ ${((activePrice || 0) * quantity).toFixed(2)}`}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── DESKTOP layout (two-column, large modal) ────────────────────────── */
function DesktopModal({ product, onClose }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(
    product?.has_variations && product.variations?.length > 0 ? product.variations[0] : null
  );

  const activePrice = product?.has_variations && selectedVariation ? selectedVariation.price : product?.price;

  const handleAdd = () => {
    const variationLabel = product.has_variations && selectedVariation ? selectedVariation.name : null;
    const itemNotes = variationLabel ? [variationLabel, notes].filter(Boolean).join(' — ') : notes;
    addItem({ ...product, price: activePrice }, quantity, itemNotes);
    setAdded(true);
    setTimeout(() => onClose(), 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 16 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        width: '88vw',
        maxWidth: 1100,
        height: '82vh',
        maxHeight: 780,
        display: 'flex',
        background: '#fff',
        borderRadius: 28,
        boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10)',
        overflow: 'hidden',
      }}
    >
      {/* LEFT: Image column */}
      <div style={{ flex: '0 0 48%', position: 'relative', background: 'var(--gray-100)' }}>
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div className="img-placeholder" style={{ width: '100%', height: '100%' }}><ImageOff style={{ width: 64, height: 64 }} /></div>}

        {/* Gradient overlay at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />

        {/* Price pill on image */}
        <div style={{
          position: 'absolute', bottom: 24, left: 24,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderRadius: 'var(--r-full)', padding: '10px 20px',
          fontWeight: 900, fontSize: 22, color: 'var(--purple-700)',
          letterSpacing: '-0.03em', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>
          R$ {activePrice?.toFixed(2)}
        </div>

        {/* Featured badge */}
        {product.featured && (
          <div style={{ position: 'absolute', top: 20, left: 20, background: 'var(--purple-600)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '5px 14px', borderRadius: 'var(--r-full)', textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: '0 4px 12px rgba(109,40,217,0.4)' }}>
            ⭐ Popular
          </div>
        )}
      </div>

      {/* RIGHT: Details column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 16px', borderBottom: '1px solid var(--gray-100)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[...Array(5)].map((_, i) => <Star key={i} style={{ width: 14, height: 14, fill: '#eab308', color: '#eab308' }} />)}
            <span style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 600, marginLeft: 4 }}>4.8 · 128 avaliações</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setLiked(l => !l)} style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid var(--gray-200)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}>
              <Heart style={{ width: 17, height: 17, color: liked ? '#ef4444' : 'var(--gray-400)', fill: liked ? '#ef4444' : 'transparent', transition: 'all 0.2s' }} />
            </button>
            <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'var(--gray-100)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
              <X style={{ width: 17, height: 17, color: 'var(--gray-600)' }} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em', lineHeight: 1.2, marginBottom: 10 }}>{product.name}</h2>
          {product.description && <p style={{ fontSize: 15, color: 'var(--gray-500)', lineHeight: 1.75, marginBottom: 24 }}>{product.description}</p>}

          {product.has_variations && product.variations?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tamanho / Variação</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {product.variations.map((v, i) => {
                  const sel = selectedVariation?.name === v.name;
                  return (
                    <button key={i} onClick={() => setSelectedVariation(v)} style={{ padding: '10px 20px', borderRadius: 'var(--r-full)', border: `2px solid ${sel ? 'var(--purple-600)' : 'var(--gray-200)'}`, background: sel ? 'var(--purple-600)' : '#fff', color: sel ? '#fff' : 'var(--gray-700)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s', boxShadow: sel ? '0 4px 14px rgba(109,40,217,0.28)' : 'none' }}>
                      {v.name}
                      <span style={{ marginLeft: 8, opacity: 0.85, fontSize: 13 }}>R$ {Number(v.price).toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="divider" />

          <div className="input-group">
            <label className="input-label">Pedidos Especiais</label>
            <textarea className="input-field" placeholder="Ex: sem cebola, molho extra..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ resize: 'none' }} />
          </div>

          {/* Sparkles hint */}
          <div style={{ marginTop: 4, padding: '12px 16px', borderRadius: 'var(--r-md)', background: 'var(--purple-50)', border: '1.5px dashed var(--purple-200)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles style={{ width: 16, height: 16, color: 'var(--purple-400)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--purple-500)', fontWeight: 600 }}>Opções de personalização em breve</span>
          </div>
        </div>

        {/* Fixed bottom bar */}
        <div style={{ padding: '18px 28px', borderTop: '1px solid var(--gray-100)', background: '#fafafa', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Quantidade</div>
              <QuantityControl value={quantity} onChange={setQuantity} />
            </div>
            <button
              className={`btn ${added ? 'btn-success' : 'btn-primary'}`}
              onClick={handleAdd}
              disabled={added}
              style={{ borderRadius: 'var(--r-full)', fontWeight: 800, fontSize: 15, padding: '14px 28px', flex: 1, maxWidth: 280 }}
            >
              <ShoppingCart style={{ width: 18, height: 18 }} />
              {added ? '✓ Adicionado!' : `Adicionar · R$ ${((activePrice || 0) * quantity).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Root export: chooses layout by screen width ─────────────────────── */
export default function ProductModal({ product, onClose }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (product) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 1000 }}
          />
          {isDesktop
            ? <DesktopModal product={product} onClose={onClose} />
            : <MobileModal product={product} onClose={onClose} />}
        </>
      )}
    </AnimatePresence>
  );
}