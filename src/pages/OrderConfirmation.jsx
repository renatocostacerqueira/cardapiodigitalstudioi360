import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Home, MapPin, CreditCard, Truck, Store, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import OrderTracker from '../components/order/OrderTracker';

const PAYMENT_LABELS = {
  cash: 'Cash', cash_change: 'Cash (with change)', pix: 'PIX', debit: 'Debit Card', credit: 'Credit Card',
};

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    base44.entities.Order.filter({ id }).then(orders => {
      setOrder(orders[0]);
      setLoading(false);
    });
  }, [id]);

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = base44.entities.Order.subscribe((event) => {
      if (event.id === id && event.type !== 'delete') {
        setOrder(event.data);
      }
    });
    return unsubscribe;
  }, [id]);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="loading-container" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
      </div>
    );
  }

  if (!order) return null;

  const isOutForDelivery = order.status === 'out_for_delivery';
  const isDelivered = ['delivered', 'picked_up'].includes(order.status);

  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingBottom: 32 }}>

        {/* Header */}
        <div className="animate-slide-up" style={{ textAlign: 'center', paddingTop: 36, paddingBottom: 8 }}>
          <div className="confirmation-icon">
            <CheckCircle />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.03em', marginBottom: 6 }}>
            {isDelivered ? 'Enjoy your meal! 🎉' : 'Order Confirmed!'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 14 }}>
            {isDelivered ? 'Your order has been completed' : 'Your order has been received and is being processed'}
          </p>
          <div style={{
            display: 'inline-block', fontSize: 18, fontWeight: 800, color: 'var(--purple-600)',
            background: 'var(--purple-50)', padding: '8px 20px',
            borderRadius: 'var(--r-full)', letterSpacing: '0.04em', marginBottom: 14,
          }}>
            {order.order_number}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* On the way banner */}
        {isOutForDelivery && (
          <div style={{
            margin: '16px 0', padding: '16px 20px',
            background: 'linear-gradient(135deg, var(--purple-600), var(--purple-800))',
            borderRadius: 'var(--r-xl)', color: '#fff', textAlign: 'center',
            boxShadow: '0 8px 24px rgba(109,40,217,0.35)',
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🛵</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>Your order is on the way!</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              Our driver is heading to your address — estimated arrival ~{order.avg_prep_time || 30} min
            </div>
          </div>
        )}

        {/* Live Tracker */}
        {!isDelivered && order.status !== 'cancelled' && (
          <div className="card" style={{ marginTop: 20, marginBottom: 14 }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 className="section-title" style={{ margin: 0 }}>Live Tracking</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--purple-500)', fontWeight: 700 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-500)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                  Live
                </div>
              </div>
              <OrderTracker status={order.status} orderType={order.order_type} />
            </div>
          </div>
        )}

        {/* Type + ETA */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--r-md)',
                background: order.order_type === 'delivery' ? 'var(--purple-50)' : 'var(--green-50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {order.order_type === 'delivery'
                  ? <Truck style={{ width: 22, height: 22, color: 'var(--purple-600)' }} />
                  : <Store style={{ width: 22, height: 22, color: 'var(--green-600)' }} />
                }
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
                  {order.order_type === 'delivery' ? 'Delivery Order' : 'Pickup Order'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
                  {order.order_type === 'delivery' ? "We'll deliver to your address" : 'Come pick up at the restaurant'}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-400)', fontSize: 12 }}>
                  <Clock style={{ width: 12, height: 12 }} />
                  ~30 min
                </div>
              </div>
            </div>

            {order.order_type === 'delivery' && order.address_street && (
              <>
                <div className="divider" />
                <div className="info-row" style={{ paddingTop: 0 }}>
                  <MapPin style={{ width: 16, height: 16, color: 'var(--gray-300)' }} />
                  <div>
                    <div className="info-label">Delivery Address</div>
                    <div className="info-value">
                      {order.address_street}, {order.address_number}
                      {order.address_complement && ` — ${order.address_complement}`}
                      <br />{order.address_neighborhood}, {order.address_city}
                      {order.address_reference && (
                        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>📍 {order.address_reference}</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="card-body">
            <div className="info-row" style={{ paddingTop: 0, paddingBottom: 0 }}>
              <CreditCard style={{ width: 16, height: 16, color: 'var(--gray-300)' }} />
              <div style={{ flex: 1 }}>
                <div className="info-label">Payment Method</div>
                <div className="info-value">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</div>
              </div>
              {order.payment_method === 'cash_change' && order.change_amount > 0 && (
                <div style={{ background: 'var(--orange-50)', border: '1px solid #fed7aa', borderRadius: 'var(--r-sm)', padding: '6px 12px', fontSize: 13, color: '#c2410c', fontWeight: 700 }}>
                  Change for R$ {order.change_amount.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <h3 className="section-title">Your Order</h3>
            {order.items?.map((item, i) => (
              <div key={i} style={{ paddingBottom: i < order.items.length - 1 ? 12 : 0, marginBottom: i < order.items.length - 1 ? 12 : 0, borderBottom: i < order.items.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 14 }}>{item.quantity}× {item.product_name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--gray-700)', fontSize: 14 }}>R$ {item.subtotal?.toFixed(2)}</span>
                </div>
                {item.notes && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 5 }}>
                    <MessageSquare style={{ width: 12, height: 12, color: 'var(--purple-400)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>{item.notes}</span>
                  </div>
                )}
              </div>
            ))}
            <div className="divider" />
            {order.delivery_fee > 0 && (
              <div className="summary-row">
                <span style={{ color: 'var(--gray-400)' }}>Delivery Fee</span>
                <span>R$ {order.delivery_fee?.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span style={{ color: 'var(--purple-600)' }}>R$ {order.total_price?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" onClick={() => navigate('/')} style={{ borderRadius: 'var(--r-full)', fontWeight: 800 }}>
          <Home style={{ width: 18, height: 18 }} /> Back to Menu
        </button>
        <button className="btn btn-outline btn-lg" onClick={() => navigate('/orders')} style={{ marginTop: 10, borderRadius: 'var(--r-full)' }}>
          View My Orders
        </button>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}