import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';

export default function FloatingCartButton() {
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            padding: '12px 20px 24px',
            background: 'linear-gradient(to top, rgba(255,255,255,1) 70%, rgba(255,255,255,0))',
            pointerEvents: 'none',
          }}
        >
          {/* Pulsing ring */}
          <motion.button
            onClick={() => navigate('/cart')}
            whileTap={{ scale: 0.97 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: 'linear-gradient(135deg, #5b21b6, #6d28d9)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--r-2xl)',
              padding: '16px 20px',
              cursor: 'pointer',
              boxShadow: '0 8px 36px rgba(109,40,217,0.50), 0 2px 8px rgba(0,0,0,0.12)',
              fontFamily: 'inherit',
              pointerEvents: 'auto',
            }}
          >
            {/* Pulse ring animation */}
            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: -4,
                borderRadius: 28,
                border: '3px solid #7c3aed',
                pointerEvents: 'none',
              }}
            />

            {/* Left: badge + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <motion.div
                key={totalItems}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
                style={{
                  width: 36, height: 36, borderRadius: 'var(--r-full)',
                  background: 'rgba(255,255,255,0.22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 900, flexShrink: 0,
                }}
              >
                {totalItems}
              </motion.div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShoppingCart style={{ width: 16, height: 16, opacity: 0.9 }} />
                  <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>Ver Carrinho</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.70)', fontWeight: 600, marginTop: 1 }}>
                  Toque para concluir seu pedido
                </div>
              </div>
            </div>

            {/* Right: price + arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: '-0.02em' }}>
                R$ {totalPrice.toFixed(2)}
              </span>
              <ChevronRight style={{ width: 20, height: 20, opacity: 0.8 }} />
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}