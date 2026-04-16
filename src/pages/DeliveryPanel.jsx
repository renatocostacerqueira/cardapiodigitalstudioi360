import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Truck, Phone, MapPin, CreditCard, Clock, ArrowLeft, User, StickyNote, RefreshCw, AlertCircle, Printer, Navigation } from 'lucide-react';
import MapNavigationButton from '../components/delivery/MapNavigationButton';
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

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['delivery-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 100),
    refetchInterval: 15000,
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['delivery-tickets'],
    queryFn: () => base44.entities.Ticket.filter({ ticket_type: 'delivery' }),
    refetchInterval: 15000,
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

  const getTicketForOrder = (orderNumber) =>
    tickets.find(t => t.order_number === orderNumber);

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/admin')} aria-label="Back">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck style={{ width: 22, height: 22, color: 'var(--purple-600)' }} />
              Delivery
            </h1>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>
              {filtered.length} order{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button onClick={() => refetch()} style={{ background: '#fff', border: '1.5px solid var(--gray-150)', borderRadius: 'var(--r-sm)', padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-600)', fontWeight: 600 }}>
          <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
        </button>
      </div>

      <div className="tab-bar" style={{ marginBottom: 20 }}>
        {[
          { key: 'ready', label: '📦 Ready' },
          { key: 'delivering', label: '🛵 On the Way' },
          { key: 'done', label: '✅ Done' },
          { key: 'all', label: 'All' },
        ].map(tab => (
          <button key={tab.key} className={`tab-item ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Truck />
          <h3>No orders here</h3>
          <p>Orders will appear as they become ready</p>
        </div>
      ) : (
        filtered.map(order => {
          const ticket = getTicketForOrder(order.order_number);
          return (
            <div key={order.id} className="ticket-card animate-fade-in">
              <div className="ticket-header">
                <div>
                  <div className="ticket-number">{order.order_number}</div>
                  <div className="ticket-time">
                    <Clock style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                    {moment(order.created_date).format('HH:mm')} · {order.order_type === 'delivery' ? '🛵 Delivery' : '🏪 Pickup'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <StatusBadge status={order.status} />
                  {ticket && (
                    <button
                      onClick={() => navigate(`/ticket/delivery/${ticket.id}`)}
                      style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 'var(--r-xs)', padding: '4px 10px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gray-600)', fontWeight: 600 }}
                    >
                      <Printer style={{ width: 11, height: 11 }} /> Ticket
                    </button>
                  )}
                </div>
              </div>

              <div className="ticket-body">
                <div className="info-row" style={{ paddingTop: 0 }}>
                  <User style={{ width: 16, height: 16, color: 'var(--gray-300)' }} />
                  <div>
                    <div className="info-label">Customer</div>
                    <div className="info-value" style={{ fontSize: 16 }}>{order.customer_name}</div>
                  </div>
                </div>
                <div className="info-row">
                  <Phone style={{ width: 16, height: 16, color: 'var(--gray-300)' }} />
                  <div>
                    <div className="info-label">Phone</div>
                    <div className="info-value">
                      <a href={`tel:${order.customer_phone}`} style={{ color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 700 }}>
                        {order.customer_phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="divider" style={{ margin: '10px 0' }} />

                {order.order_type === 'delivery' && order.address_street ? (
                  <div>
                    <div className="info-row" style={{ marginBottom: 0 }}>
                      <MapPin style={{ width: 16, height: 16, color: 'var(--gray-300)' }} />
                      <div>
                        <div className="info-label">Delivery Address</div>
                        <div className="info-value">
                          {order.address_street}, {order.address_number}
                          {order.address_complement && ` — ${order.address_complement}`}
                          <br />{order.address_neighborhood}, {order.address_city}
                          {order.address_reference && (
                            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 3, fontStyle: 'italic' }}>
                              📍 {order.address_reference}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ paddingLeft: 28, marginTop: 8 }}>
                      <MapNavigationButton order={order} compact />
                    </div>
                  </div>
                ) : (
                  <div className="info-row">
                    <MapPin style={{ width: 16, height: 16, color: 'var(--gray-300)' }} />
                    <div>
                      <div className="info-label">Type</div>
                      <div className="info-value">Pickup at restaurant</div>
                    </div>
                  </div>
                )}

                <div className="info-row">
                  <CreditCard style={{ width: 16, height: 16, color: 'var(--gray-300)' }} />
                  <div style={{ flex: 1 }}>
                    <div className="info-label">Payment</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div className="info-value">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--purple-600)', letterSpacing: '-0.02em' }}>
                        R$ {order.total_price?.toFixed(2)}
                      </div>
                    </div>
                    {order.payment_method === 'cash_change' && order.change_amount > 0 && (
                      <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircle style={{ width: 15, height: 15, color: 'var(--orange-500)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#c2410c', fontWeight: 700 }}>
                          Needs change for R$ {order.change_amount?.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {order.notes && (
                  <div className="info-row">
                    <StickyNote style={{ width: 16, height: 16, color: 'var(--gray-300)' }} />
                    <div>
                      <div className="info-label">Notes</div>
                      <div className="info-value" style={{ fontStyle: 'italic', color: 'var(--gray-600)' }}>{order.notes}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="ticket-actions">
                {order.status === 'ready' && order.order_type === 'delivery' && (
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
                    onClick={() => updateStatus.mutate({ id: order.id, status: 'out_for_delivery' })}>
                    🛵 Out for Delivery
                  </button>
                )}
                {order.status === 'ready' && order.order_type === 'pickup' && (
                  <button className="btn btn-success btn-sm" style={{ flex: 1 }}
                    onClick={() => updateStatus.mutate({ id: order.id, status: 'picked_up' })}>
                    ✅ Picked Up
                  </button>
                )}
                {order.status === 'out_for_delivery' && (
                  <button className="btn btn-success btn-sm" style={{ flex: 1 }}
                    onClick={() => updateStatus.mutate({ id: order.id, status: 'delivered' })}>
                    ✅ Delivered
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}