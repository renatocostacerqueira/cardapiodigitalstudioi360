import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ChefHat, Truck, Settings, ShoppingBag, Tag, Package,
  CheckCircle2, AlertCircle, BarChart3,
  UtensilsCrossed, Search, Store, CreditCard, MapPin,
  Phone, User, MessageSquare, ChevronDown, X, Users
} from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import SendWhatsAppButton from '../components/shared/SendWhatsAppButton';
import moment from 'moment';

// ─── Constants ──────────────────────────────────────────────────────────────

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

const NAV_GROUPS = [
  {
    section: 'Dashboard',
    items: [
      { to: '/admin', label: 'Visão Geral', icon: AlertCircle, color: 'var(--blue-500)', bg: 'var(--blue-50)', exact: true },
      { to: '/admin/metrics', label: 'Métricas', icon: BarChart3, color: 'var(--purple-600)', bg: 'var(--purple-50)' },
    ],
  },
  {
    section: 'Cozinha',
    items: [
      { to: '/kitchen', label: 'Painel da Cozinha', icon: ChefHat, color: 'var(--orange-500)', bg: 'var(--orange-50)', external: true, badgeKey: 'kitchen' },
    ],
  },
  {
    section: 'Operações',
    items: [
      { to: '/delivery', label: 'Entregas', icon: Truck, color: 'var(--purple-600)', bg: 'var(--purple-50)', external: true },
    ],
  },
  {
    section: 'Gerenciamento',
    items: [
      { to: '/admin/products', label: 'Produtos', icon: Package, color: 'var(--green-500)', bg: 'var(--green-50)' },
      { to: '/admin/categories', label: 'Categorias', icon: Tag, color: 'var(--yellow-500)', bg: 'var(--yellow-50)' },
      { to: '/admin/users', label: 'Funcionários', icon: Users, color: 'var(--blue-500)', bg: 'var(--blue-50)' },
      { to: '/admin/settings', label: 'Configurações', icon: Settings, color: 'var(--gray-600)', bg: 'var(--gray-100)' },
    ],
  },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ newOrdersCount }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside style={{
      width: 240, flexShrink: 0, background: '#fff',
      borderRight: '1px solid var(--gray-150)',
      padding: '20px 12px',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ padding: '0 8px 20px', borderBottom: '1px solid var(--gray-100)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UtensilsCrossed style={{ width: 17, height: 17, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>Painel Admin</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{moment().format('DD MMM YYYY')}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV_GROUPS.map(group => (
          <div key={group.section} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 8px', marginBottom: 6 }}>
              {group.section}
            </div>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to) && item.to !== '/admin';

              const inner = (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                  borderRadius: 'var(--r-sm)', cursor: 'pointer', transition: 'background 0.12s',
                  background: isActive ? 'var(--purple-50)' : 'transparent',
                  marginBottom: 2,
                }}>
                  <div style={{ width: 30, height: 30, borderRadius: 'var(--r-xs)', background: isActive ? 'var(--purple-100)' : item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: 15, height: 15, color: isActive ? 'var(--purple-600)' : item.color }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--purple-700)' : 'var(--gray-700)', flex: 1 }}>
                    {item.label}
                  </span>
                  {item.badgeKey === 'kitchen' && newOrdersCount > 0 && (
                    <span style={{ background: 'var(--red-500)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 'var(--r-full)' }}>
                      {newOrdersCount}
                    </span>
                  )}
                </div>
              );

              if (item.external) {
                return <div key={item.to} onClick={() => navigate(item.to)}>{inner}</div>;
              }
              return (
                <NavLink key={item.to} to={item.to} end={!!item.exact} style={{ textDecoration: 'none' }}>
                  {inner}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ paddingTop: 16, borderTop: '1px solid var(--gray-100)' }}>
        <button className="btn btn-outline btn-sm" style={{ width: '100%', fontSize: 12 }} onClick={() => navigate('/')}>
          <ShoppingBag style={{ width: 13, height: 13 }} /> Ver Cardápio
        </button>
      </div>
    </aside>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────

