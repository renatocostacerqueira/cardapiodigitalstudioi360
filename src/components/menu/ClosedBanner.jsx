import React from 'react';
import { Lock } from 'lucide-react';

export default function ClosedBanner() {
  return (
    <div style={{
      marginBottom: 20,
      padding: '16px 18px',
      borderRadius: 'var(--r-lg)',
      background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
      border: '1.5px solid #fca5a5',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--r-md)',
        background: '#fff', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(220,38,38,0.15)',
      }}>
        <Lock style={{ width: 20, height: 20, color: 'var(--red-600)' }} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#991b1b', letterSpacing: '-0.01em' }}>
          Restaurante Fechado
        </div>
        <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 2 }}>
          Não estamos aceitando pedidos no momento. Volte em breve!
        </div>
      </div>
    </div>
  );
}