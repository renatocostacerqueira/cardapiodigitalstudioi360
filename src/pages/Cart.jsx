import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, ImageOff, ChevronRight, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import UpsellSuggestions from '../components/cart/UpsellSuggestions';
import EditItemModal from '../components/cart/EditItemModal';

function CartItemCard({ item, index, updateQuantity, removeItem, onEdit }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      style={{
        background: '#fff',
        borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-sm)',
        padding: 16,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {item.product_image ? (
        <img
          src={item.product_image}
          alt={item.product_name}
          style={{ width: 68, height: 68, borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div className="img-placeholder" style={{ width: 68, height: 68, borderRadius: 'var(--r-md)', flexShrink: 0 }}>
          <ImageOff style={{ width: 22, height: 22 }} />
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 2, letterSpacing: '-0.01em' }}>
          {item.product_name}
        </div>
        {item.notes && (
          <div style={{ fontSize: 11, color: 'var(--purple-400)', fontStyle: 'italic', marginBottom: 6, background: 'var(--purple-50)', padding: '3px 8px', borderRadius: 6, display: 'inline-block' }}>
            {item.notes}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => updateQuantity(index, item.quantity - 1)}
              style={{
                width: 30, height: 30, borderRadius: 'var(--r-full)',
                border: '1.5px solid var(--gray-200)', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 16, color: 'var(--gray-600)',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              aria-label="Diminuir quantidade"
            >−</button>
            <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: 'center', color: 'var(--gray-900)' }}>
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(index, item.quantity + 1)}
              style={{
                width: 30, height: 30, borderRadius: 'var(--r-full)',
                border: '1.5px solid var(--purple-300)', background: 'var(--purple-50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 16, color: 'var(--purple-600)',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              aria-label="Aumentar quantidade"
            >+</button>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--purple-600)', letterSpacing: '-0.02em' }}>
            R$ {item.subtotal.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onEdit(index)}
          style={{
            width: 34, height: 34, borderRadius: 'var(--r-sm)',
            background: 'var(--purple-50)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          aria-label="Editar item"
          title="Editar"
        >
          <Pencil style={{ width: 14, height: 14, color: 'var(--purple-500)' }} />
        </button>
        <button
          onClick={() => removeItem(index)}
          style={{
            width: 34, height: 34, borderRadius: 'var(--r-sm)',
            background: 'var(--red-50)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          aria-label={`Remover ${item.product_name}`}
          title="Remover"
        >
          <Trash2 style={{ width: 14, height: 14, color: 'var(--red-400)' }} />
        </button>
      </div>
    </motion.div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, updateItem, removeItem, totalPrice } = useCart();
  const [editingIndex, setEditingIndex] = useState(null);
  const cartItemIds = items.map(i => i.product_id);

  return (
    <div className="app-shell">
      <div className="page-container">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <button className="back-btn" onClick={() => navigate('/')} aria-label="Voltar">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 className="page-title">Seu Carrinho</h1>
            <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </motion.div>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
            <ShoppingCart />
            <h3>Seu carrinho está vazio</h3>
            <p>Explore o cardápio e adicione algo delicioso</p>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/')}>
              Ver Cardápio
            </button>
          </motion.div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <AnimatePresence>
                {items.map((item, index) => (
                  <CartItemCard
                    key={`${item.product_id}-${index}`}
                    item={item}
                    index={index}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                    onEdit={setEditingIndex}
                  />
                ))}
              </AnimatePresence>
            </div>

            <UpsellSuggestions cartItemIds={cartItemIds} />

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-body">
                  <h3 className="section-title">Resumo do Pedido</h3>
                  {items.map((item, i) => (
                    <div className="summary-row" key={i}>
                      <span style={{ color: 'var(--gray-500)' }}>{item.quantity}× {item.product_name}</span>
                      <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>R$ {item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="summary-row total">
                    <span>Total</span>
                    <span style={{ color: 'var(--purple-600)' }}>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/checkout')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 'var(--r-full)', fontWeight: 800 }}
            >
              Finalizar Pedido
              <ChevronRight style={{ width: 18, height: 18 }} />
            </motion.button>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingIndex !== null && items[editingIndex] && (
        <EditItemModal
          item={items[editingIndex]}
          index={editingIndex}
          onSave={updateItem}
          onClose={() => setEditingIndex(null)}
        />
      )}
    </div>
  );
}