import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, ClipboardList, Settings, UtensilsCrossed, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function DesktopSidebar() {
  const location = useLocation();
  const { totalItems } = useCart();
  const path = location.pathname;

  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurant-flags'],
    queryFn: () => base44.entities.Restaurant.list(),
    staleTime: 60000,
  });
  const enableFavorites = !!restaurants[0]?.enable_favorites;

  const navItems = [
    { to: '/', icon: Home, label: 'Cardápio' },
    { to: '/cart', icon: ShoppingCart, label: 'Carrinho', badge: totalItems },
    ...(enableFavorites ? [{ to: '/favorites', icon: Heart, label: 'Favoritos' }] : []),
    { to: '/orders', icon: ClipboardList, label: 'Meus Pedidos' },
    { to: '/admin', icon: Settings, label: 'Administração' },
  ];

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: '#fff',
      borderRight: '1px solid var(--gray-150)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 50,
      boxShadow: '2px 0 16px rgba(0,0,0,0.04)',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--purple-500), var(--purple-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(109,40,217,0.30)',
            flexShrink: 0,
          }}>
            <UtensilsCrossed style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
              Delivery
            </div>
            <div style={{ fontSize: 11, color: 'var(--purple-400)', fontWeight: 600, letterSpacing: '0.03em' }}>
              Boa comida, entrega rápida
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 12px', marginBottom: 8 }}>
          Menu Principal
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.to === '/' ? path === '/' : path.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                background: isActive ? 'var(--purple-50)' : 'transparent',
                color: isActive ? 'var(--purple-700)' : 'var(--gray-500)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
                position: 'relative',
              }}
            >
              <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  background: 'var(--purple-600)', color: '#fff',
                  fontSize: 10, fontWeight: 800, minWidth: 18, height: 18,
                  borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 5px',
                }}>
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: 'var(--purple-600)',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom hint */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-100)' }}>
        <div style={{ fontSize: 11, color: 'var(--gray-300)', lineHeight: 1.6 }}>
          🛵 Entregas rápidas na sua região
        </div>
      </div>
    </aside>
  );
}