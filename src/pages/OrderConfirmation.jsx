import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Home, MapPin, CreditCard, Truck, Store } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';

const PAYMENT_LABELS = {
  cash: 'Cash',
  cash_change: 'Cash (with change)',
  pix: 'PIX',
  debit: 'Debit Card',
  credit: 'Credit Card',
};

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ id });
      return orders[0];
    },
  });

  if (isLoading) {
    return (
      <div className="app-shell">
        <div className="loading-container" style={{ minHeight: '100vh' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="app-shell">
      <div className="page-container" style={{ paddingBottom: 24, textAlign: 'center' }}>
        <div className="animate-slide-up" style={{ paddingTop: 32 }}>
          <div className="confirmation-icon">
            <CheckCircle />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
            Order Placed!
          </h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 8 }}>
            Your order has been received
          </p>
          <div style={{
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--purple-600)',
            marginBottom: 24,
            letterSpacing: '0.5px'
          }}>
            {order.order_number}
          </div>

          <StatusBadge status={order.status} />
        </div>

        <div className="card" style={{ marginTop: 24, textAlign: 'left' }}>
          <div className="card-body">
            <h3 className="section-title">Order Details</h3>

            <div className="info-row">
              {order.order_type === 'delivery'
                ? <Truck style={{ width: 18, height: 18, color: 'var(--gray-400)' }} />
                : <Store style={{ width: 18, height: 18, color: 'var(--gray-400)' }} />
              }
              <div>
                <div className="info-label">Order Type</div>
                <div className="info-value">
                  {order.order_type === 'delivery' ? 'Delivery' : 'Pickup'}
                </div>
              </div>
            </div>

            {order.order_type === 'delivery' && order.address_street && (
              <div className="info-row">
                <MapPin style={{ width: 18, height: 18, color: 'var(--gray-400)' }} />
                <div>
                  <div className="info-label">Delivery Address</div>
                  <div className="info-value">
                    {order.address_street}, {order.address_number}
                    {order.address_complement && ` - ${order.address_complement}`}
                    <br />{order.address_neighborhood}, {order.address_city}
                  </div>
                </div>
              </div>
            )}

            <div className="info-row">
              <CreditCard style={{ width: 18, height: 18, color: 'var(--gray-400)' }} />
              <div>
                <div className="info-label">Payment</div>
                <div className="info-value">
                  {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                  {order.payment_method === 'cash_change' && order.change_amount > 0 &&
                    ` (change for R$ ${order.change_amount.toFixed(2)})`
                  }
                </div>
              </div>
            </div>

            <div className="divider" />

            <h3 className="section-title" style={{ fontSize: 16 }}>Items</h3>
            {order.items?.map((item, i) => (
              <div className="summary-row" key={i}>
                <span style={{ color: 'var(--gray-600)' }}>{item.quantity}x {item.product_name}</span>
                <span style={{ fontWeight: 600 }}>R$ {item.subtotal?.toFixed(2)}</span>
              </div>
            ))}

            {order.delivery_fee > 0 && (
              <div className="summary-row">
                <span style={{ color: 'var(--gray-500)' }}>Delivery Fee</span>
                <span>R$ {order.delivery_fee?.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row total">
              <span>Total</span>
              <span style={{ color: 'var(--purple-600)' }}>R$ {order.total_price?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg"
          style={{ marginTop: 24 }}
          onClick={() => navigate('/')}
        >
          <Home style={{ width: 18, height: 18 }} />
          Back to Menu
        </button>
      </div>
    </div>
  );
}