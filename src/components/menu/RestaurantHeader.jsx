import React from 'react';
import { UtensilsCrossed } from 'lucide-react';

export default function RestaurantHeader({ restaurant, variant = 'mobile' }) {
  if (!restaurant?.name) {
    // Fallback mobile greeting when no restaurant is configured yet
    if (variant === 'mobile') {
      return (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, paddingTop: 12 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--purple-400)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
              Boa comida, entrega rápida
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.04em', lineHeight: 1.15 }}>
              O que você quer<br />comer hoje? 🍽️
            </h1>
          </div>
          <div style={{
            width: 46, height: 46, borderRadius: 'var(--r-full)',
            background: 'linear-gradient(135deg, var(--purple-500), var(--purple-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, marginTop: 4, boxShadow: '0 4px 14px rgba(109,40,217,0.30)',
          }}>
            <UtensilsCrossed style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
        </div>
      );
    }
    return null;
  }

  if (variant === 'desktop') {
    return (
      <div style={{
        borderRadius: 'var(--r-2xl)',
        background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 55%, #7c3aed 100%)',
        padding: '36px 44px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', bottom: -60, right: 80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        {restaurant.logo ? (
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            style={{
              width: 92, height: 92, borderRadius: 'var(--r-xl)',
              objectFit: 'cover', flexShrink: 0, position: 'relative', zIndex: 1,
              border: '3px solid rgba(255,255,255,0.25)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          />
        ) : (
          <div style={{
            width: 92, height: 92, borderRadius: 'var(--r-xl)', flexShrink: 0,
            background: 'rgba(255,255,255,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
          }}>
            <UtensilsCrossed style={{ width: 40, height: 40, color: '#fff' }} />
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }}>
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, maxWidth: 640 }}>
              {restaurant.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Mobile
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      marginBottom: 22, paddingTop: 8,
    }}>
      {restaurant.logo ? (
        <img
          src={restaurant.logo}
          alt={restaurant.name}
          style={{ width: 54, height: 54, borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}
        />
      ) : (
        <div style={{
          width: 54, height: 54, borderRadius: 'var(--r-md)',
          background: 'linear-gradient(135deg, var(--purple-500), var(--purple-700))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 4px 14px rgba(109,40,217,0.30)',
        }}>
          <UtensilsCrossed style={{ width: 24, height: 24, color: '#fff' }} />
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--gray-900)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {restaurant.name}
        </h1>
        {restaurant.description && (
          <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {restaurant.description}
          </p>
        )}
      </div>
    </div>
  );
}