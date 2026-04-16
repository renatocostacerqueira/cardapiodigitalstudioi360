import React from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import BottomNav from '../components/menu/BottomNav';
import moment from 'moment';

export default function MyOrders() {
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 50),
  });

  return (
    <div className="app-shell">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">Track your recent orders</p>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <ClipboardList />
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
          </div>
        ) : (
          orders.map(order => (
            <div
              key={order.id}
              className="card animate-fade-in"
              style={{ marginBottom: 12, cursor: 'pointer' }}
              onClick={() => navigate(`/confirmation/${order.id}`)}
            >
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 8 }}>
                  {moment(order.created_date).format('DD/MM/YYYY HH:mm')}
                </div>
                <div style={{ fontSize: 14, color: 'var(--gray-600)' }}>
                  {order.items?.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--purple-600)', marginTop: 8 }}>
                  R$ {order.total_price?.toFixed(2)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}