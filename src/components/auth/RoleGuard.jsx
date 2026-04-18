import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ShieldAlert } from 'lucide-react';

/**
 * Protects a route/component by role.
 * allowedRoles: array of roles that can access (e.g. ['admin', 'cozinha'])
 */
export default function RoleGuard({ allowedRoles, children }) {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', gap: 16, padding: 32, textAlign: 'center',
        background: 'var(--gray-50)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--r-full)',
          background: 'var(--red-50)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldAlert style={{ width: 32, height: 32, color: 'var(--red-500)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 6 }}>Acesso Negado</h2>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Você não tem permissão para acessar esta página.</p>
        </div>
        <a href="/" style={{
          padding: '10px 24px', borderRadius: 'var(--r-full)',
          background: 'var(--purple-600)', color: '#fff',
          fontWeight: 700, fontSize: 14, textDecoration: 'none',
        }}>
          Voltar ao início
        </a>
      </div>
    );
  }

  return children;
}