import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/shared/StatusBadge';
import moment from 'moment';

export default function KitchenPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('active');

  const { data: orders = [], isLoading } = useQuery({
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

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/admin')}>
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ChefHat style={{ width: 24, height: 24, color: 'var(--purple-600)' }} />
              Kitchen
            </h1>
            <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
              {kitchenOrders.length} order{kitchenOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {[
          { key: 'active', label: 'Active' },
          { key: 'ready', label: 'Ready' },
          { key: 'all', label: 'All' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-item ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : kitchenOrders.length === 0 ? (
        <div className="empty-state">
          <ChefHat />
          <h3>No orders</h3>
          <p>New orders will appear here</p>
        </div>
      ) : (
        kitchenOrders.map(order => (
          <div key={order.id} className="ticket-card animate-fade-in">
            <div className="ticket-header">
              <div>
                <div className="ticket-number">{order.order_number}</div>
                <div className="ticket-time">
                  <Clock style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                  {moment(order.created_date).format('HH:mm')}
                </div>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="ticket-body">
              {order.items?.map((item, i) => (
                <div key={i} className="ticket-item">
                  <div style={{ display: 'flex', flex: 1 }}>
                    <span className="ticket-item-qty">{item.quantity}x</span>
                    <div>
                      <div className="ticket-item-name">{item.product_name}</div>
                      {item.notes && <div className="ticket-item-note">📝 {item.notes}</div>}
                    </div>
                  </div>
                </div>
              ))}
              {order.notes && (
                <div style={{
                  marginTop: 12,
                  padding: 10,
                  background: 'var(--yellow-50)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13,
                  color: 'var(--gray-700)'
                }}>
                  <strong>Note:</strong> {order.notes}
                </div>
              )}
            </div>
            <div className="ticket-actions">
              {order.status === 'new' && (
                <button
                  className="btn btn-warning btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'in_preparation' })}
                >
                  Start Preparation
                </button>
              )}
              {order.status === 'awaiting_confirmation' && (
                <button
                  className="btn btn-warning btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'in_preparation' })}
                >
                  Start Preparation
                </button>
              )}
              {order.status === 'in_preparation' && (
                <button
                  className="btn btn-success btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'ready' })}
                >
                  Mark as Ready
                </button>
              )}
              {order.status !== 'cancelled' && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'cancelled' })}
                >
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