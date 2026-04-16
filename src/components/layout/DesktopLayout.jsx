import React from 'react';
import { Outlet } from 'react-router-dom';
import DesktopSidebar from '../menu/DesktopSidebar';
import BottomNav from '../menu/BottomNav';

/**
 * DesktopLayout wraps customer-facing pages.
 * On mobile: shows bottom nav, no sidebar.
 * On desktop (≥ 1024px): shows sidebar, full-width content.
 */
export default function DesktopLayout() {
  return (
    <>
      {/* Sidebar — desktop only */}
      <div className="desktop-sidebar-wrap">
        <DesktopSidebar />
      </div>

      {/* Main content area */}
      <div className="desktop-main">
        <Outlet />
      </div>

      {/* Bottom nav — mobile only */}
      <div className="mobile-nav-wrap">
        <BottomNav />
      </div>

      <style>{`
        /* Mobile: normal flow */
        .desktop-sidebar-wrap { display: none; }
        .mobile-nav-wrap { display: block; }
        .desktop-main { }

        /* Desktop */
        @media (min-width: 1024px) {
          .desktop-sidebar-wrap { display: block; }
          .mobile-nav-wrap { display: none; }
          .desktop-main {
            margin-left: 240px;
            min-height: 100vh;
            background: var(--gray-50);
          }
        }
      `}</style>
    </>
  );
}