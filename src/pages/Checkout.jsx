import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, CreditCard, Banknote, QrCode, Truck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCart } from '../context/CartContext';
import RadioGroup from '../components/shared/RadioGroup';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [orderType, setOrderType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [changeAmount, setChangeAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState({
    street: '', number: '', complement: '',
    neighborhood: '', city: '', reference: ''
  });

  const deliveryFee = orderType === 'delivery' ? 5.00 : 0;
  const grandTotal = totalPrice + deliveryFee;

  const canSubmit = customerName && customerPhone && orderType && paymentMethod
    && (orderType !== 'delivery' || (address.street && address.number && address.neighborhood && address.city))
    && (paymentMethod !== 'cash_change' || changeAmount);

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase();

    const orderData = {
      order_number: orderNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      order_type: orderType,
      payment_method: paymentMethod,
      change_amount: paymentMethod === 'cash_change' ? parseFloat(changeAmount) : 0,
      total_price: grandTotal,
      delivery_fee: deliveryFee,
      status: 'new',
      notes,
      items,
      kitchen_printed: false,
      delivery_printed: false,
    };

    if (orderType === 'delivery') {
      orderData.address_street = address.street;
      orderData.address_number = address.number;
      orderData.address_complement = address.complement;
      orderData.address_neighborhood = address.neighborhood;
      orderData.address_city = address.city;
      orderData.address_reference = address.reference;
    }

    const created = await base44.entities.Order.create(orderData);
    clearCart();
    navigate(`/confirmation/${created.id}`);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingBottom: 24 }}>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/cart')}>
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 className="page-title">Checkout</h1>
            <p className="page-subtitle">Complete your order</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <h3 className="section-title">Your Info</h3>
            <div className="input-group">
              <label className="input-label">Name *</label>
              <input
                className="input-field"
                placeholder="Your name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Phone *</label>
              <input
                className="input-field"
                placeholder="(00) 00000-0000"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Order Type */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <h3 className="section-title">Order Type</h3>
            <RadioGroup
              options={[
                { value: 'delivery', label: 'Delivery', description: `R$ ${deliveryFee.toFixed(2)} fee` },
                { value: 'pickup', label: 'Pickup', description: 'Pick up at the restaurant' },
              ]}
              value={orderType}
              onChange={setOrderType}
            />
          </div>
        </div>

        {/* Address (delivery only) */}
        {orderType === 'delivery' && (
          <div className="card animate-fade-in" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin style={{ width: 18, height: 18, color: 'var(--purple-600)' }} />
                Delivery Address
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                <div className="input-group">
                  <label className="input-label">Street *</label>
                  <input className="input-field" placeholder="Street name"
                    value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Number *</label>
                  <input className="input-field" placeholder="123"
                    value={address.number} onChange={e => setAddress({ ...address, number: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Complement</label>
                <input className="input-field" placeholder="Apt, suite, etc."
                  value={address.complement} onChange={e => setAddress({ ...address, complement: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Neighborhood *</label>
                <input className="input-field" placeholder="Neighborhood"
                  value={address.neighborhood} onChange={e => setAddress({ ...address, neighborhood: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">City *</label>
                <input className="input-field" placeholder="City"
                  value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Reference Point</label>
                <input className="input-field" placeholder="Near the park, etc."
                  value={address.reference} onChange={e => setAddress({ ...address, reference: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Payment */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <h3 className="section-title">Payment Method</h3>
            <RadioGroup
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'cash_change', label: 'Cash (need change)' },
                { value: 'pix', label: 'PIX' },
                { value: 'debit', label: 'Debit Card' },
                { value: 'credit', label: 'Credit Card' },
              ]}
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
            {paymentMethod === 'cash_change' && (
              <div className="input-group animate-fade-in" style={{ marginTop: 12 }}>
                <label className="input-label">Change for how much? *</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="e.g. 50.00"
                  value={changeAmount}
                  onChange={e => setChangeAmount(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <h3 className="section-title">Notes</h3>
            <textarea
              className="input-field"
              placeholder="Any special instructions for the restaurant?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3 className="section-title">Order Summary</h3>
            {items.map((item, i) => (
              <div className="summary-row" key={i}>
                <span style={{ color: 'var(--gray-600)' }}>{item.quantity}x {item.product_name}</span>
                <span>R$ {item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            {orderType === 'delivery' && (
              <div className="summary-row">
                <span style={{ color: 'var(--gray-500)' }}>Delivery Fee</span>
                <span>R$ {deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span style={{ color: 'var(--purple-600)' }}>R$ {grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}