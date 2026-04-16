import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, ImageOff, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import BottomNav from '../components/menu/BottomNav';
import UpsellSuggestions from '../components/cart/UpsellSuggestions';

function CartItemCard({ item, index, updateQuantity, removeItem }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--r-xl)',
      boxShadow: 'var(--shadow-sm)',
      padding: 16,
      display: 'flex',
      gap: 14,
      alignItems: 'center',
    }}>
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
          <div style={{ fontSize: 11, color: 'var(--gray-400)', fontStyle: 'italic', marginBottom: 6 }}>
            {item.notes}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          {/* Qty controls */}
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
              aria-label="Decrease quantity"
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
              aria-label="Increase quantity"
            >+</button>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--purple-600)', letterSpacing: '-0.02em' }}>
            R$ {item.subtotal.toFixed(2)}
          </div>
        </div>
      </div>

      <button
        onClick={() => removeItem(index)}
        style={{
          width: 34, height: 34, borderRadius: 'var(--r-sm)',
          background: 'var(--red-50)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 0.15s',
        }}
        aria-label={`Remove ${item.product_name}`}
      >
        <Trash2 style={{ width: 15, height: 15, color: 'var(--red-400)' }} />
      </button>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const cartItemIds = items.map(i => i.product_id);

  return (
    <div className="app-shell">
      <div className="page-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/')} aria-label="Go back">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 className="page-title">Your Cart</h1>
            <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart />
            <h3>Your cart is empty</h3>
            <p>Browse the menu and add something delicious</p>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/')}>
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {items.map((item, index) => (
                <CartItemCard
                  key={index}
                  item={item}
                  index={index}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ))}
            </div>

            {/* Upsell suggestions */}
            <UpsellSuggestions cartItemIds={cartItemIds} />

            {/* Order Summary */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-body">
                <h3 className="section-title">Order Summary</h3>
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

            {/* Checkout button */}
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/checkout')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Proceed to Checkout
              <ChevronRight style={{ width: 18, height: 18 }} />
            </button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}