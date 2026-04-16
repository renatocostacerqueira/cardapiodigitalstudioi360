import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, Store, Banknote, CreditCard, QrCode, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useCart } from '../context/CartContext';

function SectionCard({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="card-body">
        <h3 className="section-title">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function TypeOption({ value, current, onChange, icon: Icon, label, sublabel }) {
  const selected = current === value;
  return (
    <div
      onClick={() => onChange(value)}
      role="radio"
      aria-checked={selected}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
        borderRadius: 'var(--r-md)', cursor: 'pointer',
        border: `1.5px solid ${selected ? 'var(--purple-400)' : 'var(--gray-150)'}`,
        background: selected ? 'var(--purple-50)' : '#fff',
        transition: 'border-color 0.15s, background 0.15s',
        marginBottom: 10,
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 'var(--r-sm)', flexShrink: 0,
        background: selected ? 'var(--purple-100)' : 'var(--gray-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s',
      }}>
        <Icon style={{ width: 20, height: 20, color: selected ? 'var(--purple-600)' : 'var(--gray-400)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 1 }}>{sublabel}</div>}
      </div>
      <div style={{
        width: 20, height: 20, borderRadius: 'var(--r-full)',
        border: `2px solid ${selected ? 'var(--purple-600)' : 'var(--gray-300)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && <div style={{ width: 10, height: 10, borderRadius: 'var(--r-full)', background: 'var(--purple-600)' }} />}
      </div>
    </div>
  );
}

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'cash_change', label: 'Cash (need change)', icon: Banknote },
  { value: 'pix', label: 'PIX', icon: QrCode },
  { value: 'debit', label: 'Debit Card', icon: CreditCard },
  { value: 'credit', label: 'Credit Card', icon: CreditCard },
];

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

  if (items.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingBottom: 32 }}>
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/cart')} aria-label="Go back">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 className="page-title">Checkout</h1>
            <p className="page-subtitle">Review and confirm your order</p>
          </div>
        </div>

        {/* Customer Info */}
        <SectionCard title="Your Information">
          <div className="input-group">
            <label className="input-label" htmlFor="cname">Full Name</label>
            <input id="cname" className="input-field" placeholder="John Doe"
              value={customerName} onChange={e => setCustomerName(e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="cphone">Phone Number</label>
            <input id="cphone" className="input-field" placeholder="(00) 00000-0000"
              value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
          </div>
        </SectionCard>

        {/* Order Type */}
        <SectionCard title="How would you like to receive it?">
          <TypeOption value="delivery" current={orderType} onChange={setOrderType}
            icon={Truck} label="Delivery" sublabel={`+ R$ ${deliveryFee.toFixed(2)} delivery fee`} />
          <TypeOption value="pickup" current={orderType} onChange={setOrderType}
            icon={Store} label="Pickup" sublabel="Pick up at the restaurant" />
        </SectionCard>

        {/* Address */}
        {orderType === 'delivery' && (
          <div className="card animate-fade-in" style={{ marginBottom: 14 }}>
            <div className="card-body">
              <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin style={{ width: 17, height: 17, color: 'var(--purple-500)' }} />
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
                <input className="input-field" placeholder="Apt, floor, suite..."
                  value={address.complement} onChange={e => setAddress({ ...address, complement: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Reference Point</label>
                <input className="input-field" placeholder="Near the park, beside the pharmacy..."
                  value={address.reference} onChange={e => setAddress({ ...address, reference: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {/* Payment */}
        <SectionCard title="Payment Method">
          {PAYMENT_OPTIONS.map(opt => (
            <TypeOption
              key={opt.value}
              value={opt.value}
              current={paymentMethod}
              onChange={setPaymentMethod}
              icon={opt.icon}
              label={opt.label}
            />
          ))}
          {paymentMethod === 'cash_change' && (
            <div className="input-group animate-fade-in" style={{ marginTop: 6, marginBottom: 0 }}>
              <label className="input-label" htmlFor="change">Change for how much? *</label>
              <input id="change" className="input-field" type="number" placeholder="e.g. 50.00"
                value={changeAmount} onChange={e => setChangeAmount(e.target.value)} />
            </div>
          )}
        </SectionCard>

        {/* Notes */}
        <SectionCard title="Order Notes">
          <textarea
            className="input-field"
            placeholder="Any special instructions for the restaurant? (e.g. ring the bell, leave at door...)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            style={{ marginBottom: 0 }}
          />
        </SectionCard>

        {/* Summary */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3 className="section-title">Order Summary</h3>
            {items.map((item, i) => (
              <div className="summary-row" key={i}>
                <span style={{ color: 'var(--gray-500)' }}>{item.quantity}× {item.product_name}</span>
                <span style={{ fontWeight: 600 }}>R$ {item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            {orderType === 'delivery' && (
              <div className="summary-row">
                <span style={{ color: 'var(--gray-400)' }}>Delivery Fee</span>
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
          style={{ borderRadius: 'var(--r-full)', fontWeight: 800, fontSize: 16 }}
        >
          {submitting ? 'Placing Order…' : 'Place Order'}
          {!submitting && <ChevronRight style={{ width: 18, height: 18 }} />}
        </button>

        {!canSubmit && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 10 }}>
            Please fill all required fields to continue
          </p>
        )}
      </div>
    </div>
  );
}