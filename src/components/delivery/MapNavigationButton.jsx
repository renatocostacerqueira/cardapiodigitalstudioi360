import React from 'react';
import { Navigation, MapPin, ExternalLink } from 'lucide-react';

function buildAddress(order) {
  const parts = [
    order.address_street,
    order.address_number,
    order.address_neighborhood,
    order.address_city,
  ].filter(Boolean);
  return parts.join(', ');
}

function buildMapsUrl(address) {
  const encoded = encodeURIComponent(address);
  // Use universal Google Maps URL that works on mobile (opens app) and desktop (opens web)
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}

export default function MapNavigationButton({ order, compact = false }) {
  if (order.order_type !== 'delivery' || !order.address_street) return null;

  const address = buildAddress(order);
  const mapsUrl = buildMapsUrl(address);

  if (compact) {
    return (
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 'var(--r-full)',
          background: 'var(--blue-50)', border: '1px solid #bfdbfe',
          color: '#1d4ed8', fontSize: 12, fontWeight: 700,
          textDecoration: 'none', transition: 'background 0.15s',
        }}
      >
        <Navigation style={{ width: 13, height: 13 }} />
        Navegar
        <ExternalLink style={{ width: 11, height: 11, opacity: 0.6 }} />
      </a>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      {/* Address display */}
      <div style={{
        padding: '12px 14px', borderRadius: 'var(--r-md)',
        background: 'var(--gray-50)', border: '1px solid var(--gray-150)',
        marginBottom: 10,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <MapPin style={{ width: 16, height: 16, color: 'var(--purple-400)', flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5, fontWeight: 500 }}>
          {address}
          {order.address_complement && <div style={{ color: 'var(--gray-500)' }}>{order.address_complement}</div>}
          {order.address_reference && <div style={{ color: 'var(--gray-400)', fontStyle: 'italic', fontSize: 12, marginTop: 2 }}>📍 {order.address_reference}</div>}
        </div>
      </div>

      {/* Navigation button */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '11px 20px', borderRadius: 'var(--r-full)',
          background: '#1d4ed8', color: '#fff',
          fontSize: 14, fontWeight: 700, textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(29,78,216,0.30)',
          transition: 'background 0.15s',
        }}
      >
        <Navigation style={{ width: 16, height: 16 }} />
        Abrir Rota no Maps
        <ExternalLink style={{ width: 14, height: 14, opacity: 0.7 }} />
      </a>
    </div>
  );
}