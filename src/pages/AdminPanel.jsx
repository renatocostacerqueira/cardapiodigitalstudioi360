import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat, Truck, Settings, ShoppingBag, Tag, Package,
  ClipboardList, TrendingUp, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import StatusBadge from '../components/shared/StatusBadge';
import moment from 'moment';

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

  const recentOrders = orders.slice(0, 8);

  const operationalPanels = [
    {
      icon: ChefHat,
      title: 'Kitchen',
      subtitle: `${newOrders + awaitingConf + preparing} active`,
      route: '/kitchen',
      color: 'var(--orange-500)',
      bg: 'var(--orange-50)',
      alert: newOrders > 0 ? newOrders : null,
    },
    {
      icon: Truck,
      title: 'Delivery',
      subtitle: `${ready + delivering} to handle`,
      route: '/delivery',
      color: 'var(--purple-600)',
      bg: 'var(--purple-50)',
    },
    {
      icon: ClipboardList,
      title: 'All Orders',
      subtitle: `${orders.length} total`,
      route: '/admin/orders',
      color: 'var(--blue-500)',
      bg: 'var(--blue-50)',
    },
  ];

  const managementPanels = [
    { icon: Package, title: 'Products', subtitle: 'Manage your menu', route: '/admin/products', color: 'var(--green-500)', bg: 'var(--green-50)' },
    { icon: Tag, title: 'Categories', subtitle: 'Organize your menu', route: '/admin/categories', color: 'var(--yellow-500)', bg: 'var(--yellow-50)' },
    { icon: Settings, title: 'Settings', subtitle: 'Restaurant info', route: '/admin/settings', color: 'var(--gray-600)', bg: 'var(--gray-100)' },
  ];

  return (
    <div className="panel-container">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em', marginBottom: 4 }}>
              Dashboard
            </h1>
            <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Restaurant Management · {moment().format('dddd, DD MMM')}</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
            <ShoppingBag style={{ width: 15, height: 15 }} />
            Customer Menu
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'New Orders', value: newOrders, color: 'var(--blue-500)', bg: 'var(--blue-50)', icon: AlertCircle },
          { label: 'Preparing', value: preparing, color: 'var(--orange-500)', bg: 'var(--orange-50)', icon: ChefHat },
          { label: 'Ready / Delivering', value: ready + delivering, color: 'var(--purple-600)', bg: 'var(--purple-50)', icon: Truck },
          { label: 'Today Completed', value: completed, color: 'var(--green-600)', bg: 'var(--green-50)', icon: CheckCircle2 },
          { label: "Today's Revenue", value: `R$ ${todayTotal.toFixed(0)}`, color: 'var(--purple-700)', bg: 'var(--purple-50)', icon: TrendingUp },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card">
              <div className="card-body" style={{ padding: '16px 18px' }}>
                <div style={{ width: 34, height: 34, borderRadius: 'var(--r-sm)', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon style={{ width: 17, height: 17, color: stat.color }} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-400)', marginTop: 5, lineHeight: 1.3 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Panels */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12, letterSpacing: '-0.01em' }}>
        Operations
      </h2>
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
                  {panel.alert && (
                    <span style={{ background: 'var(--red-500)', color: '#fff', fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 'var(--r-full)' }}>
                      {panel.alert} new
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 3 }}>{panel.title}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>{panel.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Management */}
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)', marginBottom: 12, letterSpacing: '-0.01em' }}>
        Management
      </h2>
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

      {/* Recent Orders */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)', letterSpacing: '-0.01em' }}>Recent Orders</h2>
        <button
          onClick={() => navigate('/admin/orders')}
          style={{ fontSize: 13, color: 'var(--purple-600)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          View all →
        </button>
      </div>
      {recentOrders.length === 0 ? (
        <div className="empty-state" style={{ padding: 32 }}>
          <Clock />
          <h3>No orders yet</h3>
          <p>Orders will appear here as customers place them</p>
        </div>
      ) : (
        <div className="card">
          {recentOrders.map((order, i) => (
            <div
              key={order.id}
              onClick={() => navigate('/admin/orders')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                borderBottom: i < recentOrders.length - 1 ? '1px solid var(--gray-100)' : 'none',
                cursor: 'pointer',
              }}
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
    </div>
  );
}