import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat, Truck, Settings, ShoppingBag, Tag, Package,
  ClipboardList, TrendingUp, Clock, CheckCircle2, AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import StatusBadge from '../components/shared/StatusBadge';
import moment from 'moment';

function SidebarCard({ icon: Icon, title, subtitle, route, color, bg, alert, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
        borderRadius: 'var(--r-md)', cursor: 'pointer', background: '#fff',
        border: '1.5px solid var(--gray-150)', transition: 'border-color 0.15s, box-shadow 0.15s',
        marginBottom: 8,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-150)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 'var(--r-sm)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 19, height: 19, color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{subtitle}</div>
      </div>
      {alert && (
        <span style={{ background: 'var(--red-500)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 'var(--r-full)', flexShrink: 0 }}>
          {alert}
        </span>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card">
      <div className="card-body" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          <div style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: 15, height: 15, color }} />
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const newOrders = orders.filter(o => o.status === 'new').length;
  const awaitingConf = orders.filter(o => o.status === 'awaiting_confirmation').length;
  const preparing = orders.filter(o => o.status === 'in_preparation').length;
  const ready = orders.filter(o => o.status === 'ready').length;
  const delivering = orders.filter(o => o.status === 'out_for_delivery').length;
  const completed = orders.filter(o => ['delivered', 'picked_up'].includes(o.status)).length;
  const todayOrders = orders.filter(o => moment(o.created_date).isSame(moment(), 'day'));
  const todayTotal = todayOrders
    .filter(o => ['delivered', 'picked_up'].includes(o.status))
    .reduce((sum, o) => sum + (o.total_price || 0), 0);

  const recentOrders = orders.slice(0, 10);

  const operationalPanels = [
    {
      icon: ChefHat, title: 'Cozinha',
      subtitle: `${newOrders + awaitingConf + preparing} ativo${newOrders + awaitingConf + preparing !== 1 ? 's' : ''}`,
      route: '/kitchen', color: 'var(--orange-500)', bg: 'var(--orange-50)',
      alert: newOrders > 0 ? newOrders : null,
    },
    {
      icon: Truck, title: 'Entregas',
      subtitle: `${ready + delivering} para tratar`,
      route: '/delivery', color: 'var(--purple-600)', bg: 'var(--purple-50)',
    },
    {
      icon: ClipboardList, title: 'Todos os Pedidos',
      subtitle: `${orders.length} no total`,
      route: '/admin/orders', color: 'var(--blue-500)', bg: 'var(--blue-50)',
    },
  ];

  const managementPanels = [
    { icon: Package, title: 'Produtos', subtitle: 'Gerencie o cardápio', route: '/admin/products', color: 'var(--green-500)', bg: 'var(--green-50)' },
    { icon: Tag, title: 'Categorias', subtitle: 'Organize o cardápio', route: '/admin/categories', color: 'var(--yellow-500)', bg: 'var(--yellow-50)' },
    { icon: Settings, title: 'Configurações', subtitle: 'Dados do restaurante', route: '/admin/settings', color: 'var(--gray-600)', bg: 'var(--gray-100)' },
  ];

  /* ── MOBILE layout (original) ── */
  const MobileLayout = () => (
    <div className="panel-container">
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em', marginBottom: 4 }}>Dashboard</h1>
            <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Gestão do Restaurante · {moment().format('dddd, DD MMM')}</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
            <ShoppingBag style={{ width: 15, height: 15 }} /> Cardápio
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Novos Pedidos', value: newOrders, color: 'var(--blue-500)', bg: 'var(--blue-50)', icon: AlertCircle },
          { label: 'Em Preparo', value: preparing, color: 'var(--orange-500)', bg: 'var(--orange-50)', icon: ChefHat },
          { label: 'Prontos / Em Entrega', value: ready + delivering, color: 'var(--purple-600)', bg: 'var(--purple-50)', icon: Truck },
          { label: 'Concluídos Hoje', value: completed, color: 'var(--green-600)', bg: 'var(--green-50)', icon: CheckCircle2 },
          { label: 'Faturamento Hoje', value: `R$ ${todayTotal.toFixed(0)}`, color: 'var(--purple-700)', bg: 'var(--purple-50)', icon: TrendingUp },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card">
              <div className="card-body" style={{ padding: '16px 18px' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon style={{ width: 17, height: 17, color: stat.color }} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-400)', marginTop: 5, lineHeight: 1.3 }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12 }}>Operações</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        {operationalPanels.map(panel => {
          const Icon = panel.icon;
          return (
            <div key={panel.route} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(panel.route)}>
              <div className="card-body" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: panel.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 22, height: 22, color: panel.color }} />
                  </div>
                  {panel.alert && <span style={{ background: 'var(--red-500)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 'var(--r-full)' }}>{panel.alert} novo{panel.alert !== 1 ? 's' : ''}</span>}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 3 }}>{panel.title}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{panel.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12 }}>Gerenciamento</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
        {managementPanels.map(panel => {
          const Icon = panel.icon;
          return (
            <div key={panel.route} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(panel.route)}>
              <div className="card-body" style={{ padding: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: panel.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon style={{ width: 22, height: 22, color: panel.color }} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 3 }}>{panel.title}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{panel.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      <RecentOrders orders={recentOrders} navigate={navigate} />
    </div>
  );

  /* ── DESKTOP layout ── */
  const DesktopLayout = () => (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-100)' }}>

      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, background: '#fff',
        borderRight: '1px solid var(--gray-150)',
        padding: '28px 16px',
        display: 'flex', flexDirection: 'column', gap: 0,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '0 6px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutDashboard style={{ width: 18, height: 18, color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>Admin</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{moment().format('DD MMM YYYY')}</div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--gray-100)', margin: '0 0 20px' }} />

        {/* Operações */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 6px', marginBottom: 8 }}>
            Operações
          </div>
          {operationalPanels.map(panel => (
            <SidebarCard key={panel.route} {...panel} onClick={() => navigate(panel.route)} />
          ))}
        </div>

        <div style={{ height: 1, background: 'var(--gray-100)', margin: '8px 0 20px' }} />

        {/* Gerenciamento */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 6px', marginBottom: 8 }}>
            Gerenciamento
          </div>
          {managementPanels.map(panel => (
            <SidebarCard key={panel.route} {...panel} onClick={() => navigate(panel.route)} />
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--gray-100)' }}>
          <button className="btn btn-outline btn-sm" style={{ width: '100%' }} onClick={() => navigate('/')}>
            <ShoppingBag style={{ width: 14, height: 14 }} /> Ver Cardápio
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Gestão do Restaurante · {moment().format('dddd, DD [de] MMMM')}</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
          <StatCard label="Novos Pedidos" value={newOrders} color="var(--blue-500)" bg="var(--blue-50)" icon={AlertCircle} />
          <StatCard label="Em Preparo" value={preparing} color="var(--orange-500)" bg="var(--orange-50)" icon={ChefHat} />
          <StatCard label="Prontos / Entrega" value={ready + delivering} color="var(--purple-600)" bg="var(--purple-50)" icon={Truck} />
          <StatCard label="Concluídos Hoje" value={completed} color="var(--green-600)" bg="var(--green-50)" icon={CheckCircle2} />
          <StatCard label="Faturamento Hoje" value={`R$ ${todayTotal.toFixed(0)}`} color="var(--purple-700)" bg="var(--purple-50)" icon={TrendingUp} />
        </div>

        {/* Recent orders */}
        <RecentOrders orders={recentOrders} navigate={navigate} />
      </main>
    </div>
  );

  // Responsive switch via CSS — render both, hide with media queries
  return (
    <>
      <div className="admin-desktop-only"><DesktopLayout /></div>
      <div className="admin-mobile-only"><MobileLayout /></div>
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

function RecentOrders({ orders, navigate }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)', letterSpacing: '-0.01em' }}>Pedidos Recentes</h2>
        <button
          onClick={() => navigate('/admin/orders')}
          style={{ fontSize: 13, color: 'var(--purple-600)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Ver todos →
        </button>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state" style={{ padding: 32 }}>
          <Clock />
          <h3>Nenhum pedido ainda</h3>
          <p>Os pedidos aparecerão aqui conforme os clientes fizerem</p>
        </div>
      ) : (
        <div className="card">
          {orders.map((order, i) => (
            <div
              key={order.id}
              onClick={() => navigate('/admin/orders')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                borderBottom: i < orders.length - 1 ? '1px solid var(--gray-100)' : 'none',
                cursor: 'pointer', transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 'var(--r-sm)', flexShrink: 0,
                background: order.order_type === 'delivery' ? 'var(--purple-50)' : 'var(--green-50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {order.order_type === 'delivery'
                  ? <Truck style={{ width: 15, height: 15, color: 'var(--purple-600)' }} />
                  : <ChefHat style={{ width: 15, height: 15, color: 'var(--green-600)' }} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gray-900)' }}>{order.order_number}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                  {order.customer_name} · {moment(order.created_date).fromNow()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={order.status} />
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--purple-600)' }}>
                  R$ {order.total_price?.toFixed(0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}