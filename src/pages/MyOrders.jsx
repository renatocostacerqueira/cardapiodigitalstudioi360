import React from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, RotateCcw, ChevronRight } from 'lucide-react';
import StatusBadge from '../components/shared/StatusBadge';
import BottomNav from '../components/menu/BottomNav';
import { useCart } from '../context/CartContext';
import moment from 'moment';

const ACTIVE_STATUSES = ['new', 'awaiting_confirmation', 'in_preparation', 'ready', 'out_for_delivery'];

export default function MyOrders() {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 50),
  });

  const handleReorder = (order, e) => {
    e.stopPropagation();
    clearCart();
    order.items?.forEach(item => {
      addItem(
        { id: item.product_id, name: item.product_name, image: item.product_image, price: item.unit_price },
        item.quantity,
        item.notes || ''
      );
    });
    navigate('/cart');
  };

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const pastOrders = orders.filter(o => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="app-shell">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">Track and reorder</p>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <ClipboardList />
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            {/* Active orders */}
            {activeOrders.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-500)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-700)' }}>Active Orders</h2>
                </div>
                {activeOrders.map(order => (
                  <OrderCard key={order.id} order={order} onReorder={handleReorder} navigate={navigate} isActive />
                ))}
                {pastOrders.length > 0 && <div className="divider" style={{ margin: '20px 0' }} />}
              </>
            )}

            {/* Past orders */}
            {pastOrders.length > 0 && (
              <>
                {activeOrders.length > 0 && (
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 12 }}>Order History</h2>
                )}
                {pastOrders.map(order => (
                  <OrderCard key={order.id} order={order} onReorder={handleReorder} navigate={navigate} />
                ))}
              </>
            )}
          </>
        )}
      </div>
      <BottomNav />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}

function OrderCard({ order, onReorder, navigate, isActive }) {
  return (
    <div
      className="card animate-fade-in"
      style={{ marginBottom: 12, cursor: 'pointer', border: isActive ? '1.5px solid var(--purple-200)' : '1px solid transparent' }}
      onClick={() => navigate(`/confirmation/${order.id}`)}
    >
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>
              {order.order_number}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
              {moment(order.created_date).format('DD/MM/YYYY HH:mm')}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 10, lineHeight: 1.5 }}>
          {order.items?.map(i => `${i.quantity}× ${i.product_name}`).join(' · ')}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--purple-600)', letterSpacing: '-0.02em' }}>
            R$ {order.total_price?.toFixed(2)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={(e) => onReorder(order, e)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px',
                borderRadius: 'var(--r-full)', background: 'var(--purple-50)',
                border: '1.5px solid var(--purple-200)', color: 'var(--purple-700)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <RotateCcw style={{ width: 12, height: 12 }} /> Reorder
            </button>
            {isActive && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/confirmation/${order.id}`); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px',
                  borderRadius: 'var(--r-full)', background: 'var(--purple-600)',
                  border: 'none', color: '#fff',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Track <ChevronRight style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}