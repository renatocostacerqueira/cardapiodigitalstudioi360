import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ value, onChange, min = 1 }) {
  return (
    <div className="qty-selector">
      <button
        className="qty-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus style={{ width: 16, height: 16 }} />
      </button>
      <span className="qty-value">{value}</span>
      <button
        className="qty-btn"
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
        style={{
          borderColor: 'var(--purple-300)',
          color: 'var(--purple-600)',
          background: 'var(--purple-50)',
        }}
      >
        <Plus style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );
}