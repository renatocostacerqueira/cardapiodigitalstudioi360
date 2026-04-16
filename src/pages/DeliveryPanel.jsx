import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Phone, MapPin, CreditCard, Clock, ArrowLeft, User, StickyNote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/shared/StatusBadge';
import moment from 'moment';

const PAYMENT_LABELS = {
  cash: 'Cash',
  cash_change: 'Cash (with change)',
  pix: 'PIX',
  debit: 'Debit Card',
  credit: 'Credit Card',
};

export default function DeliveryPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ready');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 100),
    refetchInterval: 10000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-orders'] }),
  });

  const filtered = orders.filter(o => {
    if (filter === 'ready') return o.status === 'ready';
    if (filter === 'delivering') return o.status === 'out_for_delivery';
    if (filter === 'done') return ['delivered', 'picked_up'].includes(o.status);
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
              <Truck style={{ width: 24, height: 24, color: 'var(--purple-600)' }} />
              Delivery
            </h1>
            <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
              {filtered.length} order{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {[
          { key: 'ready', label: 'Ready' },
          { key: 'delivering', label: 'On the Way' },
          { key: 'done', label: 'Completed' },
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
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Truck />
          <h3>No orders</h3>
          <p>Ready orders will appear here</p>
        </div>
      ) : (
        filtered.map(order => (
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
              <div className="info-row">
                <User style={{ width: 16, height: 16, color: 'var(--gray-400)' }} />
                <div>
                  <div className="info-label">Customer</div>
                  <div className="info-value">{order.customer_name}</div>
                </div>
              </div>
              <div className="info-row">
                <Phone style={{ width: 16, height: 16, color: 'var(--gray-400)' }} />
                <div>
                  <div className="info-label">Phone</div>
                  <div className="info-value">{order.customer_phone}</div>
                </div>
              </div>

              {order.order_type === 'delivery' && order.address_street ? (
                <div className="info-row">
                  <MapPin style={{ width: 16, height: 16, color: 'var(--gray-400)' }} />
                  <div>
                    <div className="info-label">Address</div>
                    <div className="info-value">
                      {order.address_street}, {order.address_number}
                      {order.address_complement && ` - ${order.address_complement}`}
                      <br />{order.address_neighborhood}, {order.address_city}
                      {order.address_reference && (
                        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                          Ref: {order.address_reference}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-row">
                  <MapPin style={{ width: 16, height: 16, color: 'var(--gray-400)' }} />
                  <div>
                    <div className="info-label">Order Type</div>
                    <div className="info-value">Pickup at restaurant</div>
                  </div>
                </div>
              )}

              <div className="info-row">
                <CreditCard style={{ width: 16, height: 16, color: 'var(--gray-400)' }} />
                <div>
                  <div className="info-label">Payment</div>
                  <div className="info-value">
                    {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                    {order.payment_method === 'cash_change' && order.change_amount > 0 && (
                      <span style={{ color: 'var(--orange-500)', fontWeight: 700, marginLeft: 8 }}>
                        Change for R$ {order.change_amount?.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {order.notes && (
                <div className="info-row">
                  <StickyNote style={{ width: 16, height: 16, color: 'var(--gray-400)' }} />
                  <div>
                    <div className="info-label">Notes</div>
                    <div className="info-value">{order.notes}</div>
                  </div>
                </div>
              )}

              <div style={{
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--purple-600)',
                marginTop: 12,
                textAlign: 'right'
              }}>
                R$ {order.total_price?.toFixed(2)}
              </div>
            </div>

            <div className="ticket-actions">
              {order.status === 'ready' && order.order_type === 'delivery' && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'out_for_delivery' })}
                >
                  Out for Delivery
                </button>
              )}
              {order.status === 'ready' && order.order_type === 'pickup' && (
                <button
                  className="btn btn-success btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'picked_up' })}
                >
                  Picked Up
                </button>
              )}
              {order.status === 'out_for_delivery' && (
                <button
                  className="btn btn-success btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => updateStatus.mutate({ id: order.id, status: 'delivered' })}
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}