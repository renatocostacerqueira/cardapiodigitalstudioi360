import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, ImageOff, Star, Sparkles, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { colors, shadows, radii, typography, zIndex, transitions } from '../../lib/tokens';

/* ─── Quantity control ────────────────────────────────────────────────── */
function QuantityControl({ value, onChange }) {
  const atMin = value <= 1;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      background: colors.gray100, borderRadius: radii.full, padding: 4,
    }}>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={atMin}
        style={{
          width: 34, height: 34, borderRadius: radii.full, border: 'none',
          background: atMin ? 'transparent' : colors.white,
          color: atMin ? colors.gray300 : colors.gray700,
          cursor: atMin ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: atMin ? 'none' : shadows.xs,
          transition: transitions.fast,
        }}
      >
        <Minus style={{ width: 14, height: 14 }} />
      </button>
      <span style={{
        minWidth: 32, textAlign: 'center',
        fontWeight: typography.weights.black,
        fontSize: typography.sizes.xl,
        color: colors.gray900,
      }}>
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        style={{
          width: 34, height: 34, borderRadius: radii.full, border: 'none',
          background: colors.purple600, color: colors.white,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(109,40,217,0.30)',
          transition: transitions.fast,
        }}
      >
        <Plus style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}

/* ─── Shared hook for modal state ─────────────────────────────────────── */
function useModalState(product) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState(
    product?.has_variations && product.variations?.length > 0 ? product.variations[0] : null
  );

  const activePrice = product?.has_variations && selectedVariation
    ? selectedVariation.price
    : product?.price;

  const handleAdd = (onClose) => {
    const variationLabel = product.has_variations && selectedVariation ? selectedVariation.name : null;
    const itemNotes = variationLabel ? [variationLabel, notes].filter(Boolean).join(' — ') : notes;
    addItem({ ...product, price: activePrice }, quantity, itemNotes);
    setAdded(true);
    setTimeout(() => onClose(), 600);
  };

  return { quantity, setQuantity, notes, setNotes, added, liked, setLiked, selectedVariation, setSelectedVariation, activePrice, handleAdd };
}

/* ─── Stars row ───────────────────────────────────────────────────────── */
function Stars({ size = 12 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} style={{ width: size, height: size, fill: '#eab308', color: '#eab308' }} />
      ))}
      <span style={{ fontSize: typography.sizes.sm, color: colors.gray400, fontWeight: typography.weights.semibold, marginLeft: 4 }}>
        4.8 · 128 avaliações
      </span>
    </div>
  );
}

