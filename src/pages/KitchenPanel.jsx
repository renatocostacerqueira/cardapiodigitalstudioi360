import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/shared/StatusBadge';
import moment from 'moment';

export default function KitchenPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('active');

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 100),
    refetchInterval: 10000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] }),
  });

  const kitchenOrders = orders.filter(o => {
    if (filter === 'active') return ['new', 'awaiting_confirmation', 'in_preparation'].includes(o.status);
    if (filter === 'ready') return o.status === 'ready';
    return true;
  });

  const newCount = orders.filter(o => o.status === 'new').length;

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/admin')} aria-label="Back to admin">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ChefHat style={{ width: 22, height: 22, color: 'var(--purple-600)' }} />
                Kitchen
              </h1>
              {newCount > 0 && (
                <span style={{
                  background: 'var(--red-500)', color: '#fff',
                  fontSize: 11, fontWeight: 800, padding: '3px 9px',
                  borderRadius: 'var(--r-full)',
                }}>
                  {newCount} new
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
              {kitchenOrders.length} order{kitchenOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          style={{ background: '#fff', border: '1.5px solid var(--gray-150)', borderRadius: 'var(--r-sm)', padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}
          aria-label="Refresh orders"
        >
          <RefreshCw style={{ width: 14, height: 14 }} />
          Refresh
        </button>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {[
          { key: 'active', label: '🔥 Active' },
          { key: 'ready', label: '✅ Ready' },
          { key: 'all', label: 'All Orders' },
        ].map(tab => (
          <button key={tab.key} className={`tab-item ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : kitchenOrders.length === 0 ? (
        <div className="empty-state">
          <ChefHat />
          <h3>All clear!</h3>
          <p>No orders in this queue right now.</p>
        </div>
      ) : (
        kitchenOrders.map(order => (
          <div key={order.id} className="ticket-card animate-fade-in">
            <div className="ticket-header">
              <div>
                <div className="ticket-number">{order.order_number}</div>
                <div className="ticket-time">
                  <Clock style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                  {moment(order.created_date).format('HH:mm')} · {order.order_type === 'delivery' ? '🛵 Delivery' : '🏪 Pickup'}
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="ticket-body">
              {order.items?.map((item, i) => (
                <div key={i} className="ticket-item">
                  <span className="ticket-item-qty">{item.quantity}×</span>
                  <div style={{ flex: 1 }}>
                    <div className="ticket-item-name">{item.product_name}</div>
                    {item.notes && (
                      <div className="ticket-item-note">📝 {item.notes}</div>
                    )}
                  </div>
                </div>
              ))}

              {order.notes && (
                <div style={{
                  marginTop: 14, padding: '10px 14px',
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 13, color: '#854d0e',
                  fontWeight: 500,
                }}>
                  ⚠️ <strong>Order note:</strong> {order.notes}
                </div>
              )}
            </div>

            <div className="ticket-actions">
              {['new', 'awaiting_confirmation'].includes(order.status) && (
                <button className="btn btn-warning btn-sm" style={{ flex: 1 }}
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'in_preparation' })}>
                  🍳 Start Preparation
                </button>
              )}
              {order.status === 'in_preparation' && (
                <button className="btn btn-success btn-sm" style={{ flex: 1 }}
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'ready' })}>
                  ✅ Mark as Ready
                </button>
              )}
              {order.status !== 'cancelled' && order.status !== 'ready' && order.status !== 'delivered' && order.status !== 'picked_up' && (
                <button className="btn btn-danger btn-sm"
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}