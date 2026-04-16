import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, ImageOff } from 'lucide-react';
import { useCart } from '../context/CartContext';
import QuantitySelector from '../components/menu/QuantitySelector';
import BottomNav from '../components/menu/BottomNav';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  return (
    <div className="app-shell">
      <div className="page-container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/')}>
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
            <p>Add some delicious items from the menu</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={() => navigate('/')}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-body">
                {items.map((item, index) => (
                  <div key={index} className="cart-item">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="cart-item-image" />
                    ) : (
                      <div className="cart-item-image img-placeholder">
                        <ImageOff style={{ width: 20, height: 20 }} />
                      </div>
                    )}
                    <div className="cart-item-info">
                      <div className="cart-item-name">{item.product_name}</div>
                      <div className="cart-item-price">R$ {item.subtotal.toFixed(2)}</div>
                      {item.notes && <div className="cart-item-note">{item.notes}</div>}
                      <div style={{ marginTop: 8 }}>
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(q) => updateQuantity(index, q)}
                          min={0}
                        />
                      </div>
                    </div>
                    <button
                      className="btn-icon"
                      style={{
                        border: 'none',
                        background: 'var(--red-50)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        flexShrink: 0
                      }}
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 style={{ width: 16, height: 16, color: 'var(--red-500)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-body">
                <div className="summary-row">
                  <span style={{ color: 'var(--gray-500)' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span style={{ color: 'var(--purple-600)' }}>R$ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}