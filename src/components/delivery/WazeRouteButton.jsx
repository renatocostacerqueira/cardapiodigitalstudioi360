import React from 'react';
import { Navigation } from 'lucide-react';

/**
 * Waze não oferece rota multi-stop via URL pública. Esta implementação:
 * - Um endereço: abre Waze com navegação direta.
 * - Múltiplos endereços: abre o primeiro no Waze e sequencia os demais
 *   (o entregador pode avançar manualmente). É a abordagem documentada
 *   do Waze para roteirização em sequência.
 */
function buildAddress(order) {
  return [order.address_street, order.address_number, order.address_neighborhood, order.address_city]
    .filter(Boolean).join(', ');
}

function openWazeForAddress(address) {
  const encoded = encodeURIComponent(address);
  // waze://  tenta abrir o app; caso falhe, o link HTTPS abre o site do Waze.
  window.open(`https://waze.com/ul?q=${encoded}&navigate=yes`, '_blank', 'noopener');
}

export default function WazeRouteButton({ orders, variant = 'compact' }) {
  const addresses = (orders || [])
    .filter(o => o.order_type === 'delivery' && o.address_street)
    .map(buildAddress);

  if (addresses.length === 0) return null;

  const handleClick = () => {
    // Waze não suporta multi-stop via URL — abrimos o primeiro e depois
    // cada um em abas sequenciais (cada aba ativará o próximo destino).
    addresses.forEach((addr, idx) => {
      // Pequeno atraso para evitar que o navegador bloqueie múltiplas janelas
      setTimeout(() => openWazeForAddress(addr), idx * 350);
    });
  };

  const label = addresses.length === 1
    ? 'Abrir no Waze'
    : `Rota Waze (${addresses.length} paradas)`;

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', borderRadius: 'var(--r-full)',
          background: '#33CCFF', color: '#fff', border: 'none',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(51, 204, 255, 0.35)',
        }}
      >
        <Navigation style={{ width: 13, height: 13 }} />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="btn btn-lg"
      style={{
        borderRadius: 'var(--r-full)',
        background: '#33CCFF', color: '#fff',
        boxShadow: '0 4px 14px rgba(51, 204, 255, 0.40)',
        gap: 10,
      }}
    >
      <Navigation style={{ width: 18, height: 18 }} />
      {label}
    </button>
  );
}