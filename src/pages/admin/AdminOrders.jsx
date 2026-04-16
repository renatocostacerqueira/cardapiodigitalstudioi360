import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Truck, Store, CreditCard,
  MapPin, Phone, User, MessageSquare, ChevronDown, X
} from 'lucide-react';
import StatusBadge from '../../components/shared/StatusBadge';
import moment from 'moment';

const PAYMENT_LABELS = {
  cash: 'Dinheiro', cash_change: 'Dinheiro c/ Troco', pix: 'PIX', debit: 'Débito', credit: 'Crédito',
};

const STATUSES = [
  { value: '', label: 'Todos os Status' },
  { value: 'new', label: 'Novo Pedido' },
  { value: 'awaiting_confirmation', label: 'Aguardando Confirmação' },
  { value: 'in_preparation', label: 'Em Preparo' },
  { value: 'ready', label: 'Pronto' },
  { value: 'out_for_delivery', label: 'Saiu para Entrega' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'picked_up', label: 'Retirado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const STATUS_FLOW = [
  'new', 'awaiting_confirmation', 'in_preparation', 'ready',
  'out_for_delivery', 'delivered', 'picked_up', 'cancelled'
];

function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const [newStatus, setNewStatus] = useState(order.status);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
              {order.order_number}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
              {moment(order.created_date).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusBadge status={order.status} />
            <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: 'var(--r-sm)', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Customer */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 10 }}>Cliente</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <User style={{ width: 15, height: 15, color: 'var(--gray-300)' }} />
              <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{order.customer_name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Phone style={{ width: 15, height: 15, color: 'var(--gray-300)' }} />
              <a href={`tel:${order.customer_phone}`} style={{ color: 'var(--purple-600)', fontWeight: 600, textDecoration: 'none' }}>{order.customer_phone}</a>
            </div>
          </div>

          {/* Type & Address */}
          <div style={{ marginBottom: 20, padding: 14, borderRadius: 'var(--r-md)', background: order.order_type === 'delivery' ? 'var(--purple-50)' : 'var(--green-50)', border: `1px solid ${order.order_type === 'delivery' ? '#ddd6fe' : '#bbf7d0'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: order.order_type === 'delivery' ? 10 : 0 }}>
              {order.order_type === 'delivery'
                ? <Truck style={{ width: 16, height: 16, color: 'var(--purple-600)' }} />
                : <Store style={{ width: 16, height: 16, color: 'var(--green-600)' }} />
              }
              <span style={{ fontWeight: 700, fontSize: 14, color: order.order_type === 'delivery' ? 'var(--purple-700)' : 'var(--green-700)' }}>
                {order.order_type === 'delivery' ? 'Entrega' : 'Retirada'}
              </span>
            </div>
            {order.order_type === 'delivery' && order.address_street && (
              <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.6 }}>
                <MapPin style={{ width: 13, height: 13, color: 'var(--gray-400)', display: 'inline', marginRight: 4 }} />
                {order.address_street}, {order.address_number}
                {order.address_complement && ` — ${order.address_complement}`}<br />
                {order.address_neighborhood}, {order.address_city}
                {order.address_reference && <div style={{ marginTop: 4, color: 'var(--gray-500)', fontStyle: 'italic' }}>📍 {order.address_reference}</div>}
              </div>
            )}
          </div>

          {/* Items */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 10 }}>Itens</div>
            {order.items?.map((item, i) => (
              <div key={i} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: i < order.items.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{item.quantity}× {item.product_name}</span>
                  <span style={{ fontWeight: 700, color: 'var(--gray-700)' }}>R$ {item.subtotal?.toFixed(2)}</span>
                </div>
                {item.notes && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginTop: 5 }}>
                    <MessageSquare style={{ width: 12, height: 12, color: 'var(--purple-400)', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: 'var(--gray-500)', fontStyle: 'italic' }}>{item.notes}</span>
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '2px solid var(--gray-100)' }}>
              <span style={{ fontWeight: 800, color: 'var(--gray-900)' }}>Total</span>

              <span style={{ fontWeight: 900, color: 'var(--purple-600)', fontSize: 17 }}>R$ {order.total_price?.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ marginBottom: 20, padding: 14, borderRadius: 'var(--r-md)', background: 'var(--gray-50)', border: '1px solid var(--gray-150)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 8 }}>Pagamento</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard style={{ width: 15, height: 15, color: 'var(--gray-400)' }} />
              <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{PAYMENT_LABELS[order.payment_method] || order.payment_method}</span>
            </div>
            {order.payment_method === 'cash_change' && order.change_amount > 0 && (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#c2410c' }}>
                ⚠ Change for R$ {order.change_amount?.toFixed(2)}
              </div>
            )}
          </div>

          {order.notes && (
            <div style={{ marginBottom: 20, padding: 14, borderRadius: 'var(--r-md)', background: '#fefce8', border: '1px solid #fef08a' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a16207', marginBottom: 6 }}>Observações do Pedido</div>
              <div style={{ fontSize: 13, color: '#854d0e', fontStyle: 'italic' }}>{order.notes}</div>
            </div>
          )}

          {/* Status Update */}
          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 10 }}>Atualizar Status</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                className="input-field"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                style={{ flex: 1 }}
              >
                {STATUSES.filter(s => s.value).map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <button
                className="btn btn-primary btn-sm"
                disabled={newStatus === order.status}
                onClick={() => { onUpdateStatus(order.id, newStatus); onClose(); }}
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] }),
  });

  const filtered = orders.filter(o => {
    const matchesStatus = !statusFilter || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_phone?.includes(q);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {};
  orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-btn" onClick={() => navigate('/admin')} aria-label="Back">
            <ArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>Todos os Pedidos</h1>
            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>{orders.length} pedidos no total</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ margin: 0, flex: 1, minWidth: 200 }}>
          <Search className="search-bar-icon" />
          <input
            className="input-field"
            placeholder="Buscar por pedido # ou cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 180 }}
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Quick counts */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
        {[
          { key: '', label: 'Todos', color: 'var(--gray-600)' },
          { key: 'new', label: 'Novo', color: 'var(--blue-500)' },
          { key: 'in_preparation', label: 'Em Preparo', color: 'var(--orange-500)' },
          { key: 'ready', label: 'Pronto', color: 'var(--green-500)' },
          { key: 'out_for_delivery', label: 'Em Entrega', color: 'var(--purple-600)' },
          { key: 'delivered', label: 'Entregue', color: 'var(--gray-500)' },
          { key: 'cancelled', label: 'Cancelado', color: 'var(--red-500)' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            style={{
              whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: 'var(--r-full)',
              border: `1.5px solid ${statusFilter === item.key ? item.color : 'var(--gray-200)'}`,
              background: statusFilter === item.key ? item.color : '#fff',
              color: statusFilter === item.key ? '#fff' : 'var(--gray-600)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            {item.label} {item.key === '' ? orders.length : (statusCounts[item.key] || 0)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <h3>Nenhum pedido encontrado</h3>
          <p>Tente ajustar os filtros</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(order => (
            <div
              key={order.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onClick={() => setSelectedOrder(order)}
            >
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--r-sm)', flexShrink: 0,
                  background: order.order_type === 'delivery' ? 'var(--purple-50)' : 'var(--green-50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {order.order_type === 'delivery'
                    ? <Truck style={{ width: 18, height: 18, color: 'var(--purple-600)' }} />
                    : <Store style={{ width: 18, height: 18, color: 'var(--green-600)' }} />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--gray-900)' }}>{order.order_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 2 }}>
                    {order.customer_name} · {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                    {moment(order.created_date).format('DD/MM HH:mm')} · {PAYMENT_LABELS[order.payment_method] || ''}
                    {order.payment_method === 'cash_change' && order.change_amount > 0 &&
                      <span style={{ color: '#c2410c', fontWeight: 700 }}> · Troco R$ {order.change_amount?.toFixed(2)}</span>
                    }
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--purple-600)', letterSpacing: '-0.02em' }}>
                    R$ {order.total_price?.toFixed(2)}
                  </div>
                  <ChevronDown style={{ width: 14, height: 14, color: 'var(--gray-300)', transform: 'rotate(-90deg)', marginTop: 4 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(id, status) => updateStatus.mutate({ id, status })}
        />
      )}
    </div>
  );
}