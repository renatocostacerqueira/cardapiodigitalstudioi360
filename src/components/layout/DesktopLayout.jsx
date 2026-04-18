import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../menu/BottomNav';

/**
 * DesktopLayout wraps customer-facing pages.
 * No sidebar — navigation is handled by FloatingCartButton and BottomNav.
 * On mobile: shows bottom nav.
 * On desktop: content fills full width.
 */
export default function DesktopLayout() {
  return (
    <>
      <Outlet />

      {/* Bottom nav — mobile only */}
      <div className="mobile-nav-wrap">
        <BottomNav />
      </div>

      <style>{`
        .mobile-nav-wrap { display: block; }

        @media (min-width: 1024px) {
          .mobile-nav-wrap { display: none; }
        }
      `}</style>
    </>
  );
}