import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const path = location.pathname;

  const navItems = [
    { to: '/', icon: Home, label: 'Menu' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: totalItems },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/admin', icon: User, label: 'Admin' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = item.to === '/' ? path === '/' : path.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <div style={{ position: 'relative' }}>
              <Icon />
              {item.badge > 0 && <div className="nav-badge">{item.badge}</div>}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}