/* ─── Variations picker ───────────────────────────────────────────────── */
function VariationPicker({ variations, selected, onSelect, large = false }) {
  if (!variations?.length) return null;
  return (
    <div style={{ marginBottom: large ? 24 : 18 }}>
      <div style={{
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.bold,
        color: colors.gray500,
        marginBottom: large ? 10 : 8,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        Tamanho / Variação
      </div>
      <div style={{ display: 'flex', gap: large ? 10 : 8, flexWrap: 'wrap' }}>
        {variations.map((v, i) => {
          const sel = selected?.name === v.name;
          return (
            <button
              key={i}
              onClick={() => onSelect(v)}
              style={{
                padding: large ? '10px 20px' : '8px 16px',
                borderRadius: radii.full,
                border: `2px solid ${sel ? colors.purple600 : colors.gray200}`,
                background: sel ? colors.purple600 : colors.white,
                color: sel ? colors.white : colors.gray700,
                fontWeight: typography.weights.bold,
                fontSize: large ? typography.sizes.base : typography.sizes.sm,
                cursor: 'pointer',
                transition: transitions.fast,
                boxShadow: sel ? '0 4px 14px rgba(109,40,217,0.28)' : 'none',
              }}
            >
              {v.name}
              <span style={{ marginLeft: 8, opacity: 0.85, fontSize: typography.sizes.sm }}>
                R$ {Number(v.price).toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── MOBILE layout (bottom-sheet) ───────────────────────────────────── */
function MobileModal({ product, onClose }) {
  const { quantity, setQuantity, notes, setNotes, added, liked, setLiked, selectedVariation, setSelectedVariation, activePrice, handleAdd } = useModalState(product);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: zIndex.modal,
        background: colors.white,
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Drag handle */}
      <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: colors.gray200 }} />
      </div>

      {/* Image */}
      <div style={{ position: 'relative', width: '100%', height: 220, background: colors.gray100, flexShrink: 0 }}>
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div className="img-placeholder" style={{ width: '100%', height: '100%' }}><ImageOff style={{ width: 40, height: 40 }} /></div>}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.45)', color: colors.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backdropFilter: 'blur(8px)',
          }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>
        <button
          onClick={() => setLiked(l => !l)}
          style={{
            position: 'absolute', top: 12, right: 56,
            width: 36, height: 36, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.45)', color: liked ? '#ef4444' : colors.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backdropFilter: 'blur(8px)',
          }}
        >
          <Heart style={{ width: 16, height: 16, fill: liked ? '#ef4444' : 'transparent', transition: 'fill 0.2s' }} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
          <h2 style={{
            fontSize: typography.sizes.xl, fontWeight: typography.weights.black,
            color: colors.gray900, letterSpacing: '-0.03em', lineHeight: typography.lineHeights.tight, flex: 1,
          }}>
            {product.name}
          </h2>
          <div style={{ fontSize: typography.sizes.xl, fontWeight: typography.weights.black, color: colors.purple600, letterSpacing: '-0.03em', flexShrink: 0 }}>
            R$ {activePrice?.toFixed(2)}
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <Stars size={12} />
        </div>

        {product.description && (
          <p style={{ fontSize: typography.sizes.base, color: colors.gray500, lineHeight: typography.lineHeights.relaxed, marginBottom: 18 }}>
            {product.description}
          </p>
        )}

        <VariationPicker
          variations={product.variations}
          selected={selectedVariation}
          onSelect={setSelectedVariation}
        />

        <div className="divider" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <QuantityControl value={quantity} onChange={setQuantity} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: typography.sizes.xs, color: colors.gray400, fontWeight: typography.weights.semibold, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Subtotal
            </div>
            <div style={{ fontSize: 22, fontWeight: typography.weights.black, color: colors.gray900, letterSpacing: '-0.03em' }}>
              R$ {((activePrice || 0) * quantity).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: 20 }}>
          <label className="input-label">Pedidos Especiais</label>
          <textarea
            className="input-field"
            placeholder="Ex: sem cebola, molho extra..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            style={{ resize: 'none' }}
          />
        </div>

        <button
          className={`btn btn-lg ${added ? 'btn-success' : 'btn-primary'}`}
          onClick={() => handleAdd(onClose)}
          disabled={added}
          style={{ borderRadius: radii.full, fontWeight: typography.weights.extrabold }}
        >
          <ShoppingCart style={{ width: 18, height: 18 }} />
          {added ? '✓ Adicionado!' : `Adicionar · R$ ${((activePrice || 0) * quantity).toFixed(2)}`}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── DESKTOP layout (two-column, centered, sem cortes) ───────────────── */
function DesktopModal({ product, onClose }) {
  const { quantity, setQuantity, notes, setNotes, added, liked, setLiked, selectedVariation, setSelectedVariation, activePrice, handleAdd } = useModalState(product);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      onClick={e => e.stopPropagation()}
      style={{
        /* Posicionamento: inset garante margens iguais em todos os lados */
        position: 'fixed',
        top: 24, bottom: 24, left: 24, right: 24,
        margin: 'auto',
        /* Limita o tamanho máximo sem forçar dimensões fixas */
        maxWidth: 1100,
        maxHeight: 800,
        /* Flex para as duas colunas */
        display: 'flex',
        zIndex: zIndex.modal,
        background: colors.white,
        borderRadius: radii['2xl'],
        boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.10)',
        overflow: 'hidden',
      }}
    >
      {/* LEFT: Image column */}
      <div style={{ flex: '0 0 46%', position: 'relative', background: colors.gray100, minHeight: 0 }}>
        {product.image
          ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div className="img-placeholder" style={{ width: '100%', height: '100%' }}><ImageOff style={{ width: 64, height: 64 }} /></div>}

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />

        {/* Price pill */}
        <div style={{
          position: 'absolute', bottom: 24, left: 24,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderRadius: radii.full, padding: '10px 20px',
          fontWeight: typography.weights.black, fontSize: typography.sizes['2xl'],
          color: colors.purple700, letterSpacing: '-0.03em',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>
          R$ {activePrice?.toFixed(2)}
        </div>

        {/* Featured badge */}
        {product.featured && (
          <div style={{
            position: 'absolute', top: 20, left: 20,
            background: colors.purple600, color: colors.white,
            fontSize: typography.sizes.xs, fontWeight: typography.weights.extrabold,
            padding: '5px 14px', borderRadius: radii.full,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            boxShadow: '0 4px 12px rgba(109,40,217,0.4)',
          }}>
            ⭐ Popular
          </div>
        )}
      </div>

      {/* RIGHT: Details column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px 16px',
          borderBottom: `1px solid ${colors.gray100}`,
          flexShrink: 0,
        }}>
          <Stars size={14} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setLiked(l => !l)}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                border: `1.5px solid ${colors.gray200}`, background: colors.white,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: transitions.fast,
              }}
            >
              <Heart style={{ width: 17, height: 17, color: liked ? '#ef4444' : colors.gray400, fill: liked ? '#ef4444' : 'transparent', transition: 'all 0.2s' }} />
            </button>
            <button
              onClick={onClose}
              style={{
                width: 38, height: 38, borderRadius: '50%', border: 'none',
                background: colors.gray100, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: transitions.fast,
              }}
            >
              <X style={{ width: 17, height: 17, color: colors.gray600 }} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', minHeight: 0 }}>
          <h2 style={{
            fontSize: typography.sizes['3xl'],
            fontWeight: typography.weights.black,
            color: colors.gray900,
            letterSpacing: '-0.04em',
            lineHeight: typography.lineHeights.tight,
            marginBottom: 10,
          }}>
            {product.name}
          </h2>
          {product.description && (
            <p style={{ fontSize: typography.sizes.md, color: colors.gray500, lineHeight: typography.lineHeights.relaxed, marginBottom: 24 }}>
              {product.description}
            </p>
          )}

          <VariationPicker
            variations={product.variations}
            selected={selectedVariation}
            onSelect={setSelectedVariation}
            large
          />

          <div className="divider" />

          <div className="input-group">
            <label className="input-label">Pedidos Especiais</label>
            <textarea
              className="input-field"
              placeholder="Ex: sem cebola, molho extra..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              style={{ resize: 'none' }}
            />
          </div>

          <div style={{
            marginTop: 4, padding: '12px 16px',
            borderRadius: radii.md,
            background: colors.purple50,
            border: `1.5px dashed ${colors.purple200}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Sparkles style={{ width: 16, height: 16, color: colors.purple400, flexShrink: 0 }} />
            <span style={{ fontSize: typography.sizes.sm, color: colors.purple500, fontWeight: typography.weights.semibold }}>
              Opções de personalização em breve
            </span>
          </div>
        </div>

        {/* Fixed bottom bar */}
        <div style={{
          padding: '18px 28px',
          borderTop: `1px solid ${colors.gray100}`,
          background: colors.gray50,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: typography.sizes.xs, color: colors.gray400, fontWeight: typography.weights.semibold, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                Quantidade
              </div>
              <QuantityControl value={quantity} onChange={setQuantity} />
            </div>
            <button
              className={`btn ${added ? 'btn-success' : 'btn-primary'}`}
              onClick={() => handleAdd(onClose)}
              disabled={added}
              style={{ borderRadius: radii.full, fontWeight: typography.weights.extrabold, fontSize: typography.sizes.md, padding: '14px 28px', flex: 1, maxWidth: 280 }}
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

/* ─── Root export ─────────────────────────────────────────────────────── */
export default function ProductModal({ product, onClose }) {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              zIndex: zIndex.overlay,
            }}
          />
          {isDesktop
            ? <DesktopModal product={product} onClose={onClose} />
            : <MobileModal product={product} onClose={onClose} />}
        </>
      )}
    </AnimatePresence>
  );
}