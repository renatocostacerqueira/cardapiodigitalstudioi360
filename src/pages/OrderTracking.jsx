import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Truck, Store, Clock, MapPin, CreditCard, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from '../components/shared/StatusBadge';
import OrderTracker from '../components/order/OrderTracker';
import LiveTrackingMap from '../components/delivery/LiveTrackingMap';
import SendWhatsAppButton from '../components/shared/SendWhatsAppButton';

const PAYMENT_LABELS = {
  cash: 'Dinheiro', cash_change: 'Dinheiro (com troco)', pix: 'PIX', debit: 'Cartão de Débito', credit: 'Cartão de Crédito',
};

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    base44.entities.Order.filter({ id }).then(orders => {
      setOrder(orders[0]);
      setLoading(false);
    });
  }, [id]);

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
    <div className="app-shell" style={{ background: 'var(--gray-50)' }}>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/')} aria-label="Voltar">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 className="page-title">Acompanhe seu Pedido</h1>
            <p className="page-subtitle">{order.order_number}</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Live indicator */}
        {!isDelivered && order.status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 'var(--r-full)', padding: '8px 16px',
              marginBottom: 16, width: 'fit-content',
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--green-500)',
              display: 'inline-block', animation: 'pulse 1.5s infinite',
            }} />
            <span style={{ fontSize: 13, color: 'var(--green-600)', fontWeight: 700 }}>Acompanhamento ao vivo</span>
          </motion.div>
        )}

        {/* Live Map */}
        {isOutForDelivery && order.order_type === 'delivery' && order.address_street && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 14 }}>
            <div className="card">
              <div className="card-body">
                <h3 className="section-title" style={{ marginBottom: 12 }}>🗺️ Rastreamento em Tempo Real</h3>
                <LiveTrackingMap order={order} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Status tracker */}
        {order.status !== 'cancelled' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-body">
                <h3 className="section-title" style={{ marginBottom: 16 }}>Status do Pedido</h3>
                <OrderTracker status={order.status} orderType={order.order_type} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Type + address */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-md)', flexShrink: 0,
                  background: order.order_type === 'delivery' ? 'var(--purple-50)' : 'var(--green-50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {order.order_type === 'delivery'
                    ? <Truck style={{ width: 20, height: 20, color: 'var(--purple-600)' }} />
                    : <Store style={{ width: 20, height: 20, color: 'var(--green-600)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: 15 }}>
                    {order.order_type === 'delivery' ? 'Entrega' : 'Retirada no Restaurante'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock style={{ width: 12, height: 12 }} /> ~30 min de espera
                  </div>
                </div>
              </div>
              {order.order_type === 'delivery' && order.address_street && (
                <>
                  <div className="divider" />
                  <div className="info-row" style={{ paddingTop: 0 }}>
                    <MapPin style={{ width: 15, height: 15, color: 'var(--gray-300)' }} />
                    <div>
                      <div className="info-label">Endereço de Entrega</div>
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
        </motion.div>

        {/* Payment */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-body">
              <div className="info-row" style={{ paddingTop: 0, paddingBottom: 0 }}>
                <CreditCard style={{ width: 15, height: 15, color: 'var(--gray-300)' }} />
                <div style={{ flex: 1 }}>
                  <div className="info-label">Forma de Pagamento</div>
                  <div className="info-value">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</div>
                </div>
                {order.payment_method === 'cash_change' && order.change_amount > 0 && (
                  <div style={{ background: 'var(--orange-50)', border: '1px solid #fed7aa', borderRadius: 'var(--r-sm)', padding: '6px 12px', fontSize: 13, color: '#c2410c', fontWeight: 700, textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#9a3412', marginBottom: 2 }}>Pagará com</div>
                    R$ {Number(order.change_amount).toFixed(2)}
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#9a3412', marginTop: 4, marginBottom: 2 }}>Você receberá de troco</div>
                    R$ {(order.change_amount - order.total_price).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Items */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <h3 className="section-title">Itens do Pedido</h3>
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
                  <span style={{ color: 'var(--gray-400)' }}>Taxa de Entrega</span>
                  <span>R$ {order.delivery_fee?.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span style={{ color: 'var(--purple-600)' }}>R$ {order.total_price?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SendWhatsAppButton
            orderId={order.id}
            orderNumber={order.order_number}
            customerName={order.customer_name}
          />
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/')} style={{ borderRadius: 'var(--r-full)' }}>
            Voltar ao Cardápio
          </button>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}