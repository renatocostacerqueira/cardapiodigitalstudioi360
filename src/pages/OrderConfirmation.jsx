import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Home, Navigation, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from '../components/shared/StatusBadge';

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const isDelivered = ['delivered', 'picked_up'].includes(order.status);

  return (
    <div className="app-shell" style={{ background: '#fff' }}>
      <div className="page-container" style={{ paddingBottom: 40 }}>

        {/* Success Icon + Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{ textAlign: 'center', paddingTop: 48, paddingBottom: 8 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
            className="confirmation-icon"
          >
            <CheckCircle style={{ width: 44, height: 44 }} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ fontSize: 28, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.03em', marginBottom: 8 }}
          >
            {isDelivered ? 'Bom apetite! 🎉' : 'Pedido Confirmado!'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 20 }}
          >
            {isDelivered ? 'Seu pedido foi concluído com sucesso' : 'Seu pedido foi recebido e está sendo processado'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              display: 'inline-block', fontSize: 20, fontWeight: 900, color: 'var(--purple-600)',
              background: 'var(--purple-50)', padding: '10px 24px',
              borderRadius: 'var(--r-full)', letterSpacing: '0.04em', marginBottom: 16,
              border: '2px solid var(--purple-200)',
            }}
          >
            {order.order_number}
          </motion.div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <StatusBadge status={order.status} />
          </div>
        </motion.div>

        <div className="divider" style={{ margin: '24px 0' }} />

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <h3 className="section-title">Resumo do Pedido</h3>
              {order.items?.map((item, i) => (
                <div key={i} style={{
                  paddingBottom: i < order.items.length - 1 ? 10 : 0,
                  marginBottom: i < order.items.length - 1 ? 10 : 0,
                  borderBottom: i < order.items.length - 1 ? '1px solid var(--gray-100)' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 14 }}>
                      {item.quantity}× {item.product_name}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--gray-700)', fontSize: 14 }}>
                      R$ {item.subtotal?.toFixed(2)}
                    </span>
                  </div>
                  {item.notes && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
                      <MessageSquare style={{ width: 11, height: 11, color: 'var(--purple-400)', flexShrink: 0, marginTop: 2 }} />
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

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary btn-lg"
            onClick={() => navigate(`/tracking/${id}`)}
            style={{ borderRadius: 'var(--r-full)', fontWeight: 800, gap: 10 }}
          >
            <Navigation style={{ width: 18, height: 18 }} />
            Acompanhe seu Pedido
          </motion.button>

          <button
            className="btn btn-outline btn-lg"
            onClick={() => navigate('/')}
            style={{ borderRadius: 'var(--r-full)' }}
          >
            <Home style={{ width: 18, height: 18 }} />
            Voltar ao Cardápio
          </button>
        </motion.div>
      </div>
    </div>
  );
}