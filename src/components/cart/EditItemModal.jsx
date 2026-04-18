import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus } from 'lucide-react';

export default function EditItemModal({ item, index, onSave, onClose }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [notes, setNotes] = useState(item.notes || '');

  const handleSave = () => {
    onSave(index, { quantity, notes });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: '24px 24px 0 0',
            padding: '24px 20px 40px', width: '100%', maxWidth: 520,
          }}
        >
          {/* Handle */}
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--gray-200)', margin: '0 auto 20px' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
              Editar Item
            </h3>
            <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X style={{ width: 16, height: 16, color: 'var(--gray-500)' }} />
            </button>
          </div>

          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 16 }}>
            {item.product_name}
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
              Quantidade
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{
                  width: 40, height: 40, borderRadius: 'var(--r-full)',
                  border: '1.5px solid var(--gray-200)', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--gray-600)',
                }}
              >
                <Minus style={{ width: 16, height: 16 }} />
              </button>
              <span style={{ fontSize: 20, fontWeight: 800, minWidth: 32, textAlign: 'center', color: 'var(--gray-900)' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                style={{
                  width: 40, height: 40, borderRadius: 'var(--r-full)',
                  border: '1.5px solid var(--purple-300)', background: 'var(--purple-50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--purple-600)',
                }}
              >
                <Plus style={{ width: 16, height: 16 }} />
              </button>
              <span style={{ marginLeft: 8, fontSize: 16, fontWeight: 800, color: 'var(--purple-600)' }}>
                R$ {(quantity * item.unit_price).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 8 }}>
              Observações (opcional)
            </label>
            <textarea
              className="input-field"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: sem cebola, molho extra, bem passado..."
              rows={3}
              style={{ marginBottom: 0, resize: 'none' }}
            />
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleSave}
            style={{ borderRadius: 'var(--r-full)', fontWeight: 800 }}
          >
            Salvar Alterações
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}