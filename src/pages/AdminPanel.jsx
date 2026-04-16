import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Truck, Settings, ShoppingBag, Tag, Package } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function AdminPanel() {
  const navigate = useNavigate();

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
  });

  const newOrders = orders.filter(o => ['new', 'awaiting_confirmation'].includes(o.status)).length;
  const preparing = orders.filter(o => o.status === 'in_preparation').length;
  const ready = orders.filter(o => o.status === 'ready').length;
  const delivering = orders.filter(o => o.status === 'out_for_delivery').length;
  const todayTotal = orders
    .filter(o => ['delivered', 'picked_up'].includes(o.status))
    .reduce((sum, o) => sum + (o.total_price || 0), 0);

  const panels = [
    {
      icon: ChefHat,
      title: 'Kitchen',
      subtitle: `${newOrders + preparing} active orders`,
      route: '/kitchen',
      color: 'var(--orange-500)',
      bg: 'var(--orange-50)',
    },
    {
      icon: Truck,
      title: 'Delivery',
      subtitle: `${ready + delivering} orders`,
      route: '/delivery',
      color: 'var(--purple-600)',
      bg: 'var(--purple-50)',
    },
    {
      icon: Package,
      title: 'Products',
      subtitle: 'Manage your menu',
      route: '/admin/products',
      color: 'var(--green-500)',
      bg: 'var(--green-50)',
    },
    {
      icon: Tag,
      title: 'Categories',
      subtitle: 'Organize your menu',
      route: '/admin/categories',
      color: 'var(--blue-500)',
      bg: 'var(--blue-50)',
    },
  ];

  return (
    <div className="panel-container">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Restaurant Management</p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 28
      }}>
        {[
          { label: 'New Orders', value: newOrders, color: 'var(--blue-500)' },
          { label: 'Preparing', value: preparing, color: 'var(--orange-500)' },
          { label: 'Ready', value: ready, color: 'var(--green-500)' },
          { label: 'Today Sales', value: `R$ ${todayTotal.toFixed(0)}`, color: 'var(--purple-600)' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ textAlign: 'center' }}>
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-500)', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 16 }}>
        Quick Access
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
      }}>
        {panels.map(panel => {
          const Icon = panel.icon;
          return (
            <div
              key={panel.route}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(panel.route)}
            >
              <div className="card-body" style={{ padding: 20 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: panel.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Icon style={{ width: 22, height: 22, color: panel.color }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 4 }}>
                  {panel.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                  {panel.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          className="btn btn-outline"
          style={{ width: '100%' }}
          onClick={() => navigate('/')}
        >
          <ShoppingBag style={{ width: 16, height: 16 }} />
          View Customer Menu
        </button>
      </div>
    </div>
  );
}