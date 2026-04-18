import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';

export default function FloatingCartButton() {
  const { totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.button
          initial={{ y: 80, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          onClick={() => navigate('/cart')}
          style={{
            position: 'fixed',
            bottom: 88,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(135deg, var(--purple-600), var(--purple-700))',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--r-full)',
            padding: '14px 24px',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(109,40,217,0.45)',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            minWidth: 220,
            justifyContent: 'space-between',
          }}
        >
          {/* Badge */}
          <motion.div
            key={totalItems}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
            style={{
              width: 30, height: 30, borderRadius: 'var(--r-full)',
              background: 'rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 900,
            }}
          >
            {totalItems}
          </motion.div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart style={{ width: 18, height: 18 }} />
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>Ver Carrinho</span>
          </div>

          <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: '-0.01em' }}>
            R$ {totalPrice.toFixed(2)}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}