function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const [newStatus, setNewStatus] = useState(order.status);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>{order.order_number}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>{moment(order.created_date).format('DD/MM/YYYY HH:mm')}</div>
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
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 8 }}>Cliente</div>
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
          <div style={{ marginBottom: 16, padding: 14, borderRadius: 'var(--r-md)', background: order.order_type === 'delivery' ? 'var(--purple-50)' : 'var(--green-50)', border: `1px solid ${order.order_type === 'delivery' ? '#ddd6fe' : '#bbf7d0'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: order.order_type === 'delivery' ? 10 : 0 }}>
              {order.order_type === 'delivery' ? <Truck style={{ width: 16, height: 16, color: 'var(--purple-600)' }} /> : <Store style={{ width: 16, height: 16, color: 'var(--green-600)' }} />}
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
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 8 }}>Itens</div>
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
          <div style={{ marginBottom: 16, padding: 14, borderRadius: 'var(--r-md)', background: 'var(--gray-50)', border: '1px solid var(--gray-150)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 8 }}>Pagamento</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard style={{ width: 15, height: 15, color: 'var(--gray-400)' }} />
              <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{PAYMENT_LABELS[order.payment_method] || order.payment_method}</span>
            </div>
            {order.payment_method === 'cash_change' && order.change_amount > 0 && (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#c2410c' }}>
                ⚠ Cliente vai pagar com R$ {order.change_amount?.toFixed(2)} — Troco a devolver: R$ {(order.change_amount - order.total_price)?.toFixed(2)}
              </div>
            )}
          </div>

          {order.notes && (
            <div style={{ marginBottom: 16, padding: 14, borderRadius: 'var(--r-md)', background: '#fefce8', border: '1px solid #fef08a' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a16207', marginBottom: 6 }}>Observações</div>
              <div style={{ fontSize: 13, color: '#854d0e', fontStyle: 'italic' }}>{order.notes}</div>
            </div>
          )}

          {/* Status — Admin só altera/cancela quando é "Novo Pedido" */}
          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 18 }}>
            {order.status === 'new' ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-400)', marginBottom: 10 }}>Ações Disponíveis</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => { onUpdateStatus(order.id, 'cancelled'); onClose(); }}
                  >
                    Cancelar Pedido
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 12, fontStyle: 'italic' }}>
                  Após o pedido entrar em preparo, a alteração de status passa a ser feita pelos painéis Cozinha/Entregas.
                </div>
              </>
            ) : (
              <div style={{
                padding: 12, borderRadius: 'var(--r-sm)',
                background: 'var(--gray-50)', border: '1px solid var(--gray-150)',
                fontSize: 12, color: 'var(--gray-500)', marginBottom: 12, lineHeight: 1.5,
              }}>
                🔒 Somente visualização. O status é gerenciado pelos painéis Cozinha e Entregas.
              </div>
            )}
            <SendWhatsAppButton
              orderId={order.id}
              orderNumber={order.order_number}
              customerName={order.customer_name}
              phone={order.customer_phone}
              label="Enviar link de rastreio por WhatsApp"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Orders List (used both in Dashboard home and /admin/orders route) ────────

function OrdersList({ orders, isLoading }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders-panel'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
    },
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
    <>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ margin: 0, flex: 1, minWidth: 200 }}>
          <Search className="search-bar-icon" />
          <input className="input-field" placeholder="Buscar por pedido # ou cliente..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Quick status pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
        {[
          { key: '', label: 'Todos', color: 'var(--gray-600)' },
          { key: 'new', label: 'Novo', color: 'var(--blue-500)' },
          { key: 'in_preparation', label: 'Em Preparo', color: 'var(--orange-500)' },
          { key: 'ready', label: 'Pronto', color: 'var(--green-500)' },
          { key: 'out_for_delivery', label: 'Em Entrega', color: 'var(--purple-600)' },
          { key: 'delivered', label: 'Entregue', color: 'var(--gray-500)' },
          { key: 'cancelled', label: 'Cancelado', color: 'var(--red-500)' },
        ].map(item => (
          <button key={item.key} onClick={() => setStatusFilter(item.key)} style={{
            whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: 'var(--r-full)',
            border: `1.5px solid ${statusFilter === item.key ? item.color : 'var(--gray-200)'}`,
            background: statusFilter === item.key ? item.color : '#fff',
            color: statusFilter === item.key ? '#fff' : 'var(--gray-600)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
          }}>
            {item.label} {item.key === '' ? orders.length : (statusCounts[item.key] || 0)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: 32 }}>
          <h3>Nenhum pedido encontrado</h3>
          <p>Tente ajustar os filtros</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(order => (
            <div key={order.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', flexShrink: 0, background: order.order_type === 'delivery' ? 'var(--purple-50)' : 'var(--green-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {order.order_type === 'delivery'
                    ? <Truck style={{ width: 17, height: 17, color: 'var(--purple-600)' }} />
                    : <Store style={{ width: 17, height: 17, color: 'var(--green-600)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--gray-900)' }}>{order.order_number}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                    {order.customer_name} · {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>
                    {moment(order.created_date).format('DD/MM HH:mm')} · {PAYMENT_LABELS[order.payment_method] || ''}
                    {order.payment_method === 'cash_change' && order.change_amount > 0 &&
                      <span style={{ color: '#c2410c', fontWeight: 700 }}> · Troco R$ {(order.change_amount - order.total_price)?.toFixed(2)}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--purple-600)', letterSpacing: '-0.02em' }}>R$ {order.total_price?.toFixed(2)}</div>
                  <ChevronDown style={{ width: 13, height: 13, color: 'var(--gray-300)', transform: 'rotate(-90deg)', marginTop: 3 }} />
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
    </>
  );
}

// ─── Dashboard Home ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card">
      <div className="card-body" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: 16, height: 16, color }} />
          </div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function DashboardHome({ orders, isLoading }) {
  const newOrders = orders.filter(o => o.status === 'new').length;
  const preparing = orders.filter(o => o.status === 'in_preparation').length;
  const ready = orders.filter(o => o.status === 'ready').length;
  const delivering = orders.filter(o => o.status === 'out_for_delivery').length;
  const completed = orders.filter(o => ['delivered', 'picked_up'].includes(o.status)).length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>{moment().format('dddd, DD [de] MMMM [de] YYYY')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatCard label="Novos Pedidos" value={newOrders} color="var(--blue-500)" bg="var(--blue-50)" icon={AlertCircle} />
        <StatCard label="Em Preparo" value={preparing} color="var(--orange-500)" bg="var(--orange-50)" icon={ChefHat} />
        <StatCard label="Pronto / Entrega" value={ready + delivering} color="var(--purple-600)" bg="var(--purple-50)" icon={Truck} />
        <StatCard label="Concluídos Hoje" value={completed} color="var(--green-600)" bg="var(--green-50)" icon={CheckCircle2} />
        <StatCard label="Cancelados" value={cancelled} color="var(--red-500)" bg="var(--red-50)" icon={X} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-800)', letterSpacing: '-0.02em' }}>Todos os Pedidos</h2>
      </div>

      <OrdersList orders={orders} isLoading={isLoading} />
    </div>
  );
}

// ─── Main AdminPanel ──────────────────────────────────────────────────────────

export default function AdminPanel() {
  const location = useLocation();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders-panel'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const newOrdersCount = orders.filter(o => o.status === 'new').length;
  const isDashboardHome = location.pathname === '/admin';

  const DesktopView = () => (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Sidebar newOrdersCount={newOrdersCount} />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        {isDashboardHome
          ? <DashboardHome orders={orders} isLoading={isLoading} />
          : <Outlet />
        }
      </main>
    </div>
  );

  return (
    <>
      <div className="admin-desktop-only"><DesktopView /></div>
      <div className="admin-mobile-only"><Outlet /></div>
      <style>{`
        .admin-desktop-only { display: none; }
        .admin-mobile-only  { display: block; }
        @media (min-width: 1024px) {
          .admin-desktop-only { display: block; }
          .admin-mobile-only  { display: none; }
        }
      `}</style>
    </>
  );